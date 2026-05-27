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
    name: "Peluru 7.62",
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
    name: "Lockpick",
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

  const [quantity, setQuantity] =
    useState(1);

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
  // REALTIME CRAFTING HISTORY
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
      quantity,
      status,
    }) => {

      await addDoc(
        collection(
          db,
          "crafting_history"
        ),
        {
          recipeName,

          quantity:
            Number(quantity),

          status,

          craftedBy:
            user?.displayName ||
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
  // CREATE CRAFTING
  // ============================================
  const handleCreateCrafting =
    async () => {

      try {

        setLoading(true);

        if (
          !quantity ||
          Number(quantity) <= 0
        ) {

          toast.error(
            "Invalid quantity"
          );

          return;
        }

        const validation =
          checkMaterials(
            recipe,
            quantity
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

          await reduceInventoryMaterials(
            recipe.materials,
            quantity
          );

          await addCraftedItemToInventory(
            recipe.name,
            quantity
          );

          // HISTORY
          await addCraftingHistory({
            recipeName:
              recipe.name,
            quantity,
            status:
              "Crafted",
          });

          toast.success(
            "Crafting berhasil"
          );

          setQuantity(1);

          return;
        }

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
              Number(quantity),

            category:
              "CRAFTING",

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
                      quantity
                    ),
                })
              ),

            requestedBy:
              user
                ?.displayName ||
              "Unknown",

            requestedByUid:
              user?.uid,

            status:
              "Pending",

            createdAt:
              serverTimestamp(),
          }
        );

        // HISTORY
        await addCraftingHistory({
          recipeName:
            recipe.name,
          quantity,
          status:
            "Pending",
        });

        toast.success(
          "Request crafting dikirim"
        );

        setQuantity(1);

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

            <div>

              <label className="text-sm text-gray-400">
                Quantity
              </label>

              <input
                type="number"
                min={1}
                value={
                  quantity
                }
                onChange={(e) =>
                  setQuantity(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="w-full mt-2 bg-black border border-gray-700 rounded-2xl px-4 py-3"
              />

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
                      quantity
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

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-bold">
                Crafting History
              </h2>

              <p className="text-gray-400 mt-2">
                Semua riwayat crafting player
              </p>

            </div>

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
                          Qty:
                          {" "}
                          {
                            item.quantity
                          }
                        </span>

                        <span className="bg-[#111111] px-4 py-2 rounded-xl text-sm">
                          By:
                          {" "}
                          {
                            item.craftedBy
                          }
                        </span>

                        <span className="bg-[#111111] px-4 py-2 rounded-xl text-sm">
                          Role:
                          {" "}
                          {
                            item.role
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