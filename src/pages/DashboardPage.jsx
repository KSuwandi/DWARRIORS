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
  // REALTIME DATA
  // =========================
  useEffect(() => {

    const unsubInventory = onSnapshot(
      query(collection(db, "inventory")),
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => !item.deleted);

        setInventory(data);
      }
    );

    let unsubFinance = () => {};
    let unsubCraft = () => {};
    let unsubWithdraw = () => {};

    if (user) {

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

          const filtered = data.filter((item) =>
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

    return () => {
      unsubInventory();
      unsubFinance();
      unsubCraft();
      unsubWithdraw();
    };

  }, [user]);

  // =========================
  // UANG MERAH STOCK
  // =========================
  const uangMerahStock = useMemo(() => {
    const item = inventory.find(
      (i) => i.name?.toLowerCase().trim() === "uang merah"
    );
    return Number(item?.stock || 0);
  }, [inventory]);

  // =========================
  // 🔥 UANG PUTIH STOCK
  // =========================
  const uangPutihStock = useMemo(() => {
    const item = inventory.find(
      (i) => i.name?.toLowerCase().trim() === "uang putih"
    );
    return Number(item?.stock || 0);
  }, [inventory]);

  // =========================
  // PENDING
  // =========================
  const pendingCrafting = useMemo(
    () => craftRequests.filter((i) => i.status === "Pending").length,
    [craftRequests]
  );

  const pendingWithdraw = useMemo(
    () => withdrawRequests.length,
    [withdrawRequests]
  );

  // =========================
  // CATEGORY
  // =========================
  const disnakerInventory = inventory.filter(
    (item) => item.category === "DISNAKER"
  );

  const barhamInventory = inventory.filter(
    (item) => item.category === "BARHAM"
  );

  const prepareInventory = inventory.filter(
    (item) =>
      item.category === "PREPARE" ||
      item.category === "PREPAREAN"
  );

  // =========================
  // CARD COMPONENT STYLE
  // =========================
  const cardBase =
    "bg-gradient-to-br from-[#111] to-black border rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1";

  return (
    <AppLayout>
      <div className="text-white w-full p-6">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Luxury management overview system
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* UANG MERAH */}
          <div className={`${cardBase} border-[#7A0019]/40`}>
            <p className="text-gray-400">Uang Merah</p>
            <h2 className="text-4xl font-bold text-red-400 mt-3">
              {uangMerahStock.toLocaleString()}
            </h2>
            <Boxes className="text-red-400 mt-4" />
          </div>

          {/* 🔥 UANG PUTIH */}
          <div className={`${cardBase} border-green-500/30`}>
            <p className="text-gray-400">Uang Putih</p>
            <h2 className="text-3xl font-bold text-green-400 mt-3">
              {uangPutihStock.toLocaleString()}
            </h2>
            <Wallet className="text-green-400 mt-4" />
          </div>

          {/* CRAFT */}
          <div className={`${cardBase} border-yellow-500/30`}>
            <p className="text-gray-400">Pending Crafting</p>
            <h2 className="text-4xl font-bold text-yellow-400 mt-3">
              {pendingCrafting}
            </h2>
            <Hammer className="text-yellow-400 mt-4" />
          </div>

          {/* WITHDRAW */}
          <div className={`${cardBase} border-red-500/30`}>
            <p className="text-gray-400">Pending Withdraw</p>
            <h2 className="text-4xl font-bold text-red-400 mt-3">
              {pendingWithdraw}
            </h2>
            <AlertTriangle className="text-red-400 mt-4" />
          </div>

        </div>

        {/* INVENTORY */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">

          {/* DISNAKER */}
          <div className={`${cardBase}`}>
            <h2 className="text-orange-400 text-2xl font-bold mb-5">
              DISNAKER
            </h2>

            <div className="space-y-3 max-h-[350px] overflow-auto pr-2">

              {disnakerInventory.map((item) => (

                <div
                  key={item.id}
                  className="bg-black/40 hover:bg-black/60 transition p-4 rounded-2xl border border-orange-500/10"
                >
                  <p className="font-semibold">
                    {item.name}
                  </p>

                  <p className="text-gray-400 text-sm">
                    Stock: {item.stock}
                  </p>
                </div>

              ))}

            </div>
          </div>

          {/* BARHAM */}
          <div className={`${cardBase}`}>
            <h2 className="text-red-400 text-2xl font-bold mb-5">
              BARHAM
            </h2>

            <div className="space-y-3 max-h-[350px] overflow-auto pr-2">

              {barhamInventory.map((item) => (

                <div
                  key={item.id}
                  className="bg-black/40 hover:bg-black/60 transition p-4 rounded-2xl border border-red-500/10"
                >
                  <p className="font-semibold">
                    {item.name}
                  </p>

                  <p className="text-gray-400 text-sm">
                    Stock: {item.stock}
                  </p>
                </div>

              ))}

            </div>
          </div>

          {/* PREPARE */}
          <div className={`${cardBase}`}>
            <h2 className="text-blue-400 text-2xl font-bold mb-5">
              PREPAREAN
            </h2>

            <div className="space-y-3 max-h-[350px] overflow-auto pr-2">

              {prepareInventory.map((item) => (

                <div
                  key={item.id}
                  className="bg-black/40 hover:bg-black/60 transition p-4 rounded-2xl border border-blue-500/10"
                >
                  <p className="font-semibold">
                    {item.name}
                  </p>

                  <p className="text-gray-400 text-sm">
                    Stock: {item.stock}
                  </p>
                </div>

              ))}

            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}