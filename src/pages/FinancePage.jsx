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
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebase/config";

export default function FinancePage() {

  const { user, role } =
    useAuth();

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [filter, setFilter] =
    useState("Semua");

  const currentPageLimit = 5;

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [form, setForm] =
    useState({
      type: "Pemasukan",
      paymentType: "Cash",
      moneyType: "Uang Putih",
      title: "",
      amount: "",
      note: "",
    });

  // =====================================
  // REALTIME TRANSACTIONS
  // =====================================
  useEffect(() => {

    if (!user) return;

    const financeRef = query(
      collection(
        db,
        "users",
        user.uid,
        "finance"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(
        financeRef,
        (snapshot) => {

          const data =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setTransactions(
            data
          );
        }
      );

    return () =>
      unsubscribe();

  }, [user]);

  // =====================================
  // TOTAL PEMASUKAN
  // =====================================
  const totalIncome =
    useMemo(() => {

      return transactions
        .filter(
          (item) =>
            item.type ===
              "Pemasukan" &&
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
              "Pengeluaran" &&
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
  const totalDebt =
    useMemo(() => {

      const totalHutang =
        transactions
          .filter(
            (item) =>
              item.paymentType ===
                "Hutang" &&
              item.type ===
                "Pengeluaran" &&
              item.status ===
                "Approved"
          )
          .reduce(
            (
              acc,
              item
            ) =>
              acc +
              Number(
                item.amount || 0
              ),
            0
          );

      const pembayaranHutang =
        transactions
          .filter(
            (item) =>
              item.type ===
                "Pembayaran Hutang" &&
              item.status ===
                "Approved"
          )
          .reduce(
            (
              acc,
              item
            ) =>
              acc +
              Number(
                item.amount || 0
              ),
            0
          );

      return (
        totalHutang -
        pembayaranHutang
      );

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
  const totalPages =
    Math.ceil(
      filteredTransactions.length /
        currentPageLimit
    );

  const paginatedTransactions =
    filteredTransactions.slice(
      (currentPage - 1) *
        currentPageLimit,
      currentPage *
        currentPageLimit
    );

  // =====================================
  // ADD TRANSACTION
  // =====================================
  const handleSubmit =
    async (e) => {

      e.preventDefault();

      if (!user) return;

      if (
        !form.title.trim()
      ) {

        toast.error(
          "Judul transaksi wajib diisi"
        );

        return;
      }

      if (
        !form.amount
      ) {

        toast.error(
          "Jumlah uang wajib diisi"
        );

        return;
      }
      if (!form.note.trim()) {
  toast.error("Catatan transaksi wajib diisi");
  return;
}

      const amount =
        Number(form.amount);

      if (
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
            type:
              form.type,

            paymentType:
              form.paymentType,

            moneyType:
              form.moneyType,

            title:
              form.title.trim(),

            amount,

            note:
              form.note.trim(),

            createdBy:
              user.displayName ||
              "Unknown",

            status:
              "Approved",

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
          `${form.type} berhasil ditambahkan`
        );

        setForm({
          type: "Pemasukan",
          paymentType:
            "Cash",
          moneyType:
            "Uang Putih",
          title: "",
          amount: "",
          note: "",
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
// BAYAR HUTANG
// =====================================
const handlePayDebt =
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
      !amount ||
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
            "Pembayaran Hutang",

          paymentType:
            "Cash",

          moneyType:
            "Uang Putih",

          title:
            "Pembayaran Hutang",

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
            user.displayName ||
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
const approvePayment =
  async (ref) => {

    try {

      if (
        role !== "Oyabun"
      ) {

        toast.error(
          "Hanya Oyabun yang bisa approve"
        );

        return;
      }

      await updateDoc(
        ref,
        {
          status:
            "Approved",

          approvedBy:
            user.displayName,

          approvedAt:
            serverTimestamp(),
        }
      );

      toast.success(
        "Pembayaran hutang di approve"
      );

    } catch (error) {

      console.error(
        error
      );

      toast.error(
        "Gagal approve pembayaran"
      );
    }
  };

  // =====================================
  // DELETE TRANSACTION
  // =====================================
  const deleteTransaction =
    async (id) => {

      try {

        if (!user) return;

        if (
          role !== "Oyabun"
        ) {

          toast.error(
            "Hanya Oyabun yang bisa menghapus history"
          );

          return;
        }

        await deleteDoc(
          doc(
            db,
            "users",
            user.uid,
            "finance",
            id
          )
        );

        toast.success(
          "History berhasil dihapus"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Gagal menghapus history"
        );
      }
    };

  return (

    <AppLayout>

      <div className="text-white w-full">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>

            <div className="flex items-center gap-3 flex-wrap">

              <h1 className="text-4xl font-bold">
                Finance System
              </h1>

              <span
                className={`px-4 py-2 rounded-full text-xs font-semibold border ${
                  role ===
                  "Oyabun"
                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                    : "bg-gray-700/30 text-gray-300 border-gray-600"
                }`}
              >
                {role}
              </span>

            </div>

            <p className="text-gray-400 mt-2">
              Sistem keuangan Jigokubara Family
            </p>

          </div>

          <button
            onClick={
              handlePayDebt
            }
            className="bg-yellow-600 hover:bg-yellow-700 px-6 py-4 rounded-2xl font-semibold transition-all"
          >
            Bayar Hutang
          </button>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <div className="bg-[#111111] border border-green-500/20 rounded-3xl p-6">

            <p className="text-gray-400">
              Total Pemasukan
            </p>

            <h2 className="text-4xl font-bold mt-3 text-green-400">
              Rp{" "}
              {totalIncome.toLocaleString(
                "id-ID"
              )}
            </h2>

          </div>

          <div className="bg-[#111111] border border-red-500/20 rounded-3xl p-6">

            <p className="text-gray-400">
              Total Pengeluaran
            </p>

            <h2 className="text-4xl font-bold mt-3 text-red-400">
              Rp{" "}
              {totalExpense.toLocaleString(
                "id-ID"
              )}
            </h2>

          </div>

          <div className="bg-[#111111] border border-yellow-500/20 rounded-3xl p-6">

            <p className="text-gray-400">
              Total Hutang
            </p>

            <h2 className="text-4xl font-bold mt-3 text-yellow-300">
              Rp{" "}
              {totalDebt.toLocaleString(
                "id-ID"
              )}
            </h2>

          </div>

          <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6">

            <p className="text-gray-400">
              Saldo Saat Ini
            </p>

            <h2 className="text-4xl font-bold mt-3 text-blue-300">
              Rp{" "}
              {totalBalance.toLocaleString(
                "id-ID"
              )}
            </h2>

          </div>

        </div>

        {/* FORM */}
        <form
          onSubmit={
            handleSubmit
          }
          className="bg-[#111111] border border-[#7A0019]/40 rounded-3xl p-6 mb-10"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

            <select
              value={
                form.type
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  type:
                    e.target
                      .value,
                })
              }
              className="bg-black border border-gray-700 rounded-2xl px-5 py-4 outline-none"
            >

              <option>
                Pemasukan
              </option>

              <option>
                Pengeluaran
              </option>

            </select>

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
              className="bg-black border border-gray-700 rounded-2xl px-5 py-4 outline-none"
            >

              <option>
                Cash
              </option>

              <option>
                Hutang
              </option>

            </select>

            <select
              value={
                form.moneyType
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  moneyType:
                    e.target
                      .value,
                })
              }
              className="bg-black border border-gray-700 rounded-2xl px-5 py-4 outline-none"
            >

              <option>
                Uang Putih
              </option>

              <option>
                Uang Merah
              </option>

            </select>

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
              className="bg-black border border-gray-700 rounded-2xl px-5 py-4 outline-none"
            />

            <input
              type="number"
              placeholder="Jumlah"
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
              className="bg-black border border-gray-700 rounded-2xl px-5 py-4 outline-none"
            />

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
            className="w-full mt-5 bg-black border border-gray-700 rounded-2xl px-5 py-4 min-h-[140px] outline-none"
          />

          <button
            type="submit"
            disabled={
              loading
            }
            className="mt-5 bg-[#7A0019] hover:bg-[#99001f] disabled:opacity-50 rounded-2xl px-6 py-4 font-semibold transition-all"
          >
            {loading
              ? "Menyimpan..."
              : "Simpan Transaksi"}
          </button>

        </form>

        {/* FILTER */}
        <div className="flex flex-wrap gap-3 mb-8">

          {[
            "Semua",
            "Pemasukan",
            "Pengeluaran",
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

                setCurrentPage(
                  1
                );
              }}
              className={`px-5 py-3 rounded-2xl border transition-all ${
                filter === type
                  ? "bg-[#7A0019] border-[#7A0019]"
                  : "border-gray-700"
              }`}
            >
              {type}
            </button>

          ))}

        </div>

        {/* HISTORY */}
        <div className="space-y-5">

          {paginatedTransactions.map(
            (item) => (

              <div
                key={item.id}
                className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* LEFT */}
                  <div>

                    <div className="flex items-center gap-3 flex-wrap">

                      <h2 className="text-2xl font-bold">
                        {
                          item.title
                        }
                      </h2>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.type ===
                          "Pemasukan"
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
                            ? "bg-green-500/20 text-green-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {
                          item.status
                        }
                      </span>

                    </div>

                    <p className="text-gray-400 mt-3">
                      {item.note ||
                        "Tidak ada catatan"}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-4">

                      <span className="bg-black px-4 py-2 rounded-xl text-sm">
                        {
                          item.paymentType
                        }
                      </span>

                      <span className="bg-black px-4 py-2 rounded-xl text-sm">
                        {
                          item.moneyType
                        }
                      </span>

                      <span className="bg-black px-4 py-2 rounded-xl text-sm">
                        By{" "}
                        {
                          item.createdBy
                        }
                      </span>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end gap-4">

                    <h3
                      className={`text-4xl font-bold ${
                        item.type ===
                        "Pemasukan"
                          ? "text-green-400"
                          : item.type ===
                            "Pembayaran Hutang"
                          ? "text-yellow-300"
                          : "text-red-400"
                      }`}
                    >
                      {item.type ===
                      "Pemasukan"
                        ? "+"
                        : "-"}
                      Rp{" "}
                      {Number(
                        item.amount
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </h3>

                    {/* APPROVE */}
                    {role ===
                      "Oyabun" &&
                      item.status ===
                        "Pending" && (

                      <button
                        onClick={() =>
                          approvePayment(
                            item.ref
                          )
                        }
                        className="bg-green-700 hover:bg-green-800 px-5 py-3 rounded-2xl transition-all"
                      >
                        Approve
                      </button>

                    )}

                    {/* DELETE */}
                    {role ===
                      "Oyabun" && (

                      <button
                        onClick={() =>
                          deleteTransaction(
                            item.id
                          )
                        }
                        className="bg-red-700 hover:bg-red-800 px-5 py-3 rounded-2xl transition-all"
                      >
                        Hapus
                      </button>

                    )}

                  </div>

                </div>

              </div>
            )
          )}

          {/* EMPTY */}
          {paginatedTransactions.length ===
            0 && (

            <div className="bg-[#111111] border border-dashed border-gray-700 rounded-3xl p-10 text-center text-gray-400">

              Tidak ada history transaksi

            </div>

          )}

        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (

          <div className="flex items-center justify-center gap-3 mt-10 flex-wrap">

            <button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (
                    prev
                  ) =>
                    prev - 1
                )
              }
              className="bg-[#111111] border border-gray-700 px-5 py-3 rounded-2xl disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({
              length:
                totalPages,
            }).map(
              (_, index) => (

                <button
                  key={index}
                  onClick={() =>
                    setCurrentPage(
                      index + 1
                    )
                  }
                  className={`px-5 py-3 rounded-2xl ${
                    currentPage ===
                    index + 1
                      ? "bg-[#7A0019]"
                      : "bg-[#111111] border border-gray-700"
                  }`}
                >
                  {index + 1}
                </button>

              )
            )}

            <button
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (
                    prev
                  ) =>
                    prev + 1
                )
              }
              className="bg-[#111111] border border-gray-700 px-5 py-3 rounded-2xl disabled:opacity-40"
            >
              Next
            </button>

          </div>

        )}

      </div>

    </AppLayout>
  );
}