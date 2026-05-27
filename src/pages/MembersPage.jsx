import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
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
  // PHOTO SAFE
  // =========================
  const getPhoto = (user) => {
    return (
      user?.photo ||
      user?.photoURL ||
      user?.imageUrl ||
      `https://ui-avatars.com/api/?name=${
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
    if (!email) return "No Email";

    const [name, domain] = email.split("@");
    if (!domain) return email;

    return name.slice(0, 1) + "****" + name.slice(-1) + "@" + domain;
  };

  // =========================
  // LOAD USERS
  // =========================
  useEffect(() => {
    if (role !== "Oyabun") return;

    const unsub = onSnapshot(
      collection(db, "users"),
      (snap) => {
        setMembers(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      }
    );

    return () => unsub();
  }, [role]);

  // =========================
  // LOAD FINANCE
  // =========================
  useEffect(() => {
    if (!selectedMember) return;

    const unsub = onSnapshot(
      collection(db, "users", selectedMember.id, "finance"),
      (snap) => {
        setFinanceData(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      }
    );

    return () => unsub();
  }, [selectedMember]);

  // =========================
  // LOAD CRAFTING
  // =========================
  useEffect(() => {
    if (!selectedMember) return;

    const unsub = onSnapshot(
      collection(db, "crafting_requests"),
      (snap) => {
        const raw = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const filtered = raw.filter((item) =>
          item.userId === selectedMember.id ||
          item.uid === selectedMember.id ||
          item.createdBy === selectedMember.id ||
          item.ownerId === selectedMember.id ||
          item.email === selectedMember.email
        );

        setCraftingData(filtered.length ? filtered : raw);
        setCurrentPage(1);
      }
    );

    return () => unsub();
  }, [selectedMember]);

  // =========================
  // TOTAL FINANCE
  // =========================
  const totalIncome = useMemo(() => {
    return financeData
      .filter((i) => i.type === "Pemasukan")
      .reduce((a, b) => a + Number(b.amount || 0), 0);
  }, [financeData]);

  const totalExpense = useMemo(() => {
    return financeData
      .filter((i) => i.type === "Pengeluaran")
      .reduce((a, b) => a + Number(b.amount || 0), 0);
  }, [financeData]);

  const totalDebt = useMemo(() => {
    return financeData
      .filter((i) => i.paymentType === "Hutang")
      .reduce((a, b) => a + Number(b.amount || 0), 0);
  }, [financeData]);

  // =========================
  // ACTIVE DATA
  // =========================
  const activeData =
    activeTab === "finance" ? financeData : craftingData;

  const totalPages = Math.ceil(activeData.length / ITEMS_PER_PAGE);

  const paginatedData = activeData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // =========================
  // ACCESS
  // =========================
  if (role !== "Oyabun") {
    return (
      <AppLayout>
        <div className="text-white">Access Denied</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="text-white">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Member Monitoring
          </h1>
          <p className="text-gray-400 mt-2">
            Monitor finance & crafting activity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* MEMBER LIST */}
          <div className="bg-[#111] border border-[#7A0019]/30 rounded-3xl p-5 h-fit">
            <h2 className="text-xl font-bold mb-4">
              Members
            </h2>

            <div className="space-y-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMember(m);
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border ${
                    selectedMember?.id === m.id
                      ? "bg-[#7A0019]"
                      : "bg-black border-gray-700"
                  }`}
                >
                  <img
                    src={getPhoto(m)}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div className="text-left">
                    <p className="font-bold text-sm">
                      {m.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {m.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DETAIL */}
          <div className="lg:col-span-3 space-y-6">

            {!selectedMember ? (
              <div className="text-gray-400 bg-[#111] p-10 rounded-3xl border border-gray-800">
                Pilih member untuk melihat aktivitas
              </div>
            ) : (
              <>

                {/* MEMBER CARD */}
                <div className="bg-[#111] border border-[#7A0019]/30 p-6 rounded-3xl flex items-center gap-5">

                  <img
                    src={getPhoto(selectedMember)}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />

                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedMember.name}
                    </h2>

                    <p className="text-gray-400 text-sm">
                      {maskEmail(selectedMember.email)}
                    </p>

                    <p className="text-gray-300 text-sm mt-1">
                      📞 {selectedMember.phone || "No Phone"}
                    </p>

                    <span className="inline-block mt-2 px-3 py-1 text-xs bg-[#7A0019] rounded-xl">
                      {selectedMember.role}
                    </span>
                  </div>
                </div>

                {/* TAB */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setActiveTab("finance");
                      setCurrentPage(1);
                    }}
                    className={`px-5 py-2 rounded-2xl border ${
                      activeTab === "finance"
                        ? "bg-[#7A0019]"
                        : "bg-black border-gray-700"
                    }`}
                  >
                    Finance
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("crafting");
                      setCurrentPage(1);
                    }}
                    className={`px-5 py-2 rounded-2xl border ${
                      activeTab === "crafting"
                        ? "bg-[#7A0019]"
                        : "bg-black border-gray-700"
                    }`}
                  >
                    Crafting
                  </button>
                </div>

                {/* FINANCE SUMMARY (NEW) */}
                {activeTab === "finance" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="bg-[#111] p-5 rounded-2xl border border-green-500/20">
                      <p className="text-gray-400 text-sm">Total Income</p>
                      <p className="text-green-400 text-xl font-bold">
                        Rp {totalIncome.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="bg-[#111] p-5 rounded-2xl border border-red-500/20">
                      <p className="text-gray-400 text-sm">Total Expense</p>
                      <p className="text-red-400 text-xl font-bold">
                        Rp {totalExpense.toLocaleString("id-ID")}
                      </p>
                    </div>

                    {/* 🔥 NEW HUTANG CARD */}
                    <div className="bg-[#111] p-5 rounded-2xl border border-yellow-500/20">
                      <p className="text-gray-400 text-sm">Total Hutang</p>
                      <p className="text-yellow-300 text-xl font-bold">
                        Rp {totalDebt.toLocaleString("id-ID")}
                      </p>
                    </div>

                  </div>
                )}

                {/* LIST */}
                <div className="space-y-4">

                  {paginatedData.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#111] border border-gray-800 p-5 rounded-3xl"
                    >

                      {activeTab === "finance" ? (
                        <div className="flex justify-between">
                          <div>
                            <p className="font-bold">{item.title}</p>
                            <p className="text-gray-400 text-sm">
                              {item.note || "-"}
                            </p>
                          </div>

                          <p className="font-bold">
                            Rp {Number(item.amount || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <div>
                            <p className="font-bold">
                              {item.recipeName || "Crafting"}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Qty: {item.quantity || 1}
                            </p>
                          </div>

                          <span className="text-xs bg-[#7A0019] px-3 py-1 rounded-xl">
                            {item.status || "Done"}
                          </span>
                        </div>
                      )}

                    </div>
                  ))}

                  {paginatedData.length === 0 && (
                    <p className="text-gray-400 text-center">
                      Tidak ada data
                    </p>
                  )}

                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex gap-2 justify-center">

                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="px-4 py-2 bg-black border border-gray-700 rounded-xl disabled:opacity-40"
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-xl border ${
                          currentPage === i + 1
                            ? "bg-[#7A0019]"
                            : "bg-black border-gray-700"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-4 py-2 bg-black border border-gray-700 rounded-xl disabled:opacity-40"
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