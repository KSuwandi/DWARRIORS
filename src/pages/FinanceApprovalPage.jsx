import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";
import {
  hasPermission,
} from "../utils/permissions";


import {
  collection,
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  doc,
  increment,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import { useAuth } from "../contexts/AuthContext";

import { db } from "../services/firebase/config";

export default function FinanceApprovalPage() {

  const { user, role } =
    useAuth();

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [filter, setFilter] =
    useState("Semua");

      const [activeTab, setActiveTab] =
  useState("finance");

const [returnRequests, setReturnRequests] =
  useState([]);


useEffect(() => {

  const canApproveFinance =
    hasPermission(
      role,
      "APPROVE_FINANCE"
    );

  if (
    !user ||
    !canApproveFinance
  ) {
    return;
  }

  const q = query(
    collectionGroup(
      db,
      "finance"
    ),
    orderBy(
      "createdAt",
      "desc"
    )
  );

  const unsubscribe =
    onSnapshot(
      q,
      (snapshot) => {

        const data =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ref: doc.ref,
              ...doc.data(),
            })
          );

        setTransactions(
          data.filter(
            (item) =>
              item.status ===
              "Pending"
          )
        );
      }
    );

  return () =>
    unsubscribe();

}, [
  user,
  role,
]);

  // =====================================
// RETURN REQUESTS
// =====================================

useEffect(() => {

  const q =
    query(
      collection(
        db,
        "borrowed_items"
      )
    );

  const unsubscribe =
    onSnapshot(
      q,
      (snapshot) => {

        const data =
          snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter(
              (item) =>
                item.status ===
                "Returned"
            );

            console.log(
  "RETURN REQUESTS:",
  data
);

        setReturnRequests(
          data
        );

      }
    );

  return () =>
    unsubscribe();

}, []);

// =====================================
// TOTAL BARANG
// =====================================

const getTotalItems = (items = []) => {

  return items.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

};

  // =====================================
  // FILTERED DATA
  // =====================================
  const filteredTransactions =
    useMemo(() => {

      if (
        filter === "Semua"
      ) {
        return transactions;
      }

      return transactions.filter(
        (item) =>
          item.type ===
            filter ||
          item.paymentType ===
            filter ||
          item.moneyType ===
            filter
      );

    }, [
      transactions,
      filter,
    ]);

 // =====================================
