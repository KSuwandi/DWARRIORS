import { useEffect, useMemo, useState } from "react";
import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import {
  Boxes,
  Wallet,
  Hammer,
  AlertTriangle,
  Bell,
  X,
} from "lucide-react";

import AppLayout from "../layouts/AppLayout";
import { db } from "../services/firebase/config";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardPage() {

  const { user, role } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [finance, setFinance] = useState([]);
  const [craftRequests, setCraftRequests] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);

  // =========================
  // NOTIFICATION
  // =========================
  const [latestNotification, setLatestNotification] =
    useState(null);

  const [showAnnouncementCard, setShowAnnouncementCard] =
    useState(true);

  // =========================
  // REALTIME DATA
  // =========================
  useEffect(() => {

    const unsubInventory = onSnapshot(
      query(collection(db, "inventory")),
      (snapshot) => {

        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((item) => !item.deleted);

        setInventory(data);

      }
    );

    let unsubFinance = () => {};
    let unsubCraft = () => {};
    let unsubWithdraw = () => {};
    let unsubNotification = () => {};

    if (user) {

      // =========================
      // FINANCE
      // =========================
      unsubFinance = onSnapshot(
        query(collection(db, "users", user.uid, "finance")),
        (snapshot) => {

          setFinance(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );

        }
      );

      // =========================
      // CRAFT REQUEST
      // =========================
      unsubCraft = onSnapshot(
        query(collection(db, "crafting_requests")),
        (snapshot) => {

          setCraftRequests(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );

        }
      );

      // =========================
      // WITHDRAW REQUEST
      // =========================
      unsubWithdraw = onSnapshot(
        query(
          collectionGroup(db, "finance"),
          orderBy("createdAt", "desc")
        ),
        (snapshot) => {

          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ref: doc.ref,
            ...doc.data(),
          }));

          const filtered = data.filter(
            (item) =>
              item.status === "Pending" &&
              (
                item.type === "Pengeluaran" ||
                item.type === "Pembayaran Hutang" ||
                item.paymentType === "Hutang"
              )
          );

          setWithdrawRequests(filtered);

        }
      );

    }

    // =========================
    // NOTIFICATION
    // =========================
    unsubNotification = onSnapshot(
      query(
        collection(db, "notification"),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {

        if (snapshot.empty) {
          setLatestNotification(null);
          return;
        }

        const latestDoc = snapshot.docs[0];

        const data = {
          id: latestDoc.id,
          ...latestDoc.data(),
        };

        setLatestNotification(data);

      }
    );

    return () => {

      unsubInventory();
      unsubFinance();
      unsubCraft();
      unsubWithdraw();
      unsubNotification();

    };

  }, [user]);

  // =========================
  // UANG MERAH STOCK
  // =========================
  const uangMerahStock = useMemo(() => {

    const item = inventory.find(
      (i) =>
        i.name?.toLowerCase().trim() ===
        "uang merah"
    );

    return Number(item?.stock || 0);

  }, [inventory]);

  // =========================
  // UANG PUTIH STOCK
  // =========================
  const uangPutihStock = useMemo(() => {

    const item = inventory.find(
      (i) =>
        i.name?.toLowerCase().trim() ===
        "uang putih"
    );

    return Number(item?.stock || 0);

  }, [inventory]);

  // =========================
  // PENDING
  // =========================
  const pendingCrafting = useMemo(
    () =>
      craftRequests.filter(
        (i) => i.status === "Pending"
      ).length,
    [craftRequests]
  );

  const pendingWithdraw = useMemo(
    () => withdrawRequests.length,
    [withdrawRequests]
  );

  // =========================
  // CATEGORY
  // =========================
  const resourceInventory = inventory
  .filter(
    (item) =>
      item.category === "RESOURCE"
  )
  .sort(
    (a, b) =>
      Number(b.stock) -
      Number(a.stock)
  );

