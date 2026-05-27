import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AppLayout from "../layouts/AppLayout";
import EmptyState from "../components/common/EmptyState";
import { db } from "../services/firebase/config";

export default function ActivityLogsPage() {

  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);

  // =========================
  // PAGINATION
  // =========================
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // =========================
  // LOAD LOGS
  // =========================
  useEffect(() => {

    const q = query(
      collection(db, "activity_logs"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLogs(data);
    });

    return () => unsub();

  }, []);

  // =========================
  // LOAD USERS (MEMBER DATA)
  // =========================
  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "users"),
      (snap) => {

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(data);
      }
    );

    return () => unsub();

  }, []);

  // =========================
  // GET USER NAME (FIXED FINAL)
  // =========================
  const getUserName = (log) => {

    // 1. PRIORITY: dari log langsung (PALING AMAN)
    if (log.createdByName) return log.createdByName;
    if (log.userName) return log.userName;
    if (log.user) return log.user;

    // 2. cari user dari users collection
    const found = users.find((u) =>
      u.id === log.userId ||
      u.id === log.uid ||
      u.id === log.createdByUid ||
      u.uid === log.uid
    );

    // 3. PRIORITY NAME dari MemberPage
    if (found?.name) return found.name;

    if (found?.displayName && !found.displayName.includes("@")) {
      return found.displayName;
    }

    // 4. fallback email
    if (found?.email) {
      return found.email.split("@")[0];
    }

    return "Unknown User";
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {

    if (!date?.seconds) return "-";

    return new Date(date.seconds * 1000).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  };

  // =========================
  // TYPE COLOR
  // =========================
  const getTypeColor = (type) => {

    switch (type) {

      case "inventory_add":
        return "bg-green-500/20 text-green-300 border border-green-500/30";

      case "inventory_update":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";

      case "inventory_delete":
        return "bg-red-500/20 text-red-300 border border-red-500/30";

      case "crafting_request":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";

      case "crafting_approved":
        return "bg-green-500/20 text-green-300 border border-green-500/30";

      case "crafting_rejected":
        return "bg-red-500/20 text-red-300 border border-red-500/30";

      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
    }
  };

  // =========================
  // LABEL
  // =========================
  const getLogLabel = (type) => {

    switch (type) {

      case "inventory_add":
        return "Inventory Added";

      case "inventory_update":
        return "Inventory Updated";

      case "inventory_delete":
        return "Inventory Deleted";

      case "crafting_request":
        return "Craft Request";

      case "crafting_approved":
        return "Craft Approved";

      case "crafting_rejected":
        return "Craft Rejected";

      default:
        return "Activity";
    }
  };

  // =========================
  // STATS
  // =========================
  const stats = useMemo(() => {

    return {
      total: logs.length,
      inventory: logs.filter((l) => l.type?.includes("inventory")).length,
      crafting: logs.filter((l) => l.type?.includes("crafting")).length,
    };

  }, [logs]);

  // =========================
  // PAGINATION
  // =========================
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE) || 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedLogs = logs.slice(startIndex, endIndex);

  return (

    <AppLayout>

      <div className="text-white w-full">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Activity Logs</h1>
          <p className="text-gray-400 mt-2">
            Real-time inventory & crafting activity logs
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6">
            <p className="text-gray-400 text-sm">Total Activities</p>
            <h2 className="text-4xl font-bold mt-3">{stats.total}</h2>
          </div>

          <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6">
            <p className="text-gray-400 text-sm">Inventory Activities</p>
            <h2 className="text-4xl font-bold mt-3 text-blue-400">{stats.inventory}</h2>
          </div>

          <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6">
            <p className="text-gray-400 text-sm">Crafting Activities</p>
            <h2 className="text-4xl font-bold mt-3 text-yellow-400">{stats.crafting}</h2>
          </div>

        </div>

        {/* LOGS */}
        {logs.length === 0 ? (
          <EmptyState title="No activity logs found" />
        ) : (

          <>
            <div className="space-y-5">

              {paginatedLogs.map((log) => {

                const userName = getUserName(log);

                const craftItem =
                  log.target ||
                  log.item ||
                  log.recipeName ||
                  "Item";

                const description =
                  log.type === "crafting_request"
                    ? `Crafting ${craftItem} requested by ${userName}`
                    : log.description;

                return (

                  <div
                    key={log.id}
                    className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6"
                  >

                    <div className="flex flex-col lg:flex-row lg:justify-between gap-5">

                      {/* LEFT */}
                      <div className="flex-1">

                        <div className="flex items-center gap-3 flex-wrap">

                          <h2 className="text-2xl font-bold">
                            {log.action || getLogLabel(log.type)}
                          </h2>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(log.type)}`}
                          >
                            {getLogLabel(log.type)}
                          </span>

                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

                          <div>
                            <p className="text-gray-400 text-sm">User</p>
                            <p className="text-white font-semibold mt-1">
                              {userName}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-sm">Role</p>
                            <p className="text-white font-semibold mt-1">
                              {log.role || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-sm">Target</p>
                            <p className="text-white font-semibold mt-1">
                              {log.target || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-sm">Quantity</p>
                            <p className="text-white font-semibold mt-1">
                              {log.quantity || "-"}
                            </p>
                          </div>

                        </div>

                        {description && (
                          <div className="mt-5 bg-black/40 border border-gray-800 rounded-2xl p-4">
                            <p className="text-gray-300 text-sm">
                              {description}
                            </p>
                          </div>
                        )}

                      </div>

                      {/* RIGHT */}
                      <div className="lg:text-right">
                        <div className="bg-[#7A0019]/20 border border-[#7A0019]/30 text-red-300 px-5 py-3 rounded-2xl text-sm inline-block">
                          {formatDate(log.createdAt)}
                        </div>
                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

            {/* PAGINATION */}
            <div className="mt-10 flex items-center justify-between flex-wrap gap-4">

              <div className="text-gray-400 text-sm">
                Showing{" "}
                <span className="text-white font-semibold">{startIndex + 1}</span>
                {" "}to{" "}
                <span className="text-white font-semibold">
                  {Math.min(endIndex, logs.length)}
                </span>
                {" "}of{" "}
                <span className="text-white font-semibold">{logs.length}</span>
              </div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-5 py-3 rounded-2xl bg-[#111111] border border-[#7A0019]/30"
                >
                  Prev
                </button>

                <div className="px-5 py-3 rounded-2xl bg-[#7A0019]/20 border border-[#7A0019]/30 text-red-300">
                  {currentPage} / {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-5 py-3 rounded-2xl bg-[#111111] border border-[#7A0019]/30"
                >
                  Next
                </button>

              </div>

            </div>
          </>
        )}

      </div>

    </AppLayout>

  );
}