// APPROVE
// =====================================
const approveTransaction =
  async (ref) => {

    let financeData = null;

    try {

      await runTransaction(
        db,
        async (transaction) => {

          const financeDoc =
            await transaction.get(
              ref
            );

          if (
            !financeDoc.exists()
          ) {
            throw new Error(
              "Transaction not found"
            );
          }

         financeData =
  financeDoc.data();

console.log(
  "RETURN DATA",
  financeData
);

            financeData = financeDoc.data();

console.log(
  "FINANCE DATA:",
  financeData
);

let debtStatus = "Masih Hutang";

// =====================================
// AUTO TAMBAH INVENTORY
// =====================================

if (
  financeData.type === "Deposit" &&
  financeData.inventoryItemId
) {

  const inventoryRef = doc(
    db,
    "inventory",
    financeData.inventoryItemId
  );

  console.log(
  "QTY",
  financeData.quantity
);

  transaction.update(
    inventoryRef,
    {
      stock: increment(
        Number(
          financeData.quantity || 1
        )
      ),
    }
  );

}

// AUTO KURANGI INVENTORY SAAT WITHDRAW

if (
  financeData.type === "Withdraw" &&
  financeData.withdrawItems?.length
) {

  const inventoryDocs = [];

  for (const withdrawItem of financeData.withdrawItems) {

    const inventoryRef = doc(
      db,
      "inventory",
      withdrawItem.itemId
    );

    const inventoryDoc =
      await transaction.get(
        inventoryRef
      );

    inventoryDocs.push({
      ref: inventoryRef,
      doc: inventoryDoc,
      qty: withdrawItem.quantity,
      name: withdrawItem.itemName,
    });

  }

  for (const item of inventoryDocs) {

    if (!item.doc.exists()) {

      throw new Error(
        `${item.name} tidak ditemukan`
      );

    }

    const currentStock =
      Number(
        item.doc.data().stock || 0
      );

    if (
      currentStock <
      Number(item.qty)
    ) {

      throw new Error(
        `Stock ${item.name} tidak mencukupi`
      );

    }

  }

  for (const item of inventoryDocs) {

    transaction.update(
      item.ref,
      {
        stock: increment(
          -Number(item.qty)
        ),
      }
    );

  }

}



          if (
            financeData.status !==
            "Pending"
          ) {
            throw new Error(
              "Transaction already processed"
            );
          }

const debtRefs = [];

if (
  financeData.type === "Return" &&
  financeData.items?.length
) {

  for (const item of financeData.items) {

    if (item.transactionId) {

      const debtRef = doc(
        db,
        "finance_logs",
        item.transactionId
      );

      const debtDoc =
        await transaction.get(
          debtRef
        );

      debtRefs.push({
        ref: debtRef,
        doc: debtDoc,
      });

    }

  }

}

// =====================================
// RETURN BARANG
// =====================================

if (
  financeData.type === "Return" &&
  financeData.items?.length
) {

  debtStatus = "Lunas";

  for (const item of financeData.items) {

    const inventoryRef = doc(
      db,
      "inventory",
      item.itemId
    );

    transaction.update(
      inventoryRef,
      {
        stock: increment(
          Number(item.quantity)
        ),
      }
    );

  }

}

       if (
  financeData.type === "Return" &&
  financeData.items?.length
) {

  for (const debt of debtRefs) {

    transaction.update(
      debt.ref,
      {
        debtStatus: "Lunas",
        returnedAt:
          serverTimestamp(),
      }
    );

  }

}

 transaction.update(
  ref,
  {
    status:
      "Approved",

    debtStatus:
      financeData.type === "Return"
        ? debtStatus
        : "",

    approvedBy:
      user.rpName,

    approvedByUid:
      user.uid,

    approvedByRole:
      role,

    approvedAt:
      serverTimestamp(),
  }
);

          const financeLogRef =
            collection(
              db,
              "finance_logs"
            );

         transaction.set(
  doc(financeLogRef),
  {
    type: "finance",

    action: "Approved",

    debtStatus:
  financeData.type === "Return"
    ? debtStatus
    : financeData.debtStatus || "",

    requesterName:
  financeData.createdBy ||
  financeData.requesterName ||
  "",

    rpName:
  user?.rpName || "",

approverRole:
  role || "",

    role:
      financeData.role || "",

   transactionTitle:
  financeData.title ||
  "Pelunasan Hutang",

transactionType:
  financeData.type || "",

transactionId:
  financeData.transactionId || "",

items:
  financeData.items ||
  financeData.withdrawItems ||
  [],

  note:
  financeData.note || "",

paymentType:
  financeData.paymentType || "",

moneyType:
  financeData.moneyType || "",

amount:
  financeData.amount || 0,

    imageUrl:
      financeData.imageUrl || "",

    status:
      "Approved",

    createdAt:
      serverTimestamp(),
  }
);
        }
      );


      toast.success(
        "Transaksi berhasil di approve"
      );

    } catch (error) {

      console.error(
        error
      );

      toast.error(
        error.message ||
        "Gagal approve transaksi"
      );
    }
  };

  // =====================================
