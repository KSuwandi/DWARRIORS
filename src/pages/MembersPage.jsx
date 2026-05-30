import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebase/config";

export default function MemberPage() {

  const { role } = useAuth();

  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [financeData, setFinanceData] = useState([]);
  const [craftingData, setCraftingData] = useState([]);
  const [activeTab, setActiveTab] = useState("finance");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // =========================
// DELETE MEMBER
// =========================
const deleteMember = async (member) => {
  try {

    const memberName =
      member.rpName ||
      member.displayName ||
      member.name ||
      member.email?.split("@")[0] ||
      "Unknown";

    const confirmation = prompt(
      `PERINGATAN!\n\n` +
      `Kamu akan menghapus member:\n` +
      `${memberName}\n\n` +
      `Ketik nama member dengan tepat untuk melanjutkan:`
    );

    if (confirmation === null) {
      return;
    }

    if (confirmation.trim() !== memberName) {
      alert(
        `Nama tidak cocok!\n\nKetik persis: ${memberName}`
      );
      return;
    }

    await deleteDoc(
      doc(db, "users", member.id)
    );

    if (
      selectedMember?.id === member.id
    ) {
      setSelectedMember(null);
    }

    alert(
      `Member ${memberName} berhasil dihapus`
    );

  } catch (error) {

    console.error(error);

    alert(
      "Gagal menghapus member"
    );
  }
};

  // =========================
  // PHOTO SAFE
  // =========================
  const getPhoto = (user) => {

    return (
      user?.photo ||
      user?.photoURL ||
      user?.imageUrl ||
      `https://ui-avatars.com/api/?name=${
        user?.rpName ||
        user?.displayName ||
        user?.name ||
        "User"
      }&background=7A0019&color=fff`
    );
  };

  // =========================
  // EMAIL MASK
  // =========================
  const maskEmail = (email) => {

    if (!email)
      return "No Email";

    const [name, domain] =
      email.split("@");

    if (!domain)
      return email;

    return (
      name.slice(0, 1) +
      "****" +
      name.slice(-1) +
      "@" +
      domain
    );
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (
    timestamp
  ) => {

    if (
      !timestamp?.seconds
    )
      return "-";

    return new Date(
      timestamp.seconds *
        1000
    ).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
// LOAD USERS
// =========================
useEffect(() => {

  const unsub =
    onSnapshot(
      collection(
        db,
        "users"
      ),
      (snap) => {

        setMembers(
          snap.docs.map(
            (d) => ({
              id: d.id,
              uid:
                d.data()
                  .uid,
              ...d.data(),
            })
          )
        );
      }
    );

  return () => unsub();

}, []);
  // =========================
  // LOAD FINANCE
  // =========================
  useEffect(() => {

    if (!selectedMember)
      return;

    const unsub =
      onSnapshot(
        collection(
          db,
          "users",
          selectedMember.id,
          "finance"
        ),
        (snap) => {

          const sorted =
            snap.docs
              .map(
                (d) => ({
                  id: d.id,
                  ...d.data(),
                })
              )

              // SORT NEWEST
              .sort(
                (a, b) => {

                  const aTime =
                    a
                      ?.createdAt
                      ?.seconds ||
                    0;

                  const bTime =
                    b
                      ?.createdAt
                      ?.seconds ||
                    0;

                  return (
                    bTime -
                    aTime
                  );
                }
              );

          setFinanceData(
            sorted
          );
        }
      );

    return () => unsub();

  }, [selectedMember]);

  // =========================
  // LOAD CRAFTING
  // =========================
  useEffect(() => {

    if (!selectedMember)
      return;

    const unsub =
      onSnapshot(
        collection(
          db,
          "crafting_history"
        ),
        (snap) => {

          const raw =
            snap.docs.map(
              (d) => ({
                id: d.id,
                ...d.data(),
              })
            );

          const filtered =
            raw
              .filter(
                (
                  item
                ) => {

                  return (
                    item.craftedByUid ===
                    selectedMember.uid
                  );
                }
              )

              // SORT NEWEST
              .sort(
                (a, b) => {

                  const aTime =
                    a
                      ?.createdAt
                      ?.seconds ||
                    0;

                  const bTime =
                    b
                      ?.createdAt
                      ?.seconds ||
                    0;

                  return (
                    bTime -
                    aTime
                  );
                }
              );

          setCraftingData(
            filtered
          );

          setCurrentPage(1);
        }
      );

    return () => unsub();

  }, [selectedMember]);

  // =========================
  // TOTAL FINANCE
  // =========================
  const totalIncome =
  useMemo(() => {

    return financeData
      .filter(
        (i) =>
          i.type ===
            "Pemasukan" &&
          i.status ===
            "Approved"
      )
      .reduce(
        (a, b) =>
          a +
          Number(
            b.amount ||
              0
          ),
        0
      );

  }, [financeData]);

  const totalExpense =
  useMemo(() => {

    return financeData
      .filter(
        (i) =>
          i.type ===
            "Pengeluaran" &&
          i.status ===
            "Approved"
      )
      .reduce(
        (a, b) =>
          a +
          Number(
            b.amount ||
              0
          ),
        0
      );

  }, [financeData]);

  // =========================
  // TOTAL HUTANG
  // =========================
  const totalDebt =
    useMemo(() => {

      const totalHutang =
        financeData
          .filter(
            (
              item
            ) =>
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
                item.amount ||
                  0
              ),
            0
          );

      const pembayaranHutang =
        financeData
          .filter(
            (
              item
            ) =>
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
                item.amount ||
                  0
              ),
            0
          );

      return (
        totalHutang -
        pembayaranHutang
      );

    }, [financeData]);

  // =========================
  // ACTIVE DATA
  // =========================
  const activeData =
    activeTab ===
    "finance"
      ? financeData
      : craftingData;

  const totalPages =
    Math.ceil(
      activeData.length /
        ITEMS_PER_PAGE
    );

  const paginatedData =
    activeData.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage *
        ITEMS_PER_PAGE
    );


  return (

    <AppLayout>

      <div className="text-white">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Member Monitoring
          </h1>

          <p className="text-gray-400 mt-2">
            Monitor finance &
            crafting activity
          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* MEMBER LIST */}
          <div className="bg-[#111] border border-[#7A0019]/30 rounded-3xl p-5 h-fit sticky top-5">

            <h2 className="text-xl font-bold mb-4">
              Members
            </h2>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">

              {members.map(
                (m) => (

                  <button
                    key={m.id}
                    onClick={() => {

                      setSelectedMember(
                        m
                      );

                      setCurrentPage(
                        1
                      );
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                      selectedMember?.id ===
                      m.id
                        ? "bg-[#7A0019] border-[#7A0019] shadow-lg shadow-red-900/40"
                        : "bg-black border-gray-700 hover:border-[#7A0019]/50 hover:bg-[#161616]"
                    }`}
                  >

                    <img
  src={getPhoto(
    m
  )}
  referrerPolicy="no-referrer"
  className="w-11 h-11 rounded-full object-cover border border-gray-700"
/>

                    <div className="text-left">

                      <p className="font-bold text-sm">
                        {m.rpName ||
                          m.displayName ||
                          m.name ||
                          m.email?.split(
                            "@"
                          )[0] ||
                          "Unknown"}
                      </p>

                      <p className="text-xs text-gray-400">
                        {m.role}
                      </p>

                    </div>

                  </button>

                )
              )}

            </div>

          </div>

          {/* DETAIL */}
          <div className="lg:col-span-3 space-y-6">

            {!selectedMember ? (

              <div className="text-gray-400 bg-[#111] p-10 rounded-3xl border border-gray-800 text-center">

                Pilih member untuk melihat aktivitas

              </div>

            ) : (

              <>

                {/* MEMBER CARD */}
                <div className="bg-gradient-to-br from-[#111] to-[#181818] border border-[#7A0019]/30 p-6 rounded-3xl flex items-center gap-5 shadow-xl">

                  <img
  src={getPhoto(
    selectedMember
  )}
  referrerPolicy="no-referrer"
  className="w-24 h-24 rounded-3xl object-cover border-2 border-[#7A0019]"
/>

                  <div>

                    <h2 className="text-3xl font-bold">
                      {selectedMember.rpName ||
                        selectedMember.displayName ||
                        selectedMember.name ||
                        selectedMember.email?.split(
                          "@"
                        )[0] ||
                        "Unknown"}
                    </h2>

                    <p className="text-gray-400 text-sm mt-1">
                      {maskEmail(
                        selectedMember.email
                      )}
                    </p>

                    <p className="text-gray-300 text-sm mt-2">
                      📞{" "}
                      {selectedMember.phone ||
                        "No Phone"}
                    </p>

                    <div className="flex gap-3 mt-3">

  <span className="px-4 py-1 text-xs bg-[#7A0019] rounded-xl font-semibold">
    {selectedMember.role}
  </span>

  {selectedMember.role !==
    "Oyabun" && (

    <button
      onClick={() =>
        deleteMember(
          selectedMember
        )
      }
      className="px-4 py-1 text-xs bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all"
    >
      Delete Member
    </button>

  )}

</div>

                  </div>

                </div>

                {/* TAB */}
                <div className="flex gap-3">

                  <button
                    onClick={() => {

                      setActiveTab(
                        "finance"
                      );

                      setCurrentPage(
                        1
                      );
                    }}
                    className={`px-6 py-3 rounded-2xl border font-semibold transition-all ${
                      activeTab ===
                      "finance"
                        ? "bg-[#7A0019] border-[#7A0019]"
                        : "bg-black border-gray-700 hover:border-[#7A0019]"
                    }`}
                  >
                    Finance
                  </button>

                  <button
                    onClick={() => {

                      setActiveTab(
                        "crafting"
                      );

                      setCurrentPage(
                        1
                      );
                    }}
                    className={`px-6 py-3 rounded-2xl border font-semibold transition-all ${
                      activeTab ===
                      "crafting"
                        ? "bg-[#7A0019] border-[#7A0019]"
                        : "bg-black border-gray-700 hover:border-[#7A0019]"
                    }`}
                  >
                    Crafting
                  </button>

                </div>

                {/* FINANCE SUMMARY */}
                {activeTab ===
                  "finance" && (

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="bg-[#111] p-5 rounded-3xl border border-green-500/20 shadow-lg">

                      <p className="text-gray-400 text-sm">
                        Total Income
                      </p>

                      <p className="text-green-400 text-2xl font-bold mt-2">
                        Rp{" "}
                        {totalIncome.toLocaleString(
                          "id-ID"
                        )}
                      </p>

                    </div>

                    <div className="bg-[#111] p-5 rounded-3xl border border-red-500/20 shadow-lg">

                      <p className="text-gray-400 text-sm">
                        Total Expense
                      </p>

                      <p className="text-red-400 text-2xl font-bold mt-2">
                        Rp{" "}
                        {totalExpense.toLocaleString(
                          "id-ID"
                        )}
                      </p>

                    </div>

                    <div className="bg-[#111] p-5 rounded-3xl border border-yellow-500/20 shadow-lg">

                      <p className="text-gray-400 text-sm">
                        Total Hutang
                      </p>

                      <p className="text-yellow-300 text-2xl font-bold mt-2">
                        Rp{" "}
                        {Math.max(
                          totalDebt,
                          0
                        ).toLocaleString(
                          "id-ID"
                        )}
                      </p>

                    </div>

                  </div>

                )}

                {/* LIST */}
                <div className="space-y-4">

                  {paginatedData.map(
                    (item) => (

                      <div
                        key={item.id}
                        className={`p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.01] ${
                          activeTab ===
                          "finance"

                            ? item.type ===
                              "Pemasukan"

                              ? "bg-green-500/10 border-green-500/30"

                              : item.type ===
                                  "Pengeluaran"

                              ? "bg-red-500/10 border-red-500/30"

                              : "bg-yellow-500/10 border-yellow-500/30"

                            : item.status ===
                                "Approved" ||
                              item.status ===
                                "Crafted"

                            ? "bg-green-500/10 border-green-500/30"

                            : item.status ===
                                "Rejected" ||
                              item.status ===
                                "Partial Failed"

                            ? "bg-red-500/10 border-red-500/30"

                            : "bg-yellow-500/10 border-yellow-500/30"
                        }`}
                      >

                        {activeTab ===
                        "finance" ? (

                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                            <div>

                              <div className="flex items-center gap-3 flex-wrap">

                                <h2 className="text-2xl font-bold">
                                  {item.title ||
                                    "Finance"}
                                </h2>

                                <span
                                  className={`px-4 py-1 rounded-full text-xs font-bold ${
                                    item.type ===
                                    "Pemasukan"
                                      ? "bg-green-500/20 text-green-300"
                                      : item.type ===
                                          "Pengeluaran"
                                      ? "bg-red-500/20 text-red-300"
                                      : "bg-yellow-500/20 text-yellow-300"
                                  }`}
                                >
                                  {item.type ||
                                    "-"}
                                </span>

                                {item.status && (
                                  <span
                                    className={`px-4 py-1 rounded-full text-xs font-bold ${
                                      item.status ===
                                      "Approved"
                                        ? "bg-green-500/20 text-green-300"
                                        : item.status ===
                                            "Rejected"
                                        ? "bg-red-500/20 text-red-300"
                                        : "bg-yellow-500/20 text-yellow-300"
                                    }`}
                                  >
                                    {
                                      item.status
                                    }
                                  </span>
                                )}

                              </div>

                              <div className="flex flex-wrap gap-3 mt-4">

                                <div className="bg-black/40 px-4 py-2 rounded-xl text-sm">
                                  💰 Amount:
                                  {" "}
                                  Rp{" "}
                                  {Number(
                                    item.amount ||
                                      0
                                  ).toLocaleString(
                                    "id-ID"
                                  )}
                                </div>

                                {item.paymentType && (
                                  <div className="bg-black/40 px-4 py-2 rounded-xl text-sm">
                                    💳 Payment:
                                    {" "}
                                    {
                                      item.paymentType
                                    }
                                  </div>
                                )}

                              </div>

                              {item.note && (
                                <div className="mt-4 bg-black/30 border border-gray-800 rounded-2xl p-4">

                                  <p className="text-gray-400 text-sm">
                                    Note
                                  </p>

                                  <p className="mt-2 text-sm leading-relaxed">
                                    {
                                      item.note
                                    }
                                  </p>

                                </div>
                              )}

                            </div>

                            <div className="text-right">

                              <p className="text-gray-400 text-sm">
                                Created At
                              </p>

                              <h3 className="font-bold mt-2 text-lg">
                                {formatDate(
                                  item.createdAt
                                )}
                              </h3>

                            </div>

                          </div>

                        ) : (

                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                            <div>

                              <div className="flex items-center gap-3 flex-wrap">

                                <h2 className="text-2xl font-bold">
                                  {item.recipeName ||
                                    "Crafting"}
                                </h2>

                                <span
                                  className={`px-4 py-1 rounded-full text-xs font-bold ${
                                    item.status ===
                                      "Approved" ||
                                    item.status ===
                                      "Crafted"
                                      ? "bg-green-500/20 text-green-300"
                                      : item.status ===
                                          "Rejected" ||
                                        item.status ===
                                          "Partial Failed"
                                      ? "bg-red-500/20 text-red-300"
                                      : "bg-yellow-500/20 text-yellow-300"
                                  }`}
                                >
                                  {item.status ||
                                    "Pending"}
                                </span>

                              </div>

                              <div className="flex flex-wrap gap-3 mt-4">

                                <div className="bg-black/40 px-4 py-2 rounded-xl text-sm">
                                  ✅ Success:
                                  {" "}
                                  {item.successQty ||
                                    0}
                                </div>

                                <div className="bg-black/40 px-4 py-2 rounded-xl text-sm">
                                  ❌ Failed:
                                  {" "}
                                  {item.failedQty ||
                                    0}
                                </div>

                                <div className="bg-black/40 px-4 py-2 rounded-xl text-sm">
                                  📦 Output:
                                  {" "}
                                  {item.outputQty ||
                                    0}
                                </div>

                              </div>

                            </div>

                            <div className="text-right">

                              <p className="text-gray-400 text-sm">
                                Created At
                              </p>

                              <h3 className="font-bold mt-2 text-lg">
                                {formatDate(
                                  item.createdAt
                                )}
                              </h3>

                            </div>

                          </div>

                        )}

                      </div>

                    )
                  )}

                  {paginatedData.length ===
                    0 && (

                    <div className="bg-[#111] border border-dashed border-gray-700 rounded-3xl p-10 text-center text-gray-400">

                      Tidak ada data

                    </div>

                  )}

                </div>

                {/* PAGINATION */}
                {totalPages >
                  1 && (

                  <div className="flex gap-2 justify-center flex-wrap">

                    <button
                      disabled={
                        currentPage ===
                        1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (
                            p
                          ) =>
                            p - 1
                        )
                      }
                      className="px-5 py-3 bg-black border border-gray-700 rounded-2xl disabled:opacity-40 hover:border-[#7A0019]"
                    >
                      Prev
                    </button>

                    {Array.from({
                      length:
                        totalPages,
                    }).map(
                      (
                        _,
                        i
                      ) => (

                        <button
                          key={i}
                          onClick={() =>
                            setCurrentPage(
                              i +
                                1
                            )
                          }
                          className={`px-5 py-3 rounded-2xl border ${
                            currentPage ===
                            i + 1
                              ? "bg-[#7A0019] border-[#7A0019]"
                              : "bg-black border-gray-700 hover:border-[#7A0019]"
                          }`}
                        >
                          {i + 1}
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
                            p
                          ) =>
                            p + 1
                        )
                      }
                      className="px-5 py-3 bg-black border border-gray-700 rounded-2xl disabled:opacity-40 hover:border-[#7A0019]"
                    >
                      Next
                    </button>

                  </div>

                )}

              </>

            )}

          </div>

        </div>

      </div>

    </AppLayout>
  );
}