const prepareInventory = inventory
  .filter(
    (item) =>
      item.category === "PREPAREAN"
  )
  .sort(
    (a, b) =>
      Number(b.stock) -
      Number(a.stock)
  );

  // =========================
  // CARD STYLE
  // =========================
  const cardBase =
    "bg-gradient-to-br from-[#111] to-black border rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1";

  return (
    <AppLayout>

      <div className="text-white w-full p-6">

        {/* ===================================== */}
        {/* NOTIFICATION CARD */}
        {/* ===================================== */}
        {latestNotification &&
          showAnnouncementCard && (

          <div className="mb-8">

            <div className="relative overflow-hidden rounded-[32px] border border-red-500/20 bg-gradient-to-br from-black via-[#120000] to-[#250000] shadow-[0_0_40px_rgba(220,38,38,0.15)]">

              {/* BACKGROUND GLOW */}
              <div className="
absolute
inset-0
bg-gradient-to-r
from-red-700/20
via-red-900/10
to-transparent
" />

              {/* CONTENT */}
              <div className="relative z-10 p-6">

                <div className="flex items-start justify-between gap-5">

                  {/* LEFT SIDE */}
                  <div className="flex items-start gap-4 flex-1">

                    {/* ICON */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                        latestNotification.type === "Warning"
                          ? "bg-gradient-to-br from-red-700/30 to-red-900/20 text-red-300 border border-red-500/20"
                          : latestNotification.type === "Event"
                          ? "bg-gradient-to-br from-red-700/30 to-red-900/20 text-red-300 border border-red-500/20"
                          : latestNotification.type === "News"
                          ? "bg-green-500/15 text-green-300"
                          : "bg-gradient-to-br from-red-700/30 to-red-900/20 text-red-300 border border-red-500/20"
                      }`}
                    >

                      <Bell size={28} />

                    </div>

                    {/* TEXT */}
                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <span
                          className={`px-4 py-2 rounded-full text-xs font-bold tracking-[0.15em] uppercase border ${
                            latestNotification.type === "Warning"
                              ? "bg-gradient-to-r from-red-900/40 text-red-200 border-red-500/30"
                              : latestNotification.type === "Event"
                              ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                              : latestNotification.type === "News"
                              ? "bg-green-500/10 text-green-300 border-green-500/20"
                              : "bg-gradient-to-r from-red-900/40 text-red-200 border-red-500/30"
                          }`}
                        >
                          {latestNotification.type || "Announcement"}
                        </span>

                        <span className="text-xs text-gray-500">

                          Latest Notification

                        </span>

                      </div>

                      {/* TITLE */}
                      <h2 className="
text-3xl
font-black
mt-4
leading-tight
text-white
tracking-wide
">

                        {latestNotification.title}

                      </h2>

                      {/* MESSAGE */}
                      <p className="text-gray-300 mt-3 leading-7 whitespace-pre-wrap">

                        {latestNotification.message}

                      </p>

                      {/* FOOTER */}
                      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">

                        <span>
                          by{" "}
                          {latestNotification.createdBy ||
                            "Unknown"}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* CLOSE BUTTON */}
                  <button
                    onClick={() =>
                      setShowAnnouncementCard(false)
                    }
                    className="
                      w-11
                      h-11
                      rounded-2xl
                      bg-black/60
                      hover:bg-red-900/40
                      border-red-700/30
                      
                      border-white/10
                      flex
                      items-center
                      justify-center
                      transition-all
                    "
                  >

                    <X size={18} />

                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}
        <div className="mb-10">

          <h1 className="text-5xl font-black tracking-tight">

  <span className="text-white">
    DASHBOARD
  </span>

  <span className="text-red-500 ml-3">
    DWARRIORS
  </span>

</h1>

<p className="text-gray-400 mt-2">
  Central command for DWARRIORS Organization.
</p>

        </div>

        <div
  className="
    mb-8
    p-6
    rounded-3xl
    border
    border-red-700/30
    bg-gradient-to-r
    from-red-950/40
    to-black
  "
>

  <p className="text-red-400 text-xs tracking-[0.3em] uppercase">
    DWARRIORS ORGANIZATION
  </p>

  <h2 className="text-3xl font-black mt-2">
    Blood • Power • Legacy
  </h2>

  <p className="text-gray-400 mt-3">
    Every operation, every transaction,
    every member activity is monitored here.
  </p>

</div>

        {/* ===================================== */}
        {/* STATS */}
        {/* ===================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* UANG MERAH */}
<div
  className="
    bg-gradient-to-br
    from-red-950/60
    to-black
    border
    border-red-500/30
    rounded-3xl
    p-6
    shadow-lg
    hover:shadow-red-900/30
    transition-all
  "
>

  <p className="text-red-400 text-xs uppercase tracking-[0.25em]">
    Uang Merah
  </p>

  <h2 className="text-4xl font-bold text-red-400 mt-3">
    {uangMerahStock.toLocaleString()}
  </h2>

  <Wallet
    className="
      text-red-400
      mt-4
      drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]
    "
  />

</div>
          {/* UANG PUTIH */}
          <div className={`${cardBase} border-green-500/30`}>

            <p className="text-green-400 text-xs uppercase tracking-[0.25em]">
              Uang Putih
            </p>

            <h2 className="text-3xl font-bold text-green-400 mt-3">
              {uangPutihStock.toLocaleString()}
            </h2>

            <Wallet className="text-green-400 mt-4" />

          </div>

          {/* CRAFT */}
          <div className={`${cardBase} border-yellow-500/30`}>

            <p className="text-yellow-400 text-xs uppercase tracking-[0.25em]">
              Pending Crafting
            </p>

            <h2 className="text-4xl font-bold text-yellow-400 mt-3">
              {pendingCrafting}
            </h2>

            <Hammer className="text-yellow-400 mt-4" />

          </div>

          {/* WITHDRAW */}
          <div className={`${cardBase} border-red-500/30`}>

            <p className="text-red-400 text-xs uppercase tracking-[0.25em]">
              Pending Withdraw
            </p>

            <h2 className="text-4xl font-bold text-red-400 mt-3">
              {pendingWithdraw}
            </h2>

            <AlertTriangle className="text-red-400 mt-4" />

          </div>

        </div>

        {/* ===================================== */}
        {/* INVENTORY */}
        {/* ===================================== */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-10">

          {/* RESOURCE */}
          <div className={`${cardBase}`}>

            <h2 className="text-red-400 text-2xl font-bold mb-5">
  RESOURCE
</h2>

            <div
  className="
    space-y-3
    max-h-[450px]
    overflow-y-auto
    pr-2
    jgb-scrollbar
  "
>

              {resourceInventory.map((item) => (

                <div
                  key={item.id}
                  className="
                    group
                    bg-gradient-to-br
                    from-white/[0.03]
                    to-white/[0.01]
                    hover:from-red-500/10
                    hover:to-red-500/5
                    transition-all
                    duration-300
                    p-4
                    rounded-2xl
                    border
                    border-white/5
                    hover:border-red-500/30
                    backdrop-blur-xl
                    hover:scale-[1.02]
                  "
                >

                  <p className="font-semibold">
                    {item.name}
                  </p>

                  <div className="flex items-center justify-between mt-3">

                    <span className="text-xs text-gray-500">
                      Available Stock
                    </span>

                    <span
                      className="
                        px-3
                        py-1
                        rounded-full
                        bg-white/5
                        border
                        border-white/10
                        text-sm
                        font-semibold
                      "
                    >
                      {Number(item.stock).toLocaleString()}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* PREPARE */}
          <div className={`${cardBase}`}>

            <h2 className="text-red-300 text-2xl font-bold mb-5">
              PREPAREAN
            </h2>

            <div
  className="
    space-y-3
    max-h-[450px]
    overflow-y-auto
    pr-2
    jgb-scrollbar
  "
>

              {prepareInventory.map((item) => (

                <div
                  key={item.id}
                  className="
                    group
                    bg-gradient-to-br
                    from-white/[0.03]
                    to-white/[0.01]
                    hover:from-red-500/10
                    hover:to-red-500/5
                    transition-all
                    duration-300
                    p-4
                    rounded-2xl
                    border
                    border-white/5
                    hover:border-red-500/30
                    backdrop-blur-xl
                    hover:scale-[1.02]
                  "
                >

                  <p className="font-semibold">
                    {item.name}
                  </p>

                  <div className="flex items-center justify-between mt-3">

                    <span className="text-xs text-gray-500">
                      Available Stock
                    </span>

                    <span
                      className="
                        px-3
                        py-1
                        rounded-full
                        bg-white/5
                        border
                        border-white/10
                        text-sm
                        font-semibold
                      "
                    >
                      {Number(item.stock).toLocaleString()}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </AppLayout>
  );
}