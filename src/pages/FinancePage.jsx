import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  limit,
  getDocs,
  startAfter,
  where,
  increment,
  getDoc,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";
import imageCompression from "browser-image-compression";
import { useAuth } from "../contexts/AuthContext";
import {
  hasPermission,
} from "../utils/permissions";
import { db } from "../services/firebase/config";


export default function FinancePage() {

  const { user, role } =
    useAuth();

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [
  inventoryItems,
  setInventoryItems,
] = useState([]);

const [
  withdrawItems,
  setWithdrawItems,
] = useState([]);

const [
  showInventoryDropdown,
  setShowInventoryDropdown,
] = useState(false);

const [
  inventorySearch,
  setInventorySearch,
] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
  useState(false);

  const [filter, setFilter] =
    useState("Semua");

  const [
    showWeaponPriceList,
    setShowWeaponPriceList,
  ] = useState(false);

  const [
    showDisnakerPriceList,
    setShowDisnakerPriceList,
  ] = useState(false);

  const currentPageLimit = 5;

  const [lastDoc, setLastDoc] =
  useState(null);

const [firstLoading, setFirstLoading] =
  useState(true);

const [hasMore, setHasMore] =
  useState(true);

  const [loadingMore, setLoadingMore] =
  useState(false);

 const [form, setForm] =
useState({
  type: "Deposit",
  paymentType: "Cash",
  moneyType: "Uang Putih",

  inventoryItemId: "",
  quantity: 1,

  title: "",
  amount: "",
  note: "",
  imageUrl: "",
});

  const [selectedPriceItem, setSelectedPriceItem] =
  useState("");

  const [activeTab, setActiveTab] =
  useState("DEPOSIT");

  const [
  showDebtModal,
  setShowDebtModal,
] = useState(false);

const [
  debtItems,
  setDebtItems,
] = useState([]);

const [
  selectedReturns,
  setSelectedReturns,
] = useState([]);

const [
  returnDescription,
  setReturnDescription,
] = useState("");


const loadDebtItems = async () => {

  try {

    const snapshot =
      await getDocs(
        query(
          collection(
            db,
            "finance_logs"
          ),

          where(
            "requesterName",
            "==",
            user.rpName
          ),

          where(
            "paymentType",
            "==",
            "Hutang"
          ),

          where(
            "transactionType",
            "==",
            "Withdraw"
          ),

          where(
            "status",
            "==",
            "Approved"
          )
        )
      );

    const data =
  snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter(
      (item) =>
        item.debtStatus !== "Lunas"
    );

    setDebtItems(data);

    console.log(
      "Debt Items:",
      data
    );

  } catch (error) {

    console.error(
      "Load hutang error:",
      error
    );

  }

};

  // =====================================
  // CREATE ACTIVITY LOG
  // =====================================
  const handleImageUpload =
  async (e) => {

    try {

      const file =
        e.target.files?.[0];

      if (!file) return;

      const allowed = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];

      if (
        !allowed.includes(
          file.type
        )
      ) {

        toast.error(
          "Format gambar tidak didukung"
        );

        return;
      }

      setUploadingImage(true);

      // COMPRESS IMAGE
      const compressedFile =
        await imageCompression(
          file,
          {
            maxSizeMB: 0.4,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
          }
        );

      const body =
        new FormData();

      body.append(
        "file",
        compressedFile
      );

      body.append(
        "upload_preset",
        "DWARRIORS"
      );

      const response =
        await fetch(
          "https://api.cloudinary.com/v1_1/dbn9lgdi4/image/upload",
          {
            method: "POST",
            body,
          }
        );

      const data =
        await response.json();

      if (!data.secure_url) {

        throw new Error(
          "Upload gagal"
        );
      } 

      setForm((prev) => ({
        ...prev,
       imageUrl:
      data.secure_url.replace(
    "/upload/",
    "/upload/f_auto,q_auto/"
  )
      }));

      toast.success(
        "Foto berhasil diupload"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Upload foto gagal"
      );

    } finally {

      setUploadingImage(false);
    }
  };

  

  const loadTransactions =
  async () => {

    try {

      if (!user) return;

      setFirstLoading(true);

      // QUERY FIRESTORE
      const q = query(

        collection(
          db,
          "users",
          user.uid,
          "finance"
        ),

        orderBy(
          "createdAt",
          "desc"
        ),

        limit(currentPageLimit)

      );

      // AMBIL DATA
      const snapshot =
        await getDocs(q);

      // UBAH DATA FIRESTORE
      // MENJADI ARRAY
      const data =
        snapshot.docs.map(
          (doc) => ({

            id: doc.id,

            ...doc.data(),

          })
        );

      // SIMPAN KE STATE
      setTransactions(data);

      // AMBIL DOCUMENT TERAKHIR
      const lastVisible =
        snapshot.docs[
          snapshot.docs.length - 1
        ];

      // SIMPAN lastDoc
      setLastDoc(lastVisible);

      // CEK MASIH ADA DATA ATAU TIDAK
      setHasMore(
        snapshot.docs.length ===
          currentPageLimit
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Gagal load transaksi"
      );

    } finally {

      setFirstLoading(false);

    }
    };

  useEffect(() => {

    if (!user) return;

  loadTransactions();

}, [user]);