// REJECT
// =====================================
const rejectTransaction =
  async (ref) => {

    let financeData = null;

    try {

      await runTransaction(
        db,
        async (transaction) => {

          const financeDoc =
            await transaction.get(
              ref
            );

          if (
            !financeDoc.exists()
          ) {
            throw new Error(
              "Transaction not found"
            );
          }

          financeData =
            financeDoc.data();

            financeData = financeDoc.data();

console.log(
  "FINANCE DATA:",
  financeData
);

          if (
            financeData.status !==
            "Pending"
          ) {
            throw new Error(
              "Transaction already processed"
            );
          }

         transaction.update(
  ref,
  {
    status:
      "Rejected",

    rejectedBy:
      user.rpName,

    rejectedByUid:
      user.uid,

    rejectedByRole:
      role,

    rejectedAt:
      serverTimestamp(),
  }
);

          const financeLogRef =
            collection(
              db,
              "finance_logs"
            );

         transaction.set(
  doc(financeLogRef),
  {
    type: "finance",

    action: "Rejected",

    requesterName:
      financeData.createdBy ||
      financeData.requesterName ||
      "",

    rpName:
      user?.rpName || "",

    approverRole:
      role || "",

    role:
      financeData.role || "",

    transactionTitle:
      financeData.title ||
      "Pelunasan Hutang",

    transactionType:
      financeData.type || "",

    paymentType:
      financeData.paymentType || "",

    moneyType:
      financeData.moneyType || "",

    amount:
      financeData.amount || 0,

    items:
      financeData.items ||
      financeData.withdrawItems ||
      [],

    note:
  financeData.note || "",

    imageUrl:
      financeData.imageUrl || "",

    status:
      "Rejected",

    createdAt:
      serverTimestamp(),
  }
);
        }
      );

      toast.success(
        "Transaksi berhasil ditolak"
      );

    } catch (error) {

      console.error(
        error
      );

      toast.error(
        error.message ||
        "Gagal reject transaksi"
      );
    }
  };

  // =====================================
  // ACCESS DENIED
  // =====================================
const canApproveFinance =
  hasPermission(
    role,
    "APPROVE_FINANCE"
  );

