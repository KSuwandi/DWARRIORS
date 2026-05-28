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
  // CREATE ACTIVITY LOG
  // =====================================
  const createActivityLog =
    async ({
      type,
      action,
      target,
      quantity,
      description,
    }) => {

      try {

        await addDoc(
          collection(
            db,
            "activity_logs"
          ),
          {
            type,

            action,

            user:
              user?.rpName ||
              "Unknown",

            role:
              role || "-",

            target,

            quantity,

            description,

            createdAt:
              serverTimestamp(),
          }
        );

      } catch (error) {

        console.error(
          "Activity log error:",
          error
        );
      }
    };

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

        toast.error(
          "Catatan transaksi wajib diisi"
        );

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

        await createActivityLog({
          type:
            "finance_create",

          action:
            "Finance Transaction Created",

          target:
            form.title,

          quantity:
            amount,

          description:
            `${user.rpName} created ${form.type} transaction ${form.title} sebesar Rp ${amount.toLocaleString(
              "id-ID"
            )}`,
        });

        toast.success(
          `${form.type} berhasil dikirim untuk approval`
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

        await createActivityLog({
          type:
            "finance_debt_request",

          action:
            "Debt Payment Requested",

          target:
            "Pembayaran Hutang",

          quantity:
            amount,

          description:
            `${user.rpName} requested debt payment sebesar Rp ${amount.toLocaleString(
              "id-ID"
            )}`,
        });

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

      if (role !== "Oyabun") {

        toast.error(
          "Hanya Oyabun yang bisa approve"
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

          approvedBy:
            user.rpName,

          approvedAt:
            serverTimestamp(),
        }
      );

      await createActivityLog({
        type:
          "finance_approved",

        action:
          "Finance Approved",

        target:
          item.title,

        quantity:
          item.amount,

        description:
          `${user.rpName} approved transaction ${item.title}`,
      });

      toast.success(
        "Transaksi berhasil di approve"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Gagal approve transaksi"
      );
    }
  };

  // =====================================
  // DELETE TRANSACTION
  // =====================================
  const deleteTransaction =
    async (
      id,
      title
    ) => {

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

        await createActivityLog({
          type:
            "finance_delete",

          action:
            "Finance Deleted",

          target:
            title,

          quantity:
            1,

          description:
            `${user.rpName} deleted finance transaction ${title}`,
        });

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

      <div className="text-white">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

          <div>

            <div className="flex items-center gap-3 flex-wrap">

              <h1 className="text-3xl font-bold tracking-tight">
                Finance System
              </h1>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  role === "Oyabun"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : "bg-[#1A1330] text-gray-300 border-purple-900/40"
                }`}
              >
                {role}
              </span>

            </div>

            <p className="text-gray-400 mt-2 text-sm">
              Sistem keuangan Jigokubara Family
            </p>

          </div>

          <button
            onClick={
              handlePayDebt
            }
            className="bg-gradient-to-r from-purple-700 to-violet-700 hover:opacity-90 px-5 py-3 rounded-2xl font-semibold transition-all shadow-lg shadow-purple-900/30"
          >
            Bayar Hutang
          </button>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          <div className="bg-[#141021] border border-purple-900/30 rounded-2xl p-5">

            <p className="text-gray-400 text-sm">
              Total Pemasukan
            </p>

            <h2 className="text-2xl font-bold mt-2 text-green-400">
              Rp{" "}
              {totalIncome.toLocaleString(
                "id-ID"
              )}
            </h2>

          </div>

          <div className="bg-[#141021] border border-purple-900/30 rounded-2xl p-5">

            <p className="text-gray-400 text-sm">
              Total Pengeluaran
            </p>

            <h2 className="text-2xl font-bold mt-2 text-red-400">
              Rp{" "}
              {totalExpense.toLocaleString(
                "id-ID"
              )}
            </h2>

          </div>

          <div className="bg-[#141021] border border-purple-900/30 rounded-2xl p-5">

            <p className="text-gray-400 text-sm">
              Total Hutang
            </p>

            <h2 className="text-2xl font-bold mt-2 text-yellow-300">
              Rp{" "}
              {totalDebt.toLocaleString(
                "id-ID"
              )}
            </h2>

          </div>

          <div className="bg-[#141021] border border-purple-900/30 rounded-2xl p-5">

            <p className="text-gray-400 text-sm">
              Saldo Saat Ini
            </p>

            <h2 className="text-2xl font-bold mt-2 text-purple-300">
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
          className="bg-[#141021] border border-purple-900/30 rounded-3xl p-5 mb-6"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">

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
              className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
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
              className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
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
              className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
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
              className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
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
              className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
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
            className="w-full mt-4 bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 min-h-[110px] outline-none focus:border-purple-500"
          />

          <button
            type="submit"
            disabled={
              loading
            }
            className="mt-4 bg-gradient-to-r from-purple-700 to-violet-700 hover:opacity-90 disabled:opacity-50 rounded-2xl px-5 py-3 font-semibold transition-all shadow-lg shadow-purple-900/30"
          >
            {loading
              ? "Menyimpan..."
              : "Simpan Transaksi"}
          </button>

        </form>

        {/* FILTER */}
        <div className="flex flex-wrap gap-2 mb-6">

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
              className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                filter === type
                  ? "bg-gradient-to-r from-purple-700 to-violet-700 border-transparent"
                  : "bg-[#141021] border-purple-900/30 hover:border-purple-500/40"
              }`}
            >
              {type}
            </button>

          ))}

        </div>

        {/* HISTORY */}
        <div className="space-y-4">

          {paginatedTransactions.map(
            (item) => (

              <div
                key={item.id}
                className="bg-[#141021] border border-purple-900/30 rounded-3xl p-5 hover:border-purple-500/30 transition-all"
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
                            ? "bg-purple-500/20 text-purple-300"
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

                    <div className="flex flex-wrap gap-2 mt-4">

                      <span className="bg-[#0F0B18] border border-purple-900/20 px-3 py-2 rounded-xl text-xs">
                        {
                          item.paymentType
                        }
                      </span>

                      <span className="bg-[#0F0B18] border border-purple-900/20 px-3 py-2 rounded-xl text-xs">
                        {
                          item.moneyType
                        }
                      </span>

                      <span className="bg-[#0F0B18] border border-purple-900/20 px-3 py-2 rounded-xl text-xs">
                        By{" "}
                        {
                          item.createdBy
                        }
                      </span>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-start lg:items-end gap-3">

                    <h3
                      className={`text-3xl font-bold ${
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

                    <div className="flex gap-2 flex-wrap">

                      {/* APPROVE */}
                      {role ===
                        "Oyabun" &&
                        item.status ===
                          "Pending" && (

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
                      {role ===
                        "Oyabun" && (

                        <button
                          onClick={() =>
                            deleteTransaction(
                              item.id,
                              item.title
                            )
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
          {paginatedTransactions.length ===
            0 && (

            <div className="bg-[#141021] border border-dashed border-purple-900/30 rounded-3xl p-10 text-center text-gray-400">

              Tidak ada history transaksi

            </div>

          )}

        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (

          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">

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
              className="bg-[#141021] border border-purple-900/30 px-4 py-2 rounded-xl disabled:opacity-40"
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
                  className={`px-4 py-2 rounded-xl ${
                    currentPage ===
                    index + 1
                      ? "bg-gradient-to-r from-purple-700 to-violet-700"
                      : "bg-[#141021] border border-purple-900/30"
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
              className="bg-[#141021] border border-purple-900/30 px-4 py-2 rounded-xl disabled:opacity-40"
            >
              Next
            </button>

          </div>

        )}

      </div>

    </AppLayout>
  );
}