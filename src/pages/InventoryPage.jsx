import {
  useEffect,
  useMemo,
  useState,
} from "react";

import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

import toast from "react-hot-toast";

import axios from "axios";

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

import EmptyState from "../components/common/EmptyState";

import StatCard from "../components/common/StatCard";

import { useAuth } from "../contexts/AuthContext";

import { db } from "../services/firebase/config";

import { INVENTORY_CATEGORIES } from "../utils/constants";

import { createActivityLog } from "../utils/activityLogger";

const ITEMS_PER_PAGE = 9;

const IMGBB_API_KEY =
  "699c6fb5dc80bf81c0f7251767598e13";

export default function InventoryPage() {

  const { role, user } =
    useAuth();

  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [filter, setFilter] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [form, setForm] =
    useState({
      name: "",
      category: "DISNAKER",
      stock: "",
    });

  // =========================================
  // NORMALIZE CATEGORY
  // =========================================
  const normalizeCategory = (
    category
  ) => {

    if (!category) return "";

    const value = String(
      category
    )
      .trim()
      .toUpperCase();

    // FIX PREPAREAN
    if (
      value === "PREPAREAN" ||
      value === "PERSENJATAAN" ||
      value === "PREPARE"
    ) {
      return "PREPAREAN";
    }

    return value;
  };

  // =========================================
  // REALTIME INVENTORY
  // =========================================
  useEffect(() => {

    const inventoryRef = query(
      collection(db, "inventory"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe =
      onSnapshot(
        inventoryRef,
        (snapshot) => {

          const data =
            snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
                category:
                  normalizeCategory(
                    doc.data()
                      .category
                  ),
              }))
              .filter(
                (item) =>
                  !item.deleted
              );

          setItems(data);
        },
        (error) => {

          console.error(error);

          toast.error(
            "Failed loading inventory"
          );
        }
      );

    return () => unsubscribe();

  }, []);

  // =========================================
  // RESET PAGE
  // =========================================
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  // =========================================
  // STATS
  // =========================================
  const totalStock = useMemo(() => {

    return items.reduce(
      (acc, item) =>
        acc +
        Number(
          item.stock || 0
        ),
      0
    );

  }, [items]);

  const totalItems = useMemo(() => {
    return items.length;
  }, [items]);

  const lowStockItems = useMemo(() => {

    return items.filter(
      (item) =>
        Number(item.stock || 0) <= 5
    ).length;

  }, [items]);

  // =========================================
  // FILTER ITEMS
  // =========================================
  const filteredItems = useMemo(() => {

    let filtered = [...items];

    // CATEGORY FILTER
    if (filter !== "All") {

      filtered = filtered.filter(
        (item) =>
          normalizeCategory(
            item.category
          ) ===
          normalizeCategory(
            filter
          )
      );
    }

    // SEARCH
    if (search.trim()) {

      filtered = filtered.filter(
        (item) =>
          item.name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          item.category
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }

    return filtered;

  }, [items, filter, search]);

  // =========================================
  // PAGINATION
  // =========================================
  const totalPages = Math.ceil(
    filteredItems.length /
      ITEMS_PER_PAGE
  );

  const paginatedItems = useMemo(() => {

    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredItems.slice(
      start,
      start + ITEMS_PER_PAGE
    );

  }, [filteredItems, currentPage]);

  // =========================================
  // ADD ITEM
  // =========================================
  const handleAddItem = async (e) => {

    e.preventDefault();

    if (!form.name || !form.stock) {

      toast.error(
        "Complete all fields"
      );

      return;
    }

    try {

      setLoading(true);

      const normalizedCategory =
        normalizeCategory(
          form.category
        );

      // =====================================
      // MEMBER REQUEST
      // =====================================
      if (role !== "Oyabun") {

        await addDoc(
          collection(
            db,
            "inventory_requests"
          ),
          {
            type: "ADD_ITEM",

            name: form.name,

            category:
              normalizedCategory,

            stock: Number(
              form.stock
            ),

            requestedBy:
              user?.displayName ||
              "Unknown",

            status: "pending",

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Request sent to Oyabun"
        );

        setForm({
          name: "",
          category: "DISNAKER",
          stock: "",
        });

        return;
      }

      // =====================================
      // OYABUN DIRECT ADD
      // =====================================
      await addDoc(
        collection(db, "inventory"),
        {
          name: form.name,

          category:
            normalizedCategory,

          stock: Number(
            form.stock
          ),

          imageUrl: "",

          createdAt:
            serverTimestamp(),
        }
      );

      await createActivityLog({
        action: "ADD_INVENTORY",

        user:
          user?.displayName ||
          "Unknown",

        role,

        target: form.name,
      });

      toast.success(
        "Item added"
      );

      setForm({
        name: "",
        category: "DISNAKER",
        stock: "",
      });

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to add item"
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================================
  // UPDATE STOCK
  // =========================================
  const updateStock = async (
    item,
    type
  ) => {

    const input = prompt(
      type === "add"
        ? `Add stock for ${item.name}`
        : `Reduce stock for ${item.name}`
    );

    if (!input) return;

    const amount = Number(input);

    if (
      isNaN(amount) ||
      amount <= 0
    ) {

      toast.error(
        "Invalid amount"
      );

      return;
    }

    try {

      // =====================================
      // MEMBER REQUEST
      // =====================================
      if (role !== "Oyabun") {

        await addDoc(
          collection(
            db,
            "inventory_requests"
          ),
          {
            type:
              type === "add"
                ? "ADD_STOCK"
                : "REDUCE_STOCK",

            itemId: item.id,

            itemName: item.name,

            amount,

            requestedBy:
              user?.displayName ||
              "Unknown",

            status: "pending",

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Request sent to Oyabun"
        );

        return;
      }

      // =====================================
      // OYABUN UPDATE
      // =====================================
      const finalAmount =
        type === "add"
          ? amount
          : -amount;

      const nextStock =
        Number(item.stock || 0) +
        finalAmount;

      if (nextStock < 0) {

        toast.error(
          "Stock cannot be below 0"
        );

        return;
      }

      await updateDoc(
        doc(
          db,
          "inventory",
          item.id
        ),
        {
          stock:
            increment(
              finalAmount
            ),
        }
      );

      toast.success(
        type === "add"
          ? "Stock added"
          : "Stock reduced"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed update stock"
      );
    }
  };

  // =========================================
  // IMAGE UPLOAD
  // =========================================
  const handleUploadPhoto = async (
    item,
    file
  ) => {

    if (!file) return;

    if (role !== "Oyabun") {

      toast.error(
        "Only Oyabun can upload photo"
      );

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      toast.error(
        "Invalid image format"
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      toast.error(
        "Max image size is 5MB"
      );

      return;
    }

    try {

      setUploadingImage(true);

      const formData =
        new FormData();

      formData.append(
        "image",
        file
      );

      const response =
        await axios.post(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          formData,
          {
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      if (
        !response.data.success
      ) {

        throw new Error(
          "Upload failed"
        );
      }

      const imageUrl =
        response.data.data.display_url;

      await updateDoc(
        doc(
          db,
          "inventory",
          item.id
        ),
        {
          imageUrl,
        }
      );

      toast.success(
        "Photo uploaded"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Upload failed"
      );

    } finally {

      setUploadingImage(false);
    }
  };

  // =========================================
  // EDIT ITEM
  // =========================================
  const handleEditItem = async (
    item
  ) => {

    if (role !== "Oyabun") {

      toast.error(
        "Only Oyabun can edit"
      );

      return;
    }

    const newName = prompt(
      "Edit item name",
      item.name
    );

    if (!newName) return;

    const newStock = prompt(
      "Edit stock",
      item.stock
    );

    if (!newStock) return;

    try {

      await updateDoc(
        doc(
          db,
          "inventory",
          item.id
        ),
        {
          name: newName,

          stock:
            Number(newStock),
        }
      );

      toast.success(
        "Item updated"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed update item"
      );
    }
  };

  // =========================================
  // DELETE ITEM
  // =========================================
  const deleteItem = async (
    item
  ) => {

    if (role !== "Oyabun") {

      toast.error(
        "Only Oyabun can delete"
      );

      return;
    }

    try {

      await updateDoc(
        doc(
          db,
          "inventory",
          item.id
        ),
        {
          deleted: true,

          deletedAt:
            serverTimestamp(),
        }
      );

      toast.success(
        "Item deleted"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Delete failed"
      );
    }
  };

  // =========================================
  // EXPORT EXCEL
  // =========================================
  const exportInventory = () => {

    try {

      const exportData =
        items.map((item) => ({
          Name: item.name,

          Category:
            item.category,

          Stock: item.stock,
        }));

      const worksheet =
        XLSX.utils.json_to_sheet(
          exportData
        );

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Inventory"
      );

      const excelBuffer =
        XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

      const data = new Blob(
        [excelBuffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        }
      );

      saveAs(
        data,
        "Inventory_Data.xlsx"
      );

      toast.success(
        "Export success"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Export failed"
      );
    }
  };

  // =========================================
  // IMPORT EXCEL
  // =========================================
  const importExcel = async (e) => {

    try {

      const file =
        e.target.files[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload = async (
        event
      ) => {

        const data =
          event.target.result;

        const workbook =
          XLSX.read(data, {
            type: "binary",
          });

        const sheetName =
          workbook.SheetNames[0];

        const worksheet =
          workbook.Sheets[
            sheetName
          ];

        const jsonData =
          XLSX.utils.sheet_to_json(
            worksheet
          );

        for (const row of jsonData) {

          await addDoc(
            collection(
              db,
              "inventory"
            ),
            {
              name:
                row.Name ||
                "Unknown",

              category:
                normalizeCategory(
                  row.Category ||
                    "DISNAKER"
                ),

              stock: Number(
                row.Stock || 0
              ),

              imageUrl: "",

              createdAt:
                serverTimestamp(),
            }
          );
        }

        toast.success(
          "Import success"
        );
      };

      reader.readAsBinaryString(
        file
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Import failed"
      );
    }
  };

  return (

    <AppLayout>

      <div className="text-white">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>

            <h1 className="text-4xl font-bold">
              Inventory
            </h1>

            <p className="text-gray-400 mt-2">
              Real-time inventory system
            </p>

          </div>

          <div className="flex gap-3 flex-wrap">

            <button
              onClick={
                exportInventory
              }
              className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-2xl font-semibold"
            >
              Export Excel
            </button>

            {role ===
              "Oyabun" && (

              <label className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-2xl font-semibold cursor-pointer">

                Import Excel

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  hidden
                  onChange={
                    importExcel
                  }
                />

              </label>
            )}

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <StatCard
            title="Total Stock"
            value={totalStock}
          />

          <StatCard
            title="Total Items"
            value={totalItems}
          />

          <StatCard
            title="Low Stock"
            value={lowStockItems}
          />

        </div>

        {/* FILTER */}
        <div className="flex gap-3 flex-wrap mb-6">

          {INVENTORY_CATEGORIES.map(
            (category) => (

              <button
                key={category}
                onClick={() =>
                  setFilter(
                    category
                  )
                }
                className={`px-4 py-2 rounded-xl border transition-all ${
                  normalizeCategory(
                    filter
                  ) ===
                  normalizeCategory(
                    category
                  )
                    ? "bg-[#7A0019] border-[#7A0019]"
                    : "border-gray-700"
                }`}
              >
                {category}
              </button>
            )
          )}

        </div>

        {/* SEARCH */}
        <div className="mb-6">

          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full md:w-[400px] bg-[#111111] border border-gray-700 rounded-2xl px-5 py-3 outline-none"
          />

        </div>

        {/* FORM */}
        <form
          onSubmit={
            handleAddItem
          }
          className="bg-[#111111] border border-[#7A0019]/40 rounded-3xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >

          <input
            type="text"
            placeholder="Item Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name:
                  e.target.value,
              })
            }
            className="bg-black border border-gray-700 rounded-xl px-4 py-3"
          />

          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category:
                  e.target.value,
              })
            }
            className="bg-black border border-gray-700 rounded-xl px-4 py-3"
          >

            {INVENTORY_CATEGORIES
              .filter(
                (item) =>
                  item !== "All"
              )
              .map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}

          </select>

          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) =>
              setForm({
                ...form,
                stock:
                  e.target.value,
              })
            }
            className="bg-black border border-gray-700 rounded-xl px-4 py-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[#7A0019] hover:bg-[#99001f] disabled:opacity-50 rounded-xl px-4 py-3 font-semibold"
          >
            {loading
              ? "Loading..."
              : role ===
                "Oyabun"
              ? "Add Item"
              : "Request Item"}
          </button>

        </form>

        {/* ITEMS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {paginatedItems.map(
            (item) => (

              <div
                key={item.id}
                className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-5"
              >

                {/* IMAGE */}
                <div className="mb-4">

                  {item.imageUrl ? (

                    <img
                      src={
                        item.imageUrl
                      }
                      alt={item.name}
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/600x400?text=No+Image";
                      }}
                      className="w-full h-52 object-cover rounded-2xl"
                    />

                  ) : (

                    <div className="w-full h-52 border border-dashed border-gray-700 rounded-2xl flex items-center justify-center text-gray-500">
                      No Photo
                    </div>
                  )}

                </div>

                <div className="flex justify-between items-center">

                  <h2 className="text-xl font-bold">
                    {item.name}
                  </h2>

                  <span className="text-xs bg-[#7A0019]/20 text-red-300 px-3 py-1 rounded-full">
                    {item.category}
                  </span>

                </div>

                <div className="mt-5">

                  <p className="text-gray-400 text-sm">
                    Current Stock
                  </p>

                  <h3 className="text-4xl font-bold">
                    {item.stock}
                  </h3>

                </div>

                <div className="flex gap-3 mt-5">

                  <button
                    onClick={() =>
                      updateStock(
                        item,
                        "add"
                      )
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl py-3"
                  >
                    + Stock
                  </button>

                  <button
                    onClick={() =>
                      updateStock(
                        item,
                        "reduce"
                      )
                    }
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 rounded-xl py-3"
                  >
                    - Stock
                  </button>

                </div>

                {role ===
                  "Oyabun" && (

                  <div className="flex flex-col gap-3 mt-3">

                    <button
                      onClick={() =>
                        handleEditItem(
                          item
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl py-3"
                    >
                      Edit
                    </button>

                    <label className="bg-purple-600 hover:bg-purple-700 rounded-xl py-3 text-center cursor-pointer">

                      {uploadingImage
                        ? "Uploading..."
                        : "Upload Photo"}

                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleUploadPhoto(
                            item,
                            e.target
                              .files[0]
                          )
                        }
                      />

                    </label>

                    <button
                      onClick={() =>
                        deleteItem(
                          item
                        )
                      }
                      className="bg-red-700 hover:bg-red-800 rounded-xl py-3"
                    >
                      Delete
                    </button>

                  </div>
                )}

              </div>
            )
          )}

        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (

          <div className="flex justify-center items-center gap-3 mt-10">

            <button
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    Math.max(
                      prev - 1,
                      1
                    )
                )
              }
              disabled={
                currentPage === 1
              }
              className="px-4 py-2 rounded-xl bg-[#111111] border border-gray-700 disabled:opacity-50"
            >
              Prev
            </button>

            <span>
              Page {currentPage} of{" "}
              {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
              className="px-4 py-2 rounded-xl bg-[#111111] border border-gray-700 disabled:opacity-50"
            >
              Next
            </button>

          </div>
        )}

        {/* EMPTY */}
        {filteredItems.length ===
          0 && (
          <div className="mt-6">
            <EmptyState title="No inventory items found" />
          </div>
        )}

      </div>

    </AppLayout>
  );
}