useEffect(() => {

  const loadInventory =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "inventory"
            )
          );

        setInventoryItems(
          snapshot.docs.map(
            doc => ({
              id: doc.id,
              ...doc.data(),
            })
          )
        );

      } catch (error) {

        console.error(error);

      }

    };

  loadInventory();

}, []);

  const loadMoreTransactions =
  async () => {

    try {

      setLoadingMore(true);

      if (!lastDoc) return;

      const q = query(

        collection(
          db,
          "users",
          user.uid,
          "finance"
        ),

        orderBy(
          "createdAt",
          "desc"
        ),

        startAfter(lastDoc),

        limit(currentPageLimit)

      );

      const snapshot =
        await getDocs(q);

      const newData =
        snapshot.docs.map(
          (doc) => ({

            id: doc.id,

            ...doc.data(),

          })
        );

      // GABUNG DATA LAMA + BARU
      setTransactions((prev) => [
        ...prev,
        ...newData,
      ]);

      // UPDATE lastDoc
      const lastVisible =
        snapshot.docs[
          snapshot.docs.length - 1
        ];

      setLastDoc(lastVisible);

      // CEK MASIH ADA DATA?
      setHasMore(
        snapshot.docs.length ===
          currentPageLimit
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Gagal load data berikutnya"
      );

    } finally {

      setLoadingMore(false);

    }
};

  // =====================================
  // REALTIME TRANSACTIONS
  // =====================================

  // =====================================
  // TOTAL PEMASUKAN
  // =====================================
  const totalIncome =
    useMemo(() => {

      return transactions
        .filter(
          (item) =>
            item.type ===
              "Deposit" &&
            item.status ===
              "Approved"
        )
        .reduce(
          (acc, item) =>
            acc +
            Number(
              item.amount || 0
            ),
          0
        );

    }, [transactions]);

  // =====================================
  // TOTAL PENGELUARAN
  // =====================================
  const totalExpense =
    useMemo(() => {

      return transactions
        .filter(
          (item) =>
            item.type ===
              "Withdraw" &&
            item.status ===
              "Approved"
        )
        .reduce(
          (acc, item) =>
            acc +
            Number(
              item.amount || 0
            ),
          0
        );

    }, [transactions]);

  // =====================================
  // TOTAL HUTANG
  // =====================================
  const totalDebt = useMemo(() => {

  const totalHutang = transactions
    .filter((item) =>
      item.paymentType === "Hutang" &&
      item.type === "Withdraw" &&
      item.status === "Approved"
    )
    .reduce((acc, item) =>
      acc + Number(item.amount || 0),
    0);

  const pembayaranHutang = transactions
    .filter((item) =>
      item.type === "Pembayaran Hutang" &&
      item.status === "Approved"
    )
    .reduce((acc, item) =>
      acc + Number(item.amount || 0),
    0);

    return Math.max(
    totalHutang - pembayaranHutang,
    0
  );

  return totalHutang - pembayaranHutang;

}, [transactions]);

  // =====================================
  // TOTAL SALDO
  // =====================================
  const totalBalance =
    useMemo(() => {

      return (
        totalIncome -
        totalExpense
      );

    }, [
      totalIncome,
      totalExpense,
    ]);

  // =====================================
  // FILTER
  // =====================================
    const filteredInventoryItems =
  inventoryItems.filter((item) =>
    item.name
      ?.toLowerCase()
      .includes(
        inventorySearch.toLowerCase()
      )
  );

  const addWithdrawItem = (item) => {

  const existing =
    withdrawItems.find(
      (x) =>
        x.itemId === item.id
    );

  if (existing) {

    toast.error(
      "Barang sudah ditambahkan"
    );

    return;
  }

  setWithdrawItems((prev) => [

    ...prev,

    {
      itemId: item.id,
      itemName: item.name,
      quantity: 1,
    },

  ]);

};

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
            filter ||
          item.status ===
            filter
      );

    }, [
      transactions,
      filter,
    ]);

  // =====================================
  // PAGINATION
  // =====================================

  // =====================================
  // ADD TRANSACTION
  // =====================================
  const handleSubmit =
    async (e) => {

      e.preventDefault();

      if (!user) return;

      if (
  activeTab === "WITHDRAW" &&
  withdrawItems.length === 0
) {

  toast.error(
    "Pilih minimal 1 barang"
  );

  return;

}

      if (
        !form.title.trim()
      ) {

        toast.error(
          "Judul transaksi wajib diisi"
        );

        return;
      }

      if (
  activeTab === "DEPOSIT" &&
  !form.amount
) {

  toast.error(
    "Jumlah uang wajib diisi"
  );

  return;
}

      if (!form.note.trim()) {

        toast.error(
          "Catatan transaksi wajib diisi"
        );

        return;
      }

      if (
  activeTab === "DEPOSIT" &&
  !form.imageUrl
){

      toast.error(
        "Foto bukti deposit wajib diupload"
      );

      return;
    }

      const amount =
  activeTab === "DEPOSIT"
    ? Number(form.amount)
    : 0;

      if (
  activeTab === "DEPOSIT" &&
  amount <= 0
) {

        toast.error(
          "Jumlah uang tidak valid"
        );

        return;
      }

      try {

        setLoading(true);

        await addDoc(
          collection(
            db,
            "users",
            user.uid,
            "finance"
          ),
          {

            withdrawItems:
  activeTab === "WITHDRAW"
    ? withdrawItems
    : [],

inventoryItemId:
  form.inventoryItemId,

quantity:
  Number(form.quantity || 1),

            type:
  activeTab === "DEPOSIT"
    ? "Deposit"
    : "Withdraw",

            paymentType:
  activeTab === "WITHDRAW"
    ? "Hutang"
    : form.paymentType,

moneyType:
  activeTab === "WITHDRAW"
    ? ""
    : form.moneyType,

            role: 
              role || "",

            title:
              form.title.trim(),

            amount,

            note:
              form.note.trim(),

            imageUrl:
             form.imageUrl || "",

            createdBy:
              user.rpName ||
              "Unknown",

            createdByUid:
              user.uid,

            status:
              "Pending",

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
  `${activeTab} berhasil dikirim untuk approval`
);

       setForm({
  type: "Deposit",

  paymentType: "Cash",

  moneyType: "",

  inventoryItemId: "",

  quantity: 1,

  title: "",

  amount: "",

  note: "",

  imageUrl: "",
});

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Gagal menambahkan transaksi"
        );

      } finally {

        setLoading(false);
      }
    };

  // =====================================
  // Pengembalian Barang
  // =====================================
  const handleItemReturn =
    async () => {

      if (
        totalDebt <= 0
      ) {

        toast.error(
          "Tidak ada hutang"
        );

        return;
      }

      const input =
        prompt(
          `Masukkan nominal pembayaran hutang\n\nTotal Hutang: Rp ${totalDebt.toLocaleString(
            "id-ID"
          )}`
        );

      if (!input) return;

      const amount =
        Number(input);

      if (
  activeTab === "DEPOSIT" &&
  amount <= 0
) {

        toast.error(
          "Jumlah pembayaran tidak valid"
        );

        return;
      }

      if (
        amount >
        totalDebt
      ) {

        toast.error(
          "Pembayaran melebihi total hutang"
        );

        return;
      }

      try {

        setLoading(true);

        await addDoc(
          collection(
            db,
            "users",
            user.uid,
            "finance"
          ),
          {
            type:
                "Pengembalian Barang",

            role: 
              role || "",

            paymentType:
              "Cash",

            moneyType:
              "Uang Putih",

            title:
              "Pengembalian Barang",

            amount,

            remainingDebt:
              totalDebt - amount,

            previousDebt:
              totalDebt,

            isDebtPayment:
              true,

            note:
              `Request pembayaran hutang sebesar Rp ${amount.toLocaleString(
                "id-ID"
              )}`,

            createdBy:
              user.rpName ||
              "Unknown",

            createdByUid:
              user.uid,

            status:
              "Pending",

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Request pembayaran hutang berhasil dikirim"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Gagal request pembayaran hutang"
        );

      } finally {

        setLoading(false);
      }
    };

  // =====================================
  // APPROVE PAYMENT
  // =====================================
  const approvePayment = async (item) => {

  try {

   if (
  !hasPermission(
    role,
    "APPROVE_FINANCE"
  )
) {

  toast.error(
    "Tidak memiliki akses approval"
  );

  return;

}

    const transactionRef = doc(
      db,
      "users",
      item.createdByUid || user.uid,
      "finance",
      item.id
    );

    await updateDoc(
      transactionRef,
      {
        status: "Approved",
        approvedBy: user.rpName,
        approvedAt: serverTimestamp(),
      }
    );

   // ==========================
    // DEPOSIT
    // ==========================

    if (
      item.type === "Deposit" &&
      item.inventoryItemId
    ) {

      const inventoryRef = doc(
        db,
        "inventory",
        item.inventoryItemId
      );

      await updateDoc(
        inventoryRef,
        {
          stock: increment(
            Number(item.quantity || 1)
          ),
        }
      );

    }

    // ==========================
    // WITHDRAW
    // ==========================

    if (
      item.type === "Withdraw" &&
      item.withdrawItems?.length
    ) {

      for (const withdrawItem of item.withdrawItems) {

        const inventoryRef = doc(
          db,
          "inventory",
          withdrawItem.itemId
        );

        const inventorySnap =
          await getDoc(
            inventoryRef
          );

        if (!inventorySnap.exists()) {

          throw new Error(
            `${withdrawItem.itemName} tidak ditemukan`
          );

        }

        const stock =
          inventorySnap.data().stock || 0;

        if (
          stock <
          withdrawItem.quantity
        ) {

          throw new Error(
            `Stock ${withdrawItem.itemName} tidak mencukupi`
          );

        }

        await updateDoc(
          inventoryRef,
          {
            stock: increment(
              -withdrawItem.quantity
            ),
          }
        );

      }

    }

    toast.success(
      "Transaksi berhasil di approve"
    );

  } catch (error) {

    console.error(error);

    toast.error(
      error.message
    );

  }

};




  // =====================================
// DELETE TRANSACTION
// =====================================
const deleteTransaction = async (item) => {

  if (!user) return;

  if (
  !hasPermission(
    role,
    "DELETE_MEMBER"
  )
) {

  toast.error(
    "Tidak memiliki akses hapus"
  );

  return;

}

  // VALIDASI DATA
  if (!item?.id) {

  toast.error(
    "Data transaksi tidak valid"
  );

  return;
}

  // REMINDER DELETE
  const confirmDelete = window.confirm(
`⚠️ KONFIRMASI HAPUS TRANSAKSI

Judul:
${item.title}

Jumlah:
Rp ${Number(item.amount || 0).toLocaleString("id-ID")}

Pembuat:
${item.createdBy || "Unknown"}

Status:
${item.status || "-"}

⚠️ DATA YANG DIHAPUS TIDAK BISA DIKEMBALIKAN LAGI.

Klik OK untuk melanjutkan penghapusan.
Klik Cancel untuk membatalkan.`
  );

  // JIKA CANCEL
  if (!confirmDelete) {

    toast(
      "Penghapusan dibatalkan"
    );

    return;
  }

  try {

    setLoading(true);

    await deleteDoc(
  doc(
    db,
    "users",
    user.uid,
    "finance",
    item.id
  )
);

    // REFRESH DATA
    await loadTransactions();

    toast.success(
      "History berhasil dihapus"
    );

  } catch (error) {

    console.error(error);

    toast.error(
      "Gagal menghapus history"
    );

  } finally {

    setLoading(false);

  }
};
const submitItemReturn = async () => {

  if (selectedReturns.length === 0) {

    toast.error(
      "Pilih barang yang dikembalikan"
    );

    return;
  }

  try {

    await addDoc(
  collection(
    db,
    "users",
    user.uid,
    "finance"
  ),
      {
  type: "Return",

  paymentType: "Hutang",

  role: role || "",

  requesterUid: user.uid,

  requesterName: user.rpName,

  title: "Pengembalian Barang",

  note:
  returnDescription ||
  `Mengembalikan ${selectedReturns.length} item`,

  items: selectedReturns,

  debtStatus:
  activeTab === "WITHDRAW"
    ? "Masih Hutang"
    : "",

  status: "Pending",

  createdAt: serverTimestamp(),
}
    );

    toast.success(
      "Request pengembalian berhasil dikirim"
    );

    setSelectedReturns([]);

setReturnDescription("");

setShowDebtModal(false);

  } catch (error) {

    console.error(error);

    toast.error(
      "Gagal mengirim request"
    );

  }

};

  return (

    <AppLayout>

      <div className="text-white">

        {/* PRICE LIST SENJATA */}
{showWeaponPriceList && (

  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

    <div className="w-full max-w-5xl max-h-[90vh] bg-[#14091F] border border-red-700/40 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/50 flex flex-col">

      {/* HEADER */}
      
      <div className="bg-gradient-to-r from-red-900 to-violet-700 px-6 py-5 flex items-center justify-between flex-shrink-0">

        <div>

          <h2 className="text-3xl font-bold">
            PRICE LIST SENJATA
          </h2>

          <p className="text-red-200 text-sm mt-1">
            DWARRIORS Family
          </p>

        </div>

        <button
          onClick={() => setShowWeaponPriceList(false)}
          className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-xl text-xl transition-all"
        >
          ✕
        </button>

      </div>

      {/* CONTENT */}
      <div className="p-6 overflow-y-auto">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="bg-gradient-to-r from-red-800 to-violet-700 text-white">

                <th className="p-4 text-left border border-red-500">
                  BARANG
                </th>

                <th className="p-4 text-left border border-red-500">
                  UANG MERAH
                </th>

                <th className="p-4 text-left border border-red-500">
                  UANG PUTIH
                </th>

              </tr>

            </thead>

            <tbody>

              {[
                {
                  item: "PELURU 9MM",
                  merah: "150.000/clip [ISI 150x]",
                  putih: "150.000/clip [ISI 150x]",
                },
                {
                  item: "PELURU .44 (MAGNUM)",
                  merah: "70.000/clip [ISI 50x]",
                  putih: "70.000/clip [ISI 50x]",
                },
                {
                  item: "PELURU Double Action",
                  merah: "75.000/clip [ISI 50x]",
                  putih: "75.000/clip [ISI 50x]",
                },
                {
                  item: "PELURU 7.62 (AK-47)",
                  merah: "-",
                  putih: "-",
                },
                {
                  item: "PELURU .50 BMG (SNIPER)",
                  merah: "-",
                  putih: "-",
                },
                {
                  item: "VEST PULAU",
                  merah: "80.000/pcs (MAX 4)",
                  putih: "70.000/pcs (MAX 4)",
                },
                {
                  item: "COMBAT PISTOL",
                  merah: "200.000",
                  putih: "180.000",
                },
                {
                  item: "SMG MK2",
                  merah: "500.000",
                  putih: "450.000",
                },
                {
                  item: "MINI SMG",
                  merah: "450.000",
                  putih: "415.000",
                },
                {
                  item: "PYTHON",
                  merah: "400.000",
                  putih: "360.000",
                },
                {
                  item: "AK 47",
                  merah: "650.000",
                  putih: "585.000",
                },
                {
                  item: "HEAVY SNIPER",
                  merah: "1.250.000",
                  putih: "1.125.000",
                },
                {
                  item: "DOUBLE ACTION",
                  merah: "450.000",
                  putih: "370.000",
                },
                {
                  item: "WM",
                  merah: "150.000",
                  putih: "130.000",
                },
              ].map((row, index) => (

                <tr
                  key={index}
                  className="bg-[#1A1028] hover:bg-[#241437] transition-all"
                >

                  <td className="p-4 border border-red-900/40 font-semibold">
                    {row.item}
                  </td>

                  <td className="p-4 border border-red-900/40 text-red-300">
                    {row.merah}
                  </td>

                  <td className="p-4 border border-red-900/40 text-yellow-200">
                    {row.putih}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* PACKAGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">

          <div className="bg-gradient-to-br from-red-900/40 to-red-900/40 border border-red-500/30 rounded-3xl p-5">

            <h3 className="text-xl font-bold text-red-300">
              1 SET FULL CASH UNGMER
            </h3>

            <p className="text-sm text-gray-300 mt-2">
              PYTHON / MK2 / WM / CLIP / VEST
            </p>

            <p className="text-4xl font-black mt-3">
              Rp 1.590.000
            </p>

          </div>

          <div className="bg-gradient-to-br from-yellow-700/30 to-red-900/40 border border-yellow-400/30 rounded-3xl p-5">

            <h3 className="text-xl font-bold text-yellow-200">
              1 SET FULL CASH UNGPUT
            </h3>

            <p className="text-sm text-gray-300 mt-2">
              PYTHON / MK2 / WM / CLIP / VEST
            </p>

            <p className="text-4xl font-black mt-3">
              Rp 1.300.000
            </p>

          </div>

          <div className="bg-gradient-to-br from-red-900/40 to-red-900/40 border border-red-500/30 rounded-3xl p-5">

            <h3 className="text-xl font-bold text-red-300">
              1 SET PYTHON UANG MERAH
            </h3>

            <p className="text-4xl font-black mt-3">
              Rp 790.000
            </p>

          </div>

          <div className="bg-gradient-to-br from-yellow-700/30 to-red-900/40 border border-yellow-400/30 rounded-3xl p-5">

            <h3 className="text-xl font-bold text-yellow-200">
              1 SET PYTHON UANG PUTIH
            </h3>

            <p className="text-4xl font-black mt-3">
              Rp 710.000
            </p>

          </div>

        </div>

      </div>

    </div>

  </div>

)}

        {/* PRICE LIST DISNAKER */}
        {showDisnakerPriceList && (

          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="w-full max-w-4xl bg-[#14091F] border border-red-700/40 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/50">

              <div className="bg-gradient-to-r from-red-900 to-violet-700 px-6 py-5 flex items-center justify-between">

                <div>

                  <h2 className="text-3xl font-bold">
                    PRICE LIST DISNAKER
                  </h2>

                  <p className="text-red-200 text-sm mt-1">
                    DWARRIORS Family
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowDisnakerPriceList(false)
                  }
                  className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-xl text-xl"
                >
                  ✕
                </button>

              </div>

              <div className="p-6 overflow-auto max-h-[80vh]">

                <div className="overflow-x-auto">

                  <table className="w-full border-collapse">

                  <thead>

  <tr className="bg-gradient-to-r from-red-800 to-violet-700 text-white">

    <th className="p-4 text-left border border-red-500">
      NAMA BARANG
    </th>

    <th className="p-4 text-center border border-red-500">
      /PAKET
    </th>

    <th className="p-4 text-left border border-red-500">
      HARGA
    </th>

  </tr>

</thead>

<tbody>

  {[
    {
      paket: "KAIN",
      perPaket: "80",
      harga: "Rp16.000",
    },
    {
      paket: "BAJU",
      perPaket: "40",
      harga: "Rp17.000",
    },
    {
      paket: "PAKETAN TAMBANG",
      perPaket: "100",
      harga: "Rp6.000",
    },
    {
      paket: "ALUMINIUM POWDER",
      perPaket: "100",
      harga: "Rp12.000",
    },
    {
      paket: "IRON POWDER",
      perPaket: "100",
      harga: "Rp12.000",
    },
    {
      paket: "METALSCRAP",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "ALUMINIUM",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "BERLIAN",
      perPaket: "1",
      harga: "Rp3.000",
    },
    {
      paket: "KACA",
      perPaket: "100",
      harga: "Rp25.000",
    },
    {
      paket: "BOTOL",
      perPaket: "100",
      harga: "Rp25.000",
    },
    {
      paket: "PLASTIK",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "KARET",
      perPaket: "100",
      harga: "Rp12.000",
    },
    {
      paket: "KARUNG",
      perPaket: "100",
      harga: "Rp12.000",
    },
    {
      paket: "BAJA",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "KAYU KEMASAN",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "KOTORAN HEWAN",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "KULIT BABI",
      perPaket: "36",
      harga: "Rp18.000",
    },
    {
      paket: "KULIT RUSA",
      perPaket: "16",
      harga: "Rp15.000",
    },
    {
      paket: "KULIT SINGA",
      perPaket: "1",
      harga: "Rp3.000",
    },
    {
      paket: "KULIT JADI",
      perPaket: "1",
      harga: "Rp800",
    },
    {
      paket: "BULU AYAM",
      perPaket: "100",
      harga: "Rp15.000",
    },
    {
      paket: "BULU BABI",
      perPaket: "100",
      harga: "Rp15.000",
    },
    {
      paket: "BULU RUBAH",
      perPaket: "100",
      harga: "Rp30.000",
    },
  ].map((row, index) => (

    <tr
      key={index}
      className="bg-[#1A1028] hover:bg-[#241437]"
    >

      <td className="p-4 border border-red-900/40 font-semibold">
        {row.paket}
      </td>

      <td className="p-4 border border-red-900/40 text-center text-cyan-200">
        {row.perPaket}
      </td>

      <td className="p-4 border border-red-900/40 text-yellow-200">
        {row.harga}
      </td>

    </tr>

  ))}

</tbody>

                    
                  </table>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* HEADER */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

  <div>

    <div className="flex items-start justify-between flex-wrap gap-4">

  <div>

    <h1 className="text-4xl font-black tracking-tight">

      <span className="text-red-500">
        WITHDRAW
      </span>

      {" "}

      <span className="text-white">
        AND DEPOSIT
      </span>

    </h1>

  </div>

  <div className="flex items-center gap-3">

    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        hasPermission(
          role,
          "APPROVE_FINANCE"
        )
          ? "bg-red-500/20 text-red-300 border-red-500/30"
          : "bg-[#1A1330] text-gray-300 border-red-900/40"
      }`}
    >
      {role}
    </span>

    <button
      onClick={async () => {

        await loadDebtItems();

        setShowDebtModal(true);

      }}
      className="
        bg-red-600
        hover:bg-red-700
        px-5
        py-2
        rounded-xl
        font-semibold
        transition-all
      "
    >
      PENGEMBALIAN BARANG
    </button>

  </div>

</div>

    <p className="text-gray-400 mt-2 text-sm">
      Manage Deposit, Withdraw, and Return Operations
    </p>

  </div>

 

</div>

{/* STATISTIC CARDS */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

  {/* TOTAL PEMASUKAN */}
  <div className="
bg-gradient-to-br
from-black
to-[#220000]
border
border-red-500/20
rounded-3xl
p-5
">

    <p className="text-sm text-gray-400">
      Total Deposit
    </p>

    <h2 className="text-3xl font-black text-green-400 mt-2">
      Rp{" "}
      {totalIncome.toLocaleString(
        "id-ID"
      )}
    </h2>

  </div>

</div>

<div
  className="
    flex
    gap-2
    mb-6
  "
>

{[
  "DEPOSIT",
  "WITHDRAW",
].map((tab) => (

    <button
      key={tab}
      onClick={() =>
        setActiveTab(tab)
      }
      className={`
        px-5
        py-3
        rounded-2xl
        font-bold
        transition-all

        ${
          activeTab === tab
? "bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-900/40"
: "bg-black border border-red-900/30"
        }
      `}
    >

      {tab}

    </button>

  ))}

</div>

                {/* FORM */}
                {
  activeTab === "DEPOSIT" && (
    
        <form
          onSubmit={
            handleSubmit
          }
          className="
bg-gradient-to-br
from-black
via-[#120000]
to-[#1a0000]
border
border-red-700/40
rounded-3xl
p-6
mb-6
shadow-xl
shadow-red-900/20
"
        >
          <h2 className="
text-3xl
font-black
mb-6
text-transparent
bg-clip-text
bg-gradient-to-r
from-red-500
to-white
tracking-wide
">
  DEPOSIT FORM
</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">

            <select
              value={
                form.paymentType
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentType:
                    e.target
                      .value,
                })
              }
              className="bg-black/70 border border-red-700/40 rounded-2xl px-4 py-3 outline-none focus:border-red-400"
            >

              <option>
                Cash
              </option>

              <option>
                Hutang
              </option>

            </select>

            <select
  value={form.moneyType}
  onChange={(e) => {

    const moneyType =
      e.target.value;

    setForm(prev => {

      let amount =
        prev.amount;

      if (selectedPriceItem) {

        const selectedItem =
          PRICE_LIST.find(
            item =>
              item.title ===
              selectedPriceItem
          );

        if (selectedItem) {

          amount =
            moneyType === "Uang Merah"
              ? selectedItem.merah
              : selectedItem.putih;

        }

      }

      return {
        ...prev,
        moneyType,
        amount,
      };

    });

  }}
  className="bg-black/70 border border-red-700/40 rounded-2xl px-4 py-3 outline-none focus:border-red-400"
>

  <option>
    Uang Putih
  </option>

  <option>
    Uang Merah
  </option>

</select>

     {activeTab === "DEPOSIT" && (

<div className="relative">

  <button
    type="button"
    onClick={() =>
      setShowInventoryDropdown(
        !showInventoryDropdown
      )
    }
    className="
      w-full
      bg-black/70
      border
      border-red-700/40
      rounded-2xl
      px-4
      py-3
      text-left
      hover:border-red-500
      transition-all
    "
  >

    {form.inventoryItemId
      ? inventoryItems.find(
          item =>
            item.id ===
            form.inventoryItemId
        )?.name
      : "Pilih Barang Inventory"}

  </button>

  {showInventoryDropdown && (

    <div
  className="
    absolute
    top-full
    left-0
    mt-2
    w-full
    bg-black
    border
    border-red-700/40
    rounded-2xl
    shadow-2xl
    shadow-red-900/40
    z-50
  "
>

      <div className="p-3 border-b border-red-700/40">

        <input
          type="text"
          placeholder="Cari Barang..."
          value={inventorySearch}
          onChange={(e) =>
            setInventorySearch(
              e.target.value
            )
          }
          className="
            w-full
            bg-black/70
            border
            border-red-700/40
            rounded-xl
            px-3
            py-2
            outline-none
            focus:border-red-400
          "
        />

      </div>

      <div
        className="
          max-h-72
          overflow-y-auto
        "
      >

        {filteredInventoryItems.map(
          (item) => (

            <button
              key={item.id}
              type="button"
              onClick={() => {

                setForm(prev => ({
                  ...prev,
                  inventoryItemId:
                    item.id,
                  title:
                    item.name,
                }));

                setShowInventoryDropdown(
                  false
                );

              }}
              className="
                w-full
                text-left
                px-4
                py-3
                hover:bg-red-700/20
                border-b
                border-red-900/20
                transition-all
              "
            >

              <div className="font-semibold">
                {item.name}
              </div>

              <div className="text-xs text-gray-400">
                Stock :
                {" "}
                {item.stock || 0}
              </div>

            </button>

          )
        )}

      </div>

    </div>

  )}

</div>

)}


            <input
              type="text"
              placeholder="Judul Transaksi"
              value={
                form.title
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  title:
                    e.target
                      .value,
                })
              }
              className="bg-black/70 border border-red-700/40 rounded-2xl px-4 py-3 outline-none focus:border-red-400"
            />

            <input
              type="number"
              placeholder="Harga"
              value={
                form.amount
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  amount:
                    e.target
                      .value,
                })
              }
              className="bg-black/70 border border-red-700/40 rounded-2xl px-4 py-3 outline-none focus:border-red-400"
            />
            {activeTab === "DEPOSIT" && (

  <input
    type="number"
    min="1"
    placeholder="Quantity"
    value={form.quantity}
    onChange={(e) =>
      setForm({
        ...form,
        quantity: e.target.value,
      })
    }
    className="bg-black/70 border border-red-700/40 rounded-2xl px-4 py-3 outline-none focus:border-red-400"
  />

)}

          </div>

          {/* FOTO DEPOSIT */}
{form.type ===
  "Deposit" && (

  <div className="mt-4">

    <label className="text-sm text-gray-300 block mb-2">

      Upload Bukti Deposit

    </label>

    <input
      type="file"
      accept="image/*"
      onChange={
        handleImageUpload
      }
      className="w-full bg-black/70 border border-red-700/40 rounded-2xl px-4 py-3"
    />

    {uploadingImage && (

      <p className="text-sm text-red-300 mt-2">
        Uploading...
      </p>

    )}

    {form.imageUrl && (

      <img
        src={
          form.imageUrl
        }
        alt="preview"
        className="mt-4 w-48 rounded-2xl border border-red-500/30"
      />

    )}

  </div>

)}


          <textarea
            placeholder="Catatan transaksi..."
            value={
              form.note
            }
            onChange={(e) =>
              setForm({
                ...form,
                note:
                  e.target
                    .value,
              })
            }
            className="w-full mt-4 bg-black/70 border border-red-700/40 rounded-2xl px-4 py-3 min-h-[110px] outline-none focus:border-red-400"
          />

          <button
            type="submit"
            disabled={
              loading
            }
           className="
mt-5
bg-gradient-to-r
from-red-700
via-red-600
to-red-500
hover:scale-105
transition-all
duration-300
rounded-2xl
px-8
py-3
font-bold
shadow-xl
shadow-red-900/40
"
          >
            {loading
              ? "Menyimpan..."
              : "Simpan Transaksi"}
          </button>

        </form>
          )
}

{
  activeTab === "WITHDRAW" && (

    <form
      onSubmit={handleSubmit}
      className="
bg-gradient-to-br
from-black
via-[#120000]
to-[#1a0000]
border
border-red-700/40
rounded-3xl
p-6
mb-6
shadow-xl
shadow-red-900/20
"
    >

          <h2 className="
text-3xl
font-black
mb-6
text-transparent
bg-clip-text
bg-gradient-to-r
from-red-500
to-white
tracking-wide
">
  WITHDRAW FORM
</h2>

          <div
  className="
    grid
    grid-cols-1
    lg:grid-cols-12
    gap-4
  "
>

            <div
  className="
    lg:col-span-3
    bg-black/70
    border
    border-red-700/40
    rounded-2xl
    px-4
    py-3
    h-[72px]
    flex
    flex-col
    justify-center
  "
>

  <p className="text-gray-400 text-sm">
    Status
  </p>

  <p className="font-bold text-red-400">
    Hutang
  </p>

</div>

     {activeTab === "WITHDRAW" && (

<div
  className="
    relative
    lg:col-span-4
  "
>

  <button
    type="button"
    onClick={() =>
      setShowInventoryDropdown(
        !showInventoryDropdown
      )
    }
   className="
  w-full
  h-[72px]
  bg-black/70
  border
  border-red-700/40
  rounded-2xl
  px-4
  text-left
  hover:border-red-500
  transition-all
"
  >

    {form.inventoryItemId
      ? inventoryItems.find(
          item =>
            item.id ===
            form.inventoryItemId
        )?.name
      : "Pilih Barang Inventory"}

  </button>

  {showInventoryDropdown && (

    <div
  className="
    absolute
    top-full
    left-0
    mt-2
    w-full
    bg-black
    border
    border-red-700/40
    rounded-2xl
    shadow-2xl
    shadow-red-900/40
    z-50
  "
>

      <div className="p-3 border-b border-red-700/40">

        <input
          type="text"
          placeholder="Cari Barang..."
          value={inventorySearch}
          onChange={(e) =>
            setInventorySearch(
              e.target.value
            )
          }
          className="
            w-full
            bg-black/70
            border
            border-red-700/40
            rounded-xl
            px-3
            py-2
            outline-none
            focus:border-red-400
          "
        />

      </div>

      <div
        className="
          max-h-72
          overflow-y-auto
        "
      >

        {filteredInventoryItems.map(
          (item) => (

            <button
              key={item.id}
              type="button"
              onClick={() => {

  addWithdrawItem(item);

  setShowInventoryDropdown(false);

}}
              className="
                w-full
                text-left
                px-4
                py-3
                hover:bg-red-700/20
                border-b
                border-red-900/20
                transition-all
              "
            >

              <div className="font-semibold">
                {item.name}
              </div>

              <div className="text-xs text-gray-400">
                Stock :
                {" "}
                {item.stock || 0}
              </div>

            </button>

          )
        )}

      </div>

    </div>

  )}

</div>

)}


            <input
  type="text"
  placeholder="Judul Transaksi"
  value={form.title}
  onChange={(e) =>
    setForm({
      ...form,
      title: e.target.value,
    })
  }
  className="
    lg:col-span-5
    bg-black/70
    border
    border-red-700/40
    rounded-2xl
    px-4
    py-3
    outline-none
    focus:border-red-400
  "
/>

          

          </div>

          <div className="mt-4 space-y-3">

  {withdrawItems.map(
    (item, index) => (

      <div
        key={index}
        className="
          flex
          justify-between
          items-center
          bg-black/70
          border
          border-red-700/40
          rounded-2xl
          p-3
        "
      >

        <div>

          <p className="font-semibold">
            {item.itemName}
          </p>

        </div>

        <div className="flex gap-2">

          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => {

              const qty =
                Number(
                  e.target.value
                );

              setWithdrawItems(
                (prev) =>
                  prev.map(
                    (x) =>
                      x.itemId ===
                      item.itemId
                        ? {
                            ...x,
                            quantity: qty,
                          }
                        : x
                  )
              );

            }}
            className="
              w-20
              bg-black
              rounded-xl
              px-3
              py-2
            "
          />

          <button
            type="button"
            onClick={() => {

              setWithdrawItems(
                (prev) =>
                  prev.filter(
                    (x) =>
                      x.itemId !==
                      item.itemId
                  )
              );

            }}
            className="
              bg-red-600
              px-3
              py-2
              rounded-xl
            "
          >
            ✕
          </button>

        </div>

      </div>

    )
  )}

</div>

          <textarea
            placeholder="Catatan transaksi..."
            value={
              form.note
            }
            onChange={(e) =>
              setForm({
                ...form,
                note:
                  e.target
                    .value,
              })
            }
            className="w-full mt-4 bg-black/70 border border-red-700/40 rounded-2xl px-4 py-3 min-h-[110px] outline-none focus:border-red-400"
          />

          <button
            type="submit"
            disabled={
              loading
            }
            className="
mt-5
bg-gradient-to-r
from-red-700
via-red-600
to-red-500
hover:scale-105
transition-all
duration-300
rounded-2xl
px-8
py-3
font-bold
shadow-xl
shadow-red-900/40
"
          >
            {loading
              ? "Menyimpan..."
              : "Simpan Transaksi"}
          </button>

        </form>
  )
}
        {/* FILTER */}
        <div
  className="
    flex
    flex-wrap
    gap-2
    mb-6
    p-3
    bg-black/40
    border
    border-red-900/30
    rounded-3xl
    backdrop-blur-sm
    shadow-lg
    shadow-red-900/20
  "
>

          {[
            "Semua",
            "Deposit",
            "Withdraw",
            "Cash",
            "Hutang",
            "Uang Putih",
            "Uang Merah",
            "Pending",
            "Approved",
          ].map((type) => (

            <button
              key={type}
              onClick={() => {

  setFilter(type);

}}
              className={`px-5
py-2.5
rounded-2xl
font-semibold
text-sm
border
transition-all
duration-300
hover:scale-105 ${
                filter === type
 ? `
   bg-gradient-to-r
   from-red-700
   via-red-600
   to-red-500
   border-transparent
   shadow-lg
   shadow-red-900/40
   text-white
 `
 : `
   bg-black/80
   border-red-700/40
   hover:border-red-500
   hover:bg-red-950/30
   text-gray-300
 `
              }`}
            >
              {type}
            </button>

          ))}

        </div>

        

        {/* HISTORY */}
        <div className="space-y-4">

          {filteredTransactions.map(
            (item) => (

              <div
                key={item.id}
                className="
bg-gradient-to-br
from-black
via-[#120000]
to-[#180000]
border
border-red-700/30
rounded-3xl
p-5
hover:border-red-500/40
transition-all
"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* LEFT */}
                  <div className="flex-1">

                    <div className="flex items-center gap-2 flex-wrap">

                      <h2 className="text-xl font-bold">
                        {
                          item.title
                        }
                      </h2>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.type ===
                          "Deposit"
                            ? "bg-green-500/20 text-green-300"
                            : item.type ===
                              "Pembayaran Hutang"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {
                          item.type
                        }
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status ===
                          "Approved"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {
                          item.status
                        }
                      </span>

                    </div>

                    <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                      {item.note ||
                        "Tidak ada catatan"}
                    </p>
                    {item.imageUrl && (

  <img
  loading="lazy"
  src={item.imageUrl}
    alt="bukti"
    className="mt-4 w-56 rounded-2xl border border-red-500/30 object-cover"
  />

)}



                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-start lg:items-end gap-3">

                    {item.type === "Deposit" && (

  <h3 className="text-3xl font-bold text-green-400">
    + Rp{" "}
    {Number(
      item.amount || 0
    ).toLocaleString("id-ID")}
  </h3>

)}

                    <div className="flex gap-2 flex-wrap">

                      {/* APPROVE */}
                      {
hasPermission(
  role,
  "APPROVE_FINANCE"
) &&
item.status === "Pending" && (

                        <button
                          onClick={() =>
                            approvePayment(item)
                          }
                          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-sm transition-all"
                        >
                          Approve
                        </button>

                      )}

                      {/* DELETE */}
                      {
hasPermission(
  role,
  "DELETE_MEMBER"
) && (

                        <button
  onClick={() =>
    deleteTransaction(item)
  }
  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm transition-all"
>
  Hapus
</button>

                      )}

                    </div>

                  </div>

                </div>

              </div>
            )
          )}

          {/* EMPTY */}
          {filteredTransactions.length ===
            0 && (

            <div className="bg-[#141021] border border-dashed border-red-700/40 rounded-3xl p-10 text-center text-gray-400">

              Tidak ada history transaksi

            </div>

          )}
          {/* LOAD MORE */}
{hasMore && (

  <div className="flex justify-center mt-6">

    <button
  onClick={loadMoreTransactions}
  disabled={loadingMore}
  className="bg-red-700 hover:bg-red-800 disabled:opacity-50 transition-all px-6 py-3 rounded-2xl font-semibold"
>
  {loadingMore
    ? "Loading..."
    : "Load More"}
</button>

  </div>

)}

        </div>

        {showDebtModal && (

<div
  className="
    fixed
    inset-0
    z-50
    bg-black/80
    flex
    items-center
    justify-center
    p-4
  "
>

  <div
  className="
    w-full
    max-w-5xl
    h-[85vh]
    bg-[#141021]
    border
    border-red-500/20
    rounded-3xl
    overflow-hidden
    flex
    flex-col
    shadow-2xl
    shadow-red-900/30
  "
>

    <div
  className="
    flex
    items-center
    justify-between
    px-6
    py-5
    border-b
    border-red-700/40
    bg-gradient-to-r
    from-red-950
    via-[#1A1028]
    to-red-950
  "
>

  <div>

    <h2 className="text-2xl font-black">
      PENGEMBALIAN BARANG
    </h2>

    <p className="text-gray-400 text-sm mt-1">
      Pilih barang yang ingin dikembalikan
    </p>

  </div>

  <button
    onClick={() =>
      setShowDebtModal(false)
    }
    className="
      w-10
      h-10
      rounded-xl
      bg-red-600/20
      hover:bg-red-600
      transition-all
    "
  >
    ✕
  </button>

</div>

   <div
  className="
    flex-1
    overflow-y-auto
    p-6
    space-y-4
  "
>

      {debtItems.map((debt) => (

        <div
          key={debt.id}
          className="
  bg-gradient-to-br
  from-[#0F0B18]
  to-[#191126]
  border
  border-red-900/20
  rounded-3xl
  p-5
  hover:border-red-500/30
  transition-all
"
        >

          <div className="flex justify-between items-center mb-4">

  <div>

    <h3 className="font-bold text-lg">
      {debt.transactionTitle}
    </h3>

    <p className="text-xs text-gray-400">
      {debt.items?.length || 0} Barang
    </p>

  </div>

  <span
    className="
      px-3
      py-1
      rounded-full
      bg-red-500/20
      text-red-300
      text-xs
    "
  >
    Hutang
  </span>

</div>

          {debt.items?.map((item) => (

  <label
    key={item.itemId}
    className="
      flex
      justify-between
      items-center
      py-2
      cursor-pointer
    "
  >

    <div className="flex items-center gap-3">

      <input
        type="checkbox"
        checked={selectedReturns.some(
          x =>
            x.transactionId === debt.id &&
            x.itemId === item.itemId
        )}
        onChange={(e) => {

          if (e.target.checked) {

            setSelectedReturns(prev => [

              ...prev,

              {
  transactionId: debt.id,
  itemId: item.itemId,
  itemName: item.itemName,

  originalQuantity:
    item.quantity,

  quantity:
    item.quantity,
},

            ]);

          } else {

            setSelectedReturns(prev =>
              prev.filter(
                x =>
                  !(
                    x.transactionId === debt.id &&
                    x.itemId === item.itemId
                  )
              )
            );

          }

        }}
      />

      <span>
        {item.itemName}
      </span>

    </div>

    <div className="flex items-center gap-3">

  <span
    className="
      text-xs
      text-gray-400
    "
  >
    Hutang:
    {" "}
    {item.quantity}
  </span>

  <input
    type="number"
    min="0"
    value={
      selectedReturns.find(
        x =>
          x.transactionId === debt.id &&
          x.itemId === item.itemId
      )?.quantity ?? 0
    }
    onChange={(e) => {

      const qty =
        Number(
          e.target.value
        );

      setSelectedReturns(
        prev =>
          prev.map(x => {

            if (
              x.transactionId === debt.id &&
              x.itemId === item.itemId
            ) {

              return {
                ...x,
                quantity: qty,
              };

            }

            return x;

          })
      );

    }}
    className="
      w-24
      bg-black
      border
      border-red-700/40
      rounded-xl
      px-3
      py-2
      text-center
    "
  />

</div>

  </label>

))}
<div className="flex justify-end mt-6">

  

</div>

        </div>

      ))}

      <div
  className="
    mt-6
    bg-black/70
    border
    border-red-900/20
    rounded-2xl
    p-4
  "
>



  <label
    className="
      block
      text-sm
      text-gray-400
      mb-2
    "
  >
    Catatan Pengembalian
  </label>

  <textarea
    value={
      returnDescription
    }
    onChange={(e) =>
      setReturnDescription(
        e.target.value
      )
    }
    placeholder="
Contoh :
• Kondisi barang masih lengkap.
• Pengembalian setelah war.
• Tidak ada pengurangan.
"
    className="
      w-full
      min-h-[120px]
      bg-[#141021]
      border
      border-red-700/40
      rounded-2xl
      p-4
      outline-none
      focus:border-red-400
    "
  />

</div>
      {/* FOOTER */}

<div
  className="
    border-t
    border-red-700/40
    bg-[#141021]
    p-5
    flex
    justify-between
    items-center
  "
>

  <div>

    <p className="text-sm text-gray-400">
      Barang Dipilih
    </p>

    <p className="text-2xl font-bold text-green-400">
      {selectedReturns.length}
    </p>

  </div>

  <button
    onClick={submitItemReturn}
    disabled={
      selectedReturns.length === 0
    }
    className="
      bg-green-600
      hover:bg-green-700
      disabled:opacity-50
      disabled:cursor-not-allowed
      px-6
      py-3
      rounded-2xl
      font-bold
      transition-all
    "
  >
    Kirim Pengembalian
  </button>

</div>

    </div>

  </div>

</div>

)}

      </div>

    </AppLayout>
  );
}