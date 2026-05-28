import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import StatCard from "../components/common/StatCard";

import { useAuth } from "../contexts/AuthContext";

import { db } from "../services/firebase/config";

// ============================================
// CRAFTING RECIPES
// ============================================
const CRAFTING_RECIPES = [
  {
    name: "Light Armor",
    outputAmount: 1,
    materials: [
      { item: "Paketan Jamur", qty: 2 },
      { item: "Paketan Singkong", qty: 3 },
      { item: "Botol", qty: 5 },
      { item: "Kulit Jadi", qty: 5 },
      { item: "Alumunium Powder", qty: 10 },
      { item: "Iron Powder", qty: 10 },
      { item: "Baju", qty: 15 },
      { item: "Emas", qty: 15 },
      { item: "Karet", qty: 15 },
      { item: "Baja", qty: 20 },
      { item: "Alumunium", qty: 20 },
      { item: "MetalScrap", qty: 20 },
      { item: "Kain", qty: 20 },
      { item: "Besi", qty: 20 },
      { item: "Tembaga", qty: 20 },
      { item: "Kayu Kemasan", qty: 50 },
    ],
  },

  {
    name: "Peluru .44 Magnum",
    outputAmount: 16,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 3 },
      { item: "Paketan Borax", qty: 6 },
      { item: "Kaca", qty: 10 },
      { item: "Besi", qty: 25 },
      { item: "Tembaga", qty: 30 },
    ],
  },

  {
    name: "Peluru 9mm",
    outputAmount: 35,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 3 },
      { item: "Borax", qty: 5 },
      { item: "Kaca", qty: 10 },
      { item: "Besi", qty: 20 },
      { item: "Tembaga", qty: 25 },
    ],
  },

  {
    name: "Peluru Double Action",
    outputAmount: 16,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 3 },
      { item: "Paketan Borax", qty: 6 },
      { item: "Kaca", qty: 10 },
      { item: "Tembaga", qty: 25 },
      { item: "Besi", qty: 30 },
    ],
  },

  {
    name: "Peluru 7.62 X 39",
    outputAmount: 45,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 5 },
      { item: "Paketan Borax", qty: 6 },
      { item: "Kaca", qty: 15 },
      { item: "Besi", qty: 30 },
      { item: "Tembaga", qty: 35 },
    ],
  },

  {
    name: "Peluru .50 MBG",
    outputAmount: 5,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 5 },
      { item: "Paketan Borax", qty: 6 },
      { item: "Kaca", qty: 15 },
      { item: "Besi", qty: 35 },
      { item: "Tembaga", qty: 40 },
    ],
  },

  {
    name: "Lockpick",
    outputAmount: 1,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 2 },
      { item: "Paketan Singkong", qty: 3 },
      { item: "Besi", qty: 5 },
      { item: "Botol", qty: 15 },
      { item: "Tembaga", qty: 15 },
    ],
  },

  {
    name: "Alat Peretas",
    outputAmount: 1,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 4 },
      { item: "Emas", qty: 5 },
      { item: "Besi", qty: 11 },
      { item: "Tembaga", qty: 56 },
    ],
  },

  {
    name: "Thermite",
    outputAmount: 1,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 2 },
      { item: "Borax", qty: 3 },
      { item: "Plastik", qty: 10 },
      { item: "Tembaga", qty: 27 },
    ],
  },

  {
    name: "Drill",
    outputAmount: 1,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Borax", qty: 3 },
      { item: "Paketan Jamur", qty: 3 },
      { item: "Botol", qty: 10 },
      { item: "Tembaga", qty: 27 },
    ],
  },
];