if (
  !canApproveFinance
) {

  

  return (

    <AppLayout>

      <div className="flex items-center justify-center min-h-[70vh]">

        <div
          className="
            bg-[#111111]
            border
            border-red-500/20
            rounded-3xl
            p-10
            text-center
            text-white
          "
        >

          <h1
            className="
              text-4xl
              font-bold
              text-red-400
            "
          >
            ACCESS DENIED
          </h1>

          <p className="text-gray-400 mt-4">

            Hanya Leadership
            DWARRIORS yang dapat
            mengakses Finance Approval

          </p>

        </div>

      </div>

    </AppLayout>

  );

}
  return (

    <AppLayout>

      <div className="text-white w-full">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>

             <h1 className="text-5xl font-black">

  <span className="text-white">
    DWARRIORS
  </span>

  <span className="text-red-500 ml-3">
    ANNOUNCEMENTS
  </span>

</h1>

            <p className="text-gray-400 mt-2">
              Approval transaksi member DWARRIORS
            </p>

          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-6 py-4">

            <p className="text-sm text-gray-400">
              Total Pending
            </p>

            <h2 className="text-3xl font-bold text-yellow-300 mt-1">
              {
                filteredTransactions.length
              }
            </h2>

          </div>

        </div>

        {/* FILTER */}
        <div className="flex flex-wrap gap-3 mb-8">

          {[
            "Semua",
            "Pemasukan",
            "Pengeluaran",
            "Pembayaran Hutang",
            "Cash",
            "Hutang",
            "Uang Putih",
            "Uang Merah",
          ].map((type) => (

            <button
              key={type}
              onClick={() =>
                setFilter(type)
              }
              className={`px-5 py-3 rounded-2xl border transition-all ${
                filter === type
                  ? "bg-[#7A0019] border-[#7A0019]"
                  : "bg-[#111111] border-gray-700 hover:border-[#7A0019]/50"
              }`}
            >
              {type}
            </button>

          ))}

        </div>

        {/* TRANSACTIONS */}
        <div className="space-y-5">

          {filteredTransactions.map(
            (item) => (

              <div
                key={item.id}
                className="bg-[#111111] border border-yellow-500/20 rounded-3xl p-6"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* LEFT */}
                  <div>

                    <div className="flex items-center gap-3 flex-wrap">

                      <h2 className="text-2xl font-bold">
                        {item.createdAt && (

  <p className="text-xs text-gray-500 mt-2">

    {new Date(
      item.createdAt.seconds * 1000
    ).toLocaleString("id-ID")}

  </p>

)}
  {
    item.type === "Return"
      ? "Pelunasan Hutang"
      : item.title
  }
</h2>

                      {/* TYPE */}
                      <span
  className={`px-3 py-1 rounded-full text-xs font-semibold ${
    item.type === "Pemasukan"
      ? "bg-green-500/20 text-green-300"
      : item.type === "Pembayaran Hutang"
      ? "bg-yellow-500/20 text-yellow-300"
      : "bg-red-500/20 text-red-300"
  }`}
>
  {
    item.type === "Return"
      ? "Pelunasan Hutang"
      : item.type
  }
</span>

                      {/* STATUS */}
                      <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
                        Pending
                      </span>

                    </div>

                    {/* NOTE */}
                    <p className="text-gray-400 mt-3">
                      {item.note ||
                        "Tidak ada catatan"}
                    </p>

                    {item.type === "Withdraw" &&
 item.withdrawItems?.length > 0 && (

  <div className="mt-4">

    <p className="text-sm text-red-300 mb-2">
      Barang Yang Diambil
    </p>

    <ul className="space-y-1">

      {item.withdrawItems.map(
        (barang, index) => (

          <li
            key={index}
            className="text-gray-300"
          >
            • {barang.itemName}
            {" "}
            x
            {barang.quantity}
          </li>

        )
      )}

    </ul>

  </div>

)}

{item.type === "Return" &&
 item.items?.length > 0 && (

  <div className="mt-5">

    <div className="grid md:grid-cols-2 gap-6">

      {/* KIRI */}
      <div>

        <p className="text-sm font-semibold text-green-300 mb-3">
          Barang Yang Dikembalikan
        </p>

        <div className="space-y-2">

          {item.items.map(
            (barang, index) => (

              <div
                key={index}
                className="
                  bg-black/40
                  border
                  border-green-500/10
                  rounded-xl
                  px-4
                  py-3
                  flex
                  justify-between
                "
              >
                <span>
                  {barang.itemName}
                </span>

                <span className="text-green-400 font-bold">
                  x{barang.quantity}
                </span>

              </div>

            )
          )}

        </div>

      </div>

      {/* KANAN */}
      <div
        className="
          bg-green-950/20
          border
          border-green-500/20
          rounded-2xl
          p-5
        "
      >

        <p className="text-xs text-gray-400 uppercase">
          Pelunasan Hutang
        </p>

        <h3 className="text-3xl font-bold text-green-400 mt-2">
          {item.items?.length || 0}
        </h3>

        <p className="text-gray-400 text-sm">
          Barang Dikembalikan
        </p>

        <div className="mt-4 space-y-2">

          <div className="flex justify-between">
            <span className="text-gray-500">
              Nama
            </span>

            <span>
              {item.createdBy || item.requesterName}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">
              Role
            </span>

            <span className="text-red-300">
              {item.role}
            </span>
          </div>

        </div>

      </div>

    </div>

  </div>

)}

                    {item.imageUrl && (

  <img
    src={item.imageUrl}
    alt="Bukti"
    loading="lazy"
    className="
      mt-4
      w-72
      rounded-2xl
      border
      border-red-500/30
      object-cover
    "
  />

)}
                    
                    {/* DEBT INFO */}
{item.isDebtPayment && (

  <div className="mt-4 bg-black rounded-2xl p-4 border border-yellow-500/20">

    <p className="text-sm text-gray-400">
      Total Hutang Sebelum
    </p>

    <h3 className="text-xl font-bold text-yellow-300 mt-1">
      Rp{" "}
      {Number(
        item.previousDebt || 0
      ).toLocaleString(
        "id-ID"
      )}
    </h3>

    <p className="text-sm text-gray-400 mt-4">
      Sisa Hutang Setelah Dibayar
    </p>

    <h3 className="text-xl font-bold text-green-400 mt-1">
      Rp{" "}
      {Number(
        item.remainingDebt || 0
      ).toLocaleString(
        "id-ID"
      )}
    </h3>

  </div>

)}




                    {/* TAGS */}
                    <div className="flex flex-wrap gap-3 mt-4">

                      {/* PAYMENT TYPE */}
{item.paymentType && (
  <span className="bg-black px-4 py-2 rounded-xl text-sm text-gray-300">
    {item.paymentType}
  </span>
)}

{/* MONEY TYPE */}
{item.moneyType && (
  <span className="bg-black px-4 py-2 rounded-xl text-sm text-gray-300">
    {item.moneyType}
  </span>
)}

                      {/* CREATED BY */}
<span className="bg-black px-4 py-2 rounded-xl text-sm text-gray-300">
  By {item.createdBy || item.requesterName}
</span>

{item.type === "Return" && (
  <span className="bg-green-950/20 px-4 py-2 rounded-xl text-sm text-green-300">
    {item.items?.length || 0} Barang
  </span>
)}

<span className="bg-red-950/20 px-4 py-2 rounded-xl text-sm text-red-300">
  {item.role || "MEMBER"}
</span>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end gap-4">

                 {/* DEPOSIT */}

{item.type === "Deposit" && (

  <h3 className="text-4xl font-bold text-green-400">
    Rp{" "}
    {Number(
      item.amount || 0
    ).toLocaleString("id-ID")}
  </h3>

)}

{/* WITHDRAW */}

{item.type === "Withdraw" && (

  <div className="text-left">

    <p className="text-sm text-gray-400 mb-2">
      Barang Withdraw
    </p>

    <div className="space-y-2">

      {item.withdrawItems?.map(
        (barang, index) => (

          <div
            key={index}
            className="
              bg-black
              px-4
              py-2
              rounded-xl
              flex
              justify-between
            "
          >
            <span>
              {barang.itemName}
            </span>

            <span className="text-red-400 font-bold">
              x{barang.quantity}
            </span>

          </div>

        )
      )}

    </div>

  </div>

)}

{/* PELUNASAN HUTANG */}

{item.type === "Return" && (

  <div
    className="
      bg-green-950/20
      border
      border-green-500/20
      rounded-2xl
      p-5
      text-center
      min-w-[220px]
    "
  >

    <p className="text-xs text-gray-400 uppercase tracking-widest">
      Pembayaran
    </p>

    <h3 className="text-2xl font-bold text-green-400 mt-2">
      Hutang
    </h3>

    <p className="text-sm text-gray-300 mt-3">
      {item.items?.length || 0} Barang
    </p>

    <p className="text-xs text-gray-500 mt-1">
      Dikembalikan
    </p>

  </div>

)}

                    {/* BUTTONS */}
                    <div className="flex gap-3 flex-wrap">

                      <button
  onClick={() =>
    approveTransaction(
      item.ref
    )
  }
  className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-2xl font-semibold transition-all"
>
  Approve
</button>

                      {/* REJECT */}
                      <button
                        onClick={() =>
                          rejectTransaction(
                            item.ref
                          )
                        }
                        className="bg-red-700 hover:bg-red-800 px-5 py-3 rounded-2xl font-semibold transition-all"
                      >
                        Reject
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            )
          )}

          {/* EMPTY */}
          {filteredTransactions.length ===
            0 && (

            <div className="bg-[#111111] border border-dashed border-gray-700 rounded-3xl p-10 text-center text-gray-400">

              Tidak ada transaksi pending

            </div>

          )}

        </div>

      </div>

    </AppLayout>
  );
}