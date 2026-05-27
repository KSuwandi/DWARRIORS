import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  query,
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

  const { user, role } =
    useAuth();

  const [inventory, setInventory] =
    useState([]);

  const [finance, setFinance] =
    useState([]);

  const [craftRequests, setCraftRequests] =
    useState([]);

  const [withdrawRequests, setWithdrawRequests] =
    useState([]);

  // =========================================
  // REALTIME DATA
  // =========================================
  useEffect(() => {

    // INVENTORY
    const unsubInventory =
      onSnapshot(
        query(
          collection(
            db,
            "inventory"
          )
        ),
        (snapshot) => {

          const data =
            snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter(
                (item) =>
                  !item.deleted
              );

          setInventory(data);
        }
      );

    // USER DATA
    if (!user) {

      return () => {
        unsubInventory();
      };
    }

    const unsubFinance =
      onSnapshot(
        query(
          collection(
            db,
            "users",
            user.uid,
            "finance"
          )
        ),
        (snapshot) => {

          setFinance(
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            )
          );
        }
      );

    const unsubCraft =
      onSnapshot(
        query(
          collection(
            db,
            "users",
            user.uid,
            "craftingRequests"
          )
        ),
        (snapshot) => {

          setCraftRequests(
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            )
          );
        }
      );

    const unsubWithdraw =
      onSnapshot(
        query(
          collection(
            db,
            "users",
            user.uid,
            "withdrawRequests"
          )
        ),
        (snapshot) => {

          setWithdrawRequests(
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            )
          );
        }
      );

    return () => {
      unsubInventory();
      unsubFinance();
      unsubCraft();
      unsubWithdraw();
    };

  }, [user]);

  // =========================================
  // UANG MERAH STOCK
  // =========================================
  const uangMerahStock =
    useMemo(() => {

      const uangMerahItem =
        inventory.find(
          (item) =>
            item.name
              ?.toLowerCase()
              .trim() ===
            "uang merah"
        );

      return Number(
        uangMerahItem?.stock || 0
      );

    }, [inventory]);

  // =========================================
  // TOTAL BALANCE
  // =========================================
  const totalBalance =
    useMemo(() => {

      return finance.reduce(
        (acc, item) => {

          if (
            item.type ===
            "Deposit"
          ) {

            return (
              acc +
              Number(
                item.amount || 0
              )
            );
          }

          return (
            acc -
            Number(
              item.amount || 0
            )
          );

        },
        0
      );

    }, [finance]);

  // =========================================
  // PENDING REQUESTS
  // =========================================
  const pendingCrafting =
    useMemo(() => {

      return craftRequests.filter(
        (item) =>
          item.status ===
          "Pending"
      ).length;

    }, [craftRequests]);

  const pendingWithdraw =
    useMemo(() => {

      return withdrawRequests.filter(
        (item) =>
          item.status ===
          "Pending"
      ).length;

    }, [withdrawRequests]);

  // =========================================
  // CATEGORY DATA
  // =========================================
  const disnakerInventory =
    inventory.filter(
      (item) =>
        item.category ===
        "DISNAKER"
    );

  const barhamInventory =
    inventory.filter(
      (item) =>
        item.category ===
        "BARHAM"
    );

  const prepareInventory =
    inventory.filter(
      (item) =>
        item.category ===
          "PREPARE" ||
        item.category ===
          "PREPAREAN"
    );

  return (

    <AppLayout>

      <div className="text-white w-full">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-4xl font-bold">
                Dashboard
              </h1>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  role === "Oyabun"
                    ? "bg-red-600/20 text-red-300 border border-red-500/30"
                    : "bg-gray-700/30 text-gray-300 border border-gray-600"
                }`}
              >
                {role}
              </span>

            </div>

            <p className="text-gray-400 mt-2">
              Luxury Jigokubara
              management dashboard
            </p>

          </div>

        </div>

        {/* MAIN STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* UANG MERAH */}
          <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-400">
                  Uang Merah
                </p>

                <h2 className="text-4xl font-bold mt-3 text-red-400">
                  {uangMerahStock.toLocaleString()}
                </h2>

              </div>

              <Boxes
                size={40}
                className="text-red-400"
              />

            </div>

          </div>

          {/* BALANCE */}
          <div className="bg-[#111111] border border-green-500/30 rounded-3xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-400">
                  Organization Balance
                </p>

                <h2 className="text-3xl font-bold mt-3 text-green-400">
                  Rp {totalBalance.toLocaleString()}
                </h2>

              </div>

              <Wallet
                size={40}
                className="text-green-400"
              />

            </div>

          </div>

          {/* PENDING CRAFT */}
          <div className="bg-[#111111] border border-yellow-500/30 rounded-3xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-400">
                  Pending Crafting
                </p>

                <h2 className="text-4xl font-bold mt-3 text-yellow-400">
                  {pendingCrafting}
                </h2>

              </div>

              <Hammer
                size={40}
                className="text-yellow-400"
              />

            </div>

          </div>

          {/* PENDING WITHDRAW */}
          <div className="bg-[#111111] border border-red-500/30 rounded-3xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-400">
                  Pending Withdraw
                </p>

                <h2 className="text-4xl font-bold mt-3 text-red-400">
                  {pendingWithdraw}
                </h2>

              </div>

              <AlertTriangle
                size={40}
                className="text-red-400"
              />

            </div>

          </div>

        </div>

        {/* CATEGORY INVENTORY */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">

          {/* DISNAKER */}
          <div className="bg-[#111111] border border-orange-500/30 rounded-3xl p-6">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-2xl font-bold text-orange-400">
                DISNAKER
              </h2>

              <span className="text-sm text-gray-400">
                {disnakerInventory.length} Items
              </span>

            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">

              {disnakerInventory.length === 0 ? (

                <p className="text-gray-500 text-sm">
                  No items available
                </p>

              ) : (

                disnakerInventory.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="bg-black/40 border border-orange-500/10 rounded-2xl p-4"
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <h3 className="font-semibold text-lg">
                            {item.name}
                          </h3>

                          <p className="text-gray-400 text-sm">
                            Stock:
                            {" "}
                            {Number(
                              item.stock || 0
                            ).toLocaleString()}
                            pcs
                          </p>

                        </div>

                        <div className="text-orange-400 font-bold text-xl">
                          {item.stock}
                        </div>

                      </div>

                    </div>
                  )
                )
              )}

            </div>

          </div>

          {/* BARHAM */}
          <div className="bg-[#111111] border border-red-500/30 rounded-3xl p-6">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-2xl font-bold text-red-400">
                BARHAM
              </h2>

              <span className="text-sm text-gray-400">
                {barhamInventory.length} Items
              </span>

            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">

              {barhamInventory.length === 0 ? (

                <p className="text-gray-500 text-sm">
                  No items available
                </p>

              ) : (

                barhamInventory.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="bg-black/40 border border-red-500/10 rounded-2xl p-4"
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <h3 className="font-semibold text-lg">
                            {item.name}
                          </h3>

                          <p className="text-gray-400 text-sm">
                            Stock:
                            {" "}
                            {Number(
                              item.stock || 0
                            ).toLocaleString()}
                            pcs
                          </p>

                        </div>

                        <div className="text-red-400 font-bold text-xl">
                          {item.stock}
                        </div>

                      </div>

                    </div>
                  )
                )
              )}

            </div>

          </div>

          {/* PREPAREAN */}
          <div className="bg-[#111111] border border-blue-500/30 rounded-3xl p-6">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-2xl font-bold text-blue-400">
                PREPAREAN
              </h2>

              <span className="text-sm text-gray-400">
                {prepareInventory.length} Items
              </span>

            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">

              {prepareInventory.length === 0 ? (

                <p className="text-gray-500 text-sm">
                  No items available
                </p>

              ) : (

                prepareInventory.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="bg-black/40 border border-blue-500/10 rounded-2xl p-4"
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <h3 className="font-semibold text-lg">
                            {item.name}
                          </h3>

                          <p className="text-gray-400 text-sm">
                            Stock:
                            {" "}
                            {Number(
                              item.stock || 0
                            ).toLocaleString()}
                            pcs
                          </p>

                        </div>

                        <div className="text-blue-400 font-bold text-xl">
                          {item.stock}
                        </div>

                      </div>

                    </div>
                  )
                )
              )}

            </div>

          </div>

        </div>

      </div>

    </AppLayout>
  );
}