export default function CraftingPage() {

  const { role, user } =
    useAuth();

  const [inventory, setInventory] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [selectedRecipe, setSelectedRecipe] =
    useState("Light Armor");

  // ============================================
  // SUCCESS & FAILED QTY
  // ============================================
  const [successQuantity, setSuccessQuantity] =
    useState(1);

  const [failedQuantity, setFailedQuantity] =
    useState(0);

  // ============================================
  // HISTORY
  // ============================================
  const [
    craftingHistory,
    setCraftingHistory,
  ] = useState([]);

  const [
    historyPage,
    setHistoryPage,
  ] = useState(1);

  const HISTORY_LIMIT = 5;

  // ============================================
  // REALTIME INVENTORY
  // ============================================
  useEffect(() => {

    const q = query(
      collection(
        db,
        "inventory"
      ),
      orderBy("name")
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
                  !item.deleted
              );

          setInventory(data);
        },
        (error) => {

          console.error(
            error
          );

          toast.error(
            "Failed loading inventory"
          );
        }
      );

    return () => unsubscribe();

  }, []);

  // ============================================
  // REALTIME HISTORY
  // ============================================
  useEffect(() => {

    const q = query(
      collection(
        db,
        "crafting_history"
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
                ...doc.data(),
              })
            );

          setCraftingHistory(
            data
          );
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // ============================================
  // SELECTED RECIPE
  // ============================================
  const recipe = useMemo(() => {

    return CRAFTING_RECIPES.find(
      (item) =>
        item.name ===
        selectedRecipe
    );

  }, [selectedRecipe]);

// ============================================
// SAFE NUMBER
// ============================================
const successQty =
  parseInt(successQuantity) || 0;

const failedQty =
  parseInt(failedQuantity) || 0;

const outputPerCraft =
  parseInt(recipe?.outputAmount) || 0;

// ============================================
// TOTAL PROCESS
// ============================================
const totalCraftProcess =
  successQty + failedQty;

// ============================================
// TOTAL OUTPUT
// LOGIC:
// SUCCESS = menghasilkan output
// FAILED = mengurangi output
// ============================================
const totalOutput =
  Math.max(
    0,
    (successQty - failedQty) *
      outputPerCraft
  );

  // ============================================
  // FIND INVENTORY ITEM
  // ============================================
  const findInventoryItem =
    (itemName) => {

      return inventory.find(
        (inv) =>
          inv.name
            ?.toLowerCase()
            .trim() ===
          itemName
            ?.toLowerCase()
            .trim()
      );
    };

  // ============================================
  // CHECK MATERIALS
  // ============================================
  const checkMaterials = (
    recipeData,
    qtyMultiplier = 1
  ) => {

    for (const material of recipeData.materials) {

      const inventoryItem =
        findInventoryItem(
          material.item
        );

      const requiredQty =
        Number(material.qty) *
        Number(qtyMultiplier);

      const currentStock =
        Number(
          inventoryItem?.stock || 0
        );

      if (
        !inventoryItem ||
        currentStock < requiredQty
      ) {

        return {
          success: false,
          missing: material.item,
        };
      }
    }

    return {
      success: true,
    };
  };

  // ============================================
  // REDUCE MATERIALS
  // ============================================
  const reduceInventoryMaterials =
    async (
      materials,
      qty
    ) => {

      for (const material of materials) {

        const inventoryItem =
          findInventoryItem(
            material.item
          );

        if (!inventoryItem)
          continue;

        const reduceAmount =
          Number(material.qty) *
          Number(qty);

        await updateDoc(
          doc(
            db,
            "inventory",
            inventoryItem.id
          ),
          {
            stock:
              increment(
                -reduceAmount
              ),
          }
        );
      }
    };

  // ============================================
  // ADD RESULT ITEM
  // ============================================
  const addCraftedItemToInventory =
    async (
      itemName,
      qty
    ) => {

      if (Number(qty) <= 0)
        return;

      const craftedItem =
        findInventoryItem(
          itemName
        );

      if (craftedItem) {

        await updateDoc(
          doc(
            db,
            "inventory",
            craftedItem.id
          ),
          {
            stock:
              increment(
                Number(qty)
              ),
          }
        );

      } else {

        await addDoc(
          collection(
            db,
            "inventory"
          ),
          {
            name: itemName,

            category:
              "CRAFTING",

            stock:
              Number(qty),

            imageUrl: "",

            createdAt:
              serverTimestamp(),
          }
        );
      }
    };

  // ============================================
  // ADD HISTORY
  // ============================================
  const addCraftingHistory =
    async ({
      recipeName,
      successQty,
      failedQty,
      outputQty,
      status,
    }) => {

      await addDoc(
        collection(
          db,
          "crafting_history"
        ),
        {
          recipeName,

          successQty:
            Number(successQty),

          failedQty:
            Number(failedQty),

          outputQty:
            Number(outputQty),

          totalProcess:
            Number(successQty) +
            Number(failedQty),

          status,

          craftedBy:
            user?.rpName ||
            user?.name ||
            "Unknown",

          craftedByUid:
            user?.uid,

          role,

          createdAt:
            serverTimestamp(),
        }
      );
    };

      // ============================================
  // ADD ACTIVITY LOG
  // ============================================
  const addActivityLog =
    async ({
      type,
      action,
      target,
      quantity,
      description,
    }) => {

      await addDoc(
        collection(
          db,
          "activity_logs"
        ),
        {
          type,

          action,

          target,

          quantity,

          description,

          role,

          userId:
            user?.uid,

          userName:
            user?.rpName ||
            user?.name ||
            "Unknown",

          createdAt:
            serverTimestamp(),
        }
      );
    };



  // ============================================
  // CREATE CRAFTING
  // ============================================
  const handleCreateCrafting =
    async () => {

      try {

        setLoading(true);

        if (
          totalCraftProcess <= 0
        ) {

          toast.error(
            "Masukkan quantity crafting"
          );

          return;
        }

        const validation =
          checkMaterials(
            recipe,
            totalCraftProcess
          );

        if (
          !validation.success
        ) {

          toast.error(
            `Stock ${validation.missing} tidak cukup`
          );

          return;
        }

        // ====================================
        // OYABUN AUTO CRAFT
        // ====================================
        if (
          role ===
          "Oyabun"
        ) {

          // KURANGI MATERIAL
          await reduceInventoryMaterials(
            recipe.materials,
            totalCraftProcess
          );

          // ADD OUTPUT
          await addCraftedItemToInventory(
            recipe.name,
            totalOutput
          );

          // HISTORY
          await addCraftingHistory({
            recipeName:
              recipe.name,

            successQty:
              successQty,

            failedQty:
              failedQty,

            outputQty:
              totalOutput,

            status:
  failedQty > 0
    ? "Partial Failed"
    : "Crafted",
          });

          toast.success(
            "Crafting berhasil diproses"
          );

          setSuccessQuantity(1);

          setFailedQuantity(0);

          return;
        }

                  // ACTIVITY LOG
          await addActivityLog({
            type:
              failedQty > 0
                ? "crafting_failed"
                : "crafting_approved",

            action:
              failedQty > 0
                ? "Craft Partial Failed"
                : "Craft Completed",

            target:
              recipe.name,

            quantity:
              totalOutput,

            description:
              `${user?.rpName || user?.name} crafted ${recipe.name} with ${successQty} success and ${failedQty} failed`,
          });

        // ====================================
        // SHATEI REQUEST
        // ====================================
        await addDoc(
          collection(
            db,
            "crafting_requests"
          ),
          {
            recipeName:
              recipe.name,

            resultItem:
              recipe.name,

            resultAmount:
              Number(totalOutput),

            category:
              "CRAFTING",

            successQty:
              Number(successQuantity),

            failedQty:
              Number(failedQuantity),

            totalProcess:
              totalCraftProcess,

            materials:
              recipe.materials.map(
                (
                  material
                ) => ({
                  item:
                    material.item,

                  amount:
                    Number(
                      material.qty
                    ) *
                    Number(
                      totalCraftProcess
                    ),
                })
              ),

            requestedBy:
              user?.rpName ||
              user?.name,

            requestedByUid:
              user?.uid,

            status:
              "Pending",

            createdAt:
              serverTimestamp(),
          }
        );

                // ACTIVITY LOG
        await addActivityLog({
          type:
            "crafting_request",

          action:
            "Craft Request",

          target:
            recipe.name,

          quantity:
            totalOutput,

          description:
            `${user?.rpName || user?.name} requested crafting ${recipe.name} with ${successQty} success and ${failedQty} failed`,
        });


       // HISTORY
await addCraftingHistory({
  recipeName:
    recipe.name,

  successQty:
    successQty,

  failedQty:
    failedQty,

  outputQty:
    Number(totalOutput),

  status:
    "Pending",
});

        toast.success(
          "Request crafting dikirim"
        );

        setSuccessQuantity(1);

        setFailedQuantity(0);

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed create crafting"
        );

      } finally {

        setLoading(false);
      }
    };


      // ============================================
  // CLEAR HISTORY
  // ============================================
  const handleClearHistory = async () => {

    if (role !== "Oyabun") {
      toast.error("Only Oyabun can clear history");
      return;
    }

    const confirmDelete = window.confirm(
      "Yakin ingin menghapus semua crafting history?"
    );

    if (!confirmDelete) return;

    try {

      setLoading(true);

      const snapshot = await getDocs(
        collection(db, "crafting_history")
      );

      const promises = snapshot.docs.map((item) =>
        deleteDoc(
          doc(db, "crafting_history", item.id)
        )
      );

      await Promise.all(promises);

      toast.success("Crafting history cleared");

    } catch (error) {

      console.error(error);

      toast.error("Failed clear history");

    } finally {

      setLoading(false);
    }
  };


  // ============================================
  // PAGINATION HISTORY
  // ============================================
  const totalHistoryPages =
    Math.ceil(
      craftingHistory.length /
        HISTORY_LIMIT
    );

  const paginatedHistory =
    craftingHistory.slice(
      (historyPage - 1) *
        HISTORY_LIMIT,
      historyPage *
        HISTORY_LIMIT
    );

  return (

    <AppLayout>

      <div className="text-white">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Crafting
          </h1>

          <p className="text-gray-400 mt-2">
            Crafting management system
          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

          <StatCard
            title="Available Recipes"
            value={
              CRAFTING_RECIPES.length
            }
          />

          <StatCard
            title="Your Role"
            value={role}
          />

        </div>

        {/* FORM */}
        <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6 mb-10">

          <h2 className="text-2xl font-bold mb-6">
            Create Crafting
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>

              <label className="text-sm text-gray-400">
                Select Item
              </label>

              <select
                value={
                  selectedRecipe
                }
                onChange={(e) =>
                  setSelectedRecipe(
                    e.target.value
                  )
                }
                className="w-full mt-2 bg-black border border-gray-700 rounded-2xl px-4 py-3"
              >

                {CRAFTING_RECIPES.map(
                  (
                    recipe
                  ) => (

                    <option
                      key={
                        recipe.name
                      }
                      value={
                        recipe.name
                      }
                    >
                      {
                        recipe.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>

                <label className="text-sm text-green-400">
                  Success Qty
                </label>

                <input
                  type="number"
                  min={0}
                  value={
                    successQuantity
                  }
                  onChange={(e) =>
                    setSuccessQuantity(
  Math.max(
    0,
    Number(e.target.value)
                      )
                    )
                  }
                  className="w-full mt-2 bg-black border border-green-700 rounded-2xl px-4 py-3"
                />

              </div>

              <div>

                <label className="text-sm text-red-400">
                  Failed Qty
                </label>

                <input
                  type="number"
                  min={0}
                  value={
                    failedQuantity
                  }
                  onChange={(e) =>
                    setFailedQuantity(
  Math.max(
    0,
    Number(e.target.value)
                      )
                    )
                  }
                  className="w-full mt-2 bg-black border border-red-700 rounded-2xl px-4 py-3"
                />

              </div>

            </div>

          </div>

          {/* MATERIALS */}
          <div className="mt-8">

            <h3 className="text-xl font-bold mb-4">
              Required Materials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

              {recipe?.materials.map(
                (
                  material,
                  index
                ) => {

                  const inventoryItem =
                    findInventoryItem(
                      material.item
                    );

                  const required =
                    Number(
                      material.qty
                    ) *
                    Number(
                      totalCraftProcess
                    );

                  const currentStock =
                    Number(
                      inventoryItem?.stock ||
                        0
                    );

                  const enough =
                    currentStock >=
                    required;

                  return (

                    <div
                      key={index}
                      className="bg-black border border-gray-700 rounded-2xl p-4"
                    >

                      <div className="flex justify-between items-center">

                        <div>

                          <h4 className="font-bold">
                            {
                              material.item
                            }
                          </h4>

                          <p className="text-gray-400 text-sm mt-1">
                            Need:
                            {" "}
                            {
                              required
                            }
                          </p>

                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            enough
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          Stock:
                          {" "}
                          {
                            currentStock
                          }
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {/* OUTPUT INFO */}
          <div className="mt-6 bg-black border border-gray-700 rounded-2xl p-4">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div>

                <p className="text-gray-400 text-sm">
                  Success Craft
                </p>

                <h2 className="text-3xl font-bold text-green-400 mt-2">
                  {successQty}
                </h2>

              </div>

              <div>

                <p className="text-gray-400 text-sm">
                  Failed Craft
                </p>

                <h2 className="text-3xl font-bold text-red-400 mt-2">
                  {failedQty}
                </h2>

              </div>

              <div>

                <p className="text-gray-400 text-sm">
                  Total Output
                </p>

                <h2 className="text-3xl font-bold mt-2 text-[#7A0019]">

                  {Number(totalOutput || 0)} pcs

                </h2>

              </div>

            </div>

          </div>

          <button
            onClick={
              handleCreateCrafting
            }
            disabled={loading}
            className="mt-8 bg-[#7A0019] hover:bg-[#99001f] disabled:opacity-50 rounded-2xl px-6 py-4 font-semibold"
          >

            {loading
              ? "Loading..."
              : role ===
                "Oyabun"
              ? "Craft Now"
              : "Request Crafting"}

          </button>

        </div>

        {/* HISTORY */}
        <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6">

         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

  <div>

    <h2 className="text-3xl font-bold">
      Crafting History
    </h2>

    <p className="text-gray-400 mt-2">
      Semua riwayat crafting player
    </p>

  </div>

  {role === "Oyabun" && (
    <button
      onClick={handleClearHistory}
      disabled={loading}
      className="bg-red-700 hover:bg-red-800 disabled:opacity-50 transition-all px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-red-900/30"
    >
      {loading
        ? "Clearing..."
        : "Clear History"}
    </button>
  )}

</div>

          <div className="space-y-5">

            {paginatedHistory.map(
              (item) => (

                <div
                  key={item.id}
                  className="bg-black border border-gray-800 rounded-3xl p-6"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    <div>

                      <div className="flex items-center gap-3 flex-wrap">

                        <h3 className="text-2xl font-bold">
                          {
                            item.recipeName
                          }
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status ===
                            "Crafted"
                              ? "bg-green-500/20 text-green-300"
                              : item.status ===
                                "Partial Failed"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {
                            item.status
                          }
                        </span>

                      </div>

                      <div className="flex flex-wrap gap-3 mt-4">

                        <span className="bg-[#111111] px-4 py-2 rounded-xl text-sm">
                          Success:
                          {" "}
                          {
                            item.successQty || 0
                          }
                        </span>

                        <span className="bg-[#111111] px-4 py-2 rounded-xl text-sm">
                          Failed:
                          {" "}
                          {
                            item.failedQty || 0
                          }
                        </span>

                        <span className="bg-[#111111] px-4 py-2 rounded-xl text-sm">
                          Output:
                          {" "}
                          {
                            item.outputQty || 0
                          }
                        </span>

                        <span className="bg-[#111111] px-4 py-2 rounded-xl text-sm">
                          By:
                          {" "}
                          {
                            item.craftedBy
                          }
                        </span>

                      </div>

                    </div>

                    <div className="text-right">

                      <p className="text-gray-400 text-sm">
                        Crafting Item
                      </p>

                      <h2 className="text-4xl font-bold text-[#7A0019] mt-2">
                        {
                          item.recipeName
                        }
                      </h2>

                    </div>

                  </div>

                </div>
              )
            )}

            {paginatedHistory.length ===
              0 && (

              <div className="bg-black border border-dashed border-gray-700 rounded-3xl p-10 text-center text-gray-400">

                Tidak ada history crafting

              </div>

            )}

          </div>

          {/* PAGINATION */}
          {totalHistoryPages >
            1 && (

            <div className="flex items-center justify-center gap-3 mt-10 flex-wrap">

              <button
                disabled={
                  historyPage === 1
                }
                onClick={() =>
                  setHistoryPage(
                    (
                      prev
                    ) =>
                      prev - 1
                  )
                }
                className="bg-black border border-gray-700 px-5 py-3 rounded-2xl disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({
                length:
                  totalHistoryPages,
              }).map(
                (_, index) => (

                  <button
                    key={index}
                    onClick={() =>
                      setHistoryPage(
                        index + 1
                      )
                    }
                    className={`px-5 py-3 rounded-2xl ${
                      historyPage ===
                      index + 1
                        ? "bg-[#7A0019]"
                        : "bg-black border border-gray-700"
                    }`}
                  >
                    {index + 1}
                  </button>

                )
              )}

              <button
                disabled={
                  historyPage ===
                  totalHistoryPages
                }
                onClick={() =>
                  setHistoryPage(
                    (
                      prev
                    ) =>
                      prev + 1
                  )
                }
                className="bg-black border border-gray-700 px-5 py-3 rounded-2xl disabled:opacity-40"
              >
                Next
              </button>

            </div>

          )}

        </div>

      </div>

    </AppLayout>
  );
}