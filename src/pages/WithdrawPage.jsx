import AppLayout from "../layouts/AppLayout";
import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  db,
} from "../services/firebase/config";

export default function WithdrawPage() {
    
    const {
  user,
} = useAuth();

    const [inventory, setInventory] =
  useState([]);

const [selectedItem, setSelectedItem] =
  useState("");

  const [searchItem, setSearchItem] =
  useState("");
  
  const [showResults, setShowResults] =
  useState(false);

const [quantity, setQuantity] =
  useState(1);

const [withdrawCart, setWithdrawCart] =
  useState([]);

  const [borrowedItems, setBorrowedItems] =
  useState([]);
  const [selectedBorrow, setSelectedBorrow] =
  useState(null);

const [returnReason, setReturnReason] =
  useState("");

const [showReturnModal, setShowReturnModal] =
  useState(false);

  const [returnPhoto, setReturnPhoto] =
  useState(null);

const [uploadingPhoto, setUploadingPhoto] =
  useState(false);

  useEffect(() => {

  const loadInventory =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "inventory"
            )
          );

        const data =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setInventory(data);

        if (
          data.length > 0
        ) {

          setSelectedItem(
            data[0].id
          );

        }

      } catch (error) {

        console.error(
          "Load inventory error:",
          error
        );

      }
    };

  loadInventory();
  loadBorrowedItems();

}, []);

const loadBorrowedItems =
  async () => {

    try {

      const q =
        query(
          collection(
            db,
            "borrowed_items"
          ),
          where(
            "userId",
            "==",
            user?.uid
          ),
          where(
  "status",
  "in",
  [
    "Hutang",
    "Return Requested",
  ]
)
        );

      const snapshot =
        await getDocs(q);

      const data =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      setBorrowedItems(
        data
      );

    } catch (error) {

      console.error(
        error
      );

    }

  };

const currentItem =
  inventory.find(
    (item) =>
      item.id === selectedItem
  );

  const filteredInventory =
  inventory.filter(
    (item) =>
      item.name
        ?.toLowerCase()
        .includes(
          searchItem.toLowerCase()
        )
  );

  const handleAddItem =
  () => {

    if (!currentItem)
      return;

    const qty =
      Number(quantity);

    if (qty <= 0)
      return;

    setWithdrawCart(
      (prev) => {

        const existing =
          prev.find(
            (item) =>
              item.itemId ===
              currentItem.id
          );

        if (existing) {

          return prev.map(
            (item) =>
              item.itemId ===
              currentItem.id
                ? {
                    ...item,
                    quantity:
                      item.quantity +
                      qty,
                  }
                : item
          );
        }

        return [
          ...prev,
          {
            itemId:
              currentItem.id,

            itemName:
              currentItem.name,

            quantity:
              qty,
          },
        ];
      }
    );

    setQuantity(1);
  };

  const handleRemoveItem =
  (itemId) => {

    setWithdrawCart(
      (prev) =>
        prev.filter(
          (item) =>
            item.itemId !==
            itemId
        )
    );

  };

  const handleClearCart =
  () => {

    const confirmClear =
      window.confirm(
        "Clear all items?"
      );

    if (!confirmClear)
      return;

    setWithdrawCart([]);

  };

 const handleSubmitRequest =
  async () => {

    try {

      if (
        withdrawCart.length === 0
      ) {

        alert(
          "Add at least one item"
        );

        return;
      }

      await addDoc(
        collection(
          db,
          "withdraw_requests"
        ),
        {

          userId:
            user?.uid,

          rpName:
            user?.rpName ||
            "Unknown",

          items:
            withdrawCart,

          status:
            "Pending",

          createdAt:
            serverTimestamp(),
        }
      );

      alert(
        "Withdraw request submitted"
      );

      setWithdrawCart([]);

      setQuantity(1);

    } catch (error) {

      console.error(error);

      alert(
        "Failed submit request"
      );
    }
  };

  const uploadReturnPhoto =
  async () => {

    if (!returnPhoto)
      return null;

    try {

      setUploadingPhoto(
        true
      );

      const formData =
        new FormData();

      formData.append(
        "file",
        returnPhoto
      );

      formData.append(
        "upload_preset",
        "DWARRIORS"
      );

      const response =
        await fetch(
          "https://api.cloudinary.com/v1_1/dbn9lgdi4/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      setUploadingPhoto(
        false
      );

      return data.secure_url;

    } catch (error) {

      console.error(
        error
      );

      setUploadingPhoto(
        false
      );

      return null;

    }

  };

  const openReturnModal =
  (borrow) => {

    setSelectedBorrow(
      borrow
    );

    setShowReturnModal(
      true
    );

  };

  const handleSubmitReturn =
  async () => {

    try {

      if (!selectedBorrow)
        return;
      const photoUrl =
  await uploadReturnPhoto();

      
      await updateDoc(
  doc(
    db,
    "borrowed_items",
    selectedBorrow.id
  ),
  {

    returned:
      false,

    status:
      "Menunggu Pelunasan",

    returnReason:
      returnReason,

    returnPhoto:
      photoUrl,

    returnRequestedBy:
      user?.rpName,

    returnRequestedAt:
      serverTimestamp(),

  }
);

      await loadBorrowedItems();

      setShowReturnModal(
        false
      );

      setSelectedBorrow(
        null
      );

      setReturnReason(
        ""
      );

      setReturnPhoto(
        null
      );

      alert(
        "Items returned successfully"
      );

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Failed to return items"
      );

    }

  };


  return (

    <AppLayout>

      <div className="text-white">

        {/* HEADER */}

        <h1 className="text-5xl font-black">

          <span className="text-white">
            WITHDRAW
          </span>

          <span className="text-red-500 ml-2">
            CENTER
          </span>

        </h1>

        <p className="text-gray-400 mt-3 text-lg">

          Borrow resources and equipment
          from the DWARRIORS warehouse.

        </p>

        <p className="text-red-400 text-sm mt-3 uppercase tracking-[0.25em]">

          DWARRIORS PROPERTY

        </p>

        {/* HERO */}

        <div
          className="
            mt-8
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

          <p className="text-red-400 text-xs uppercase tracking-[0.3em]">
            PROPERTY CONTROL
          </p>

          <h2 className="text-3xl font-black mt-2">
            Borrow • Use • Return
          </h2>

          <p className="text-gray-400 mt-3">
            Every withdrawn item remains
            property of DWARRIORS and must
            be returned after use.
          </p>

        </div>


        <div
  className="
    grid
    grid-cols-1
    lg:grid-cols-3
    gap-6
  "
>

<div
  className="
    bg-[#111111]
    border
    border-red-900/30
    rounded-3xl
    p-6
  "
>

  <h2 className="text-xl font-black mb-5">
    REQUEST WITHDRAW
  </h2>

  <div className="space-y-4">

    <div>

      <label className="text-gray-400 text-sm">
        Item
      </label>

    <input
  type="text"
  placeholder="Search item..."
  value={searchItem}
  onFocus={() =>
    setShowResults(true)
  }
  onChange={(e) =>
    setSearchItem(
      e.target.value
    )
  }
  className="
    w-full
    bg-black
    border
    border-red-900/30
    rounded-xl
    px-4
    py-3
    text-white
  "
/>

{
  showResults && (

    <div
      className="
        max-h-56
        overflow-y-auto
        border
        border-red-900/30
        rounded-xl
        mt-2
        bg-[#0b0b0b]
      "
    >

  {filteredInventory
    .slice(0, 20)
    .map((item) => (

      <button
        key={item.id}
        type="button"
        onClick={() => {

  setSelectedItem(
    item.id
  );

  setSearchItem(
    item.name
  );

  setShowResults(
    false
  );

}}
        className="
          w-full
          text-left
          px-4
          py-3
          hover:bg-red-950/30
          border-b
          border-red-900/10
        "
      >

        {item.name}

      </button>
      

        ))}

    </div>

  )
}

<div
  className="
    bg-red-950/20
    border
    border-red-900/30
    rounded-xl
    p-4
  "
>    

  <p className="text-gray-400 text-sm">
    Selected Item
  </p>

  <p className="font-bold text-red-400">
    {currentItem?.name ||
      "No item selected"}
  </p>

</div>

    </div>
    

    <div>
        

      <label className="text-gray-400 text-sm">
        Quantity
      </label>

      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) =>
          setQuantity(
            e.target.value
          )
        }
        className="
          mt-2
          w-full
          bg-black
          border
          border-red-900/30
          rounded-xl
          px-4
          py-3
          text-white
        "
      />

    </div>

    <div
      className="
        bg-red-950/20
        border
        border-red-900/30
        rounded-xl
        p-4
      "
    >

      <p className="text-gray-400 text-sm">
        Stock Available
      </p>

      <p className="text-2xl font-bold text-red-400">
        {currentItem?.stock || 0}
      </p>

    </div>
    <button
  onClick={
    handleAddItem
  }
  className="
    w-full
    py-3
    rounded-xl
    border
    border-red-500/30
    bg-red-950/20
    hover:bg-red-950/40
    font-bold
  "
>

  ADD ITEM

</button>
<div
  className="
    border
    border-red-900/30
    rounded-xl
    p-4
    space-y-2
  "
>

  <p className="text-sm text-gray-400">
    Request List
  </p>

  <div
  className="
    flex
    justify-between
    items-center
  "
>

  <span className="text-xs text-gray-500">
    {withdrawCart.length}
    {" "}
    Items
  </span>

  {
    withdrawCart.length > 0 && (
      <button
        onClick={
          handleClearCart
        }
        className="
          text-xs
          text-red-400
          hover:text-red-300
        "
      >
        Clear All
      </button>
    )
  }

</div>

  {
    withdrawCart.length === 0
      ? (
          <p className="text-gray-500 text-sm">
            No items added
          </p>
        )
      : (
          withdrawCart.map(
            (item) => (

              <div
  key={item.itemId}
  className="
    flex
    items-center
    justify-between
    bg-black/30
    rounded-xl
    px-3
    py-2
  "
>

                <span>
                  {
                    item.itemName
                  }
                </span>

                <div
  className="
    flex
    items-center
    gap-3
  "
>

  <span className="text-red-400">
    x
    {item.quantity}
  </span>

  <button
    onClick={() =>
      handleRemoveItem(
        item.itemId
      )
    }
    className="
      text-xs
      px-2
      py-1
      rounded-lg
      bg-red-950/30
      hover:bg-red-800/50
      text-red-300
    "
  >
    REMOVE
  </button>

</div>

              </div>

            )
          )
        )
  }

</div>

   <button
  onClick={
    handleSubmitRequest
  }
  className="
    w-full
    py-3
    rounded-xl
    bg-red-600
    hover:bg-red-700
    font-bold
    transition-all
  "
>
  SUBMIT REQUEST
</button>

  </div>

</div>

  <div
    className="
      bg-[#111111]
      border
      border-red-900/30
      rounded-3xl
      p-6
    "
  >
    <h2 className="text-xl font-black mb-4">
  MY BORROWED ITEMS
</h2>

{
  borrowedItems.length === 0
    ? (
        <p className="text-gray-500">
          No active borrowed items
        </p>
      )
    : (
        borrowedItems.map(
          (borrow) => (

            <div
              key={borrow.id}
              className="
                border
                border-red-900/30
                rounded-xl
                p-4
                mb-4
              "
            >

              <div className="mb-3">

                <p className="text-sm text-gray-400">
                  Approved By
                </p>

                <p className="text-red-400 font-bold">
                  {borrow.approvedBy}
                  {" "}
                  (
                  {borrow.approvedByRole}
                  )
                </p>
                <div
  className="
    mt-3
    mb-3
    px-3
    py-2
    rounded-xl
    bg-red-950/20
    border
    border-red-900/30
  "
>

  <p className="text-gray-500 text-xs">
  Debt Code
</p>

<p className="font-black text-red-300">
    {
    borrow.debtCode ||
    borrow.borrowCode ||
    "-"
  }
</p>
  <div
  className="
    mt-3
    px-3
    py-2
    rounded-xl
    border
    border-red-900/30
  "
>

  <p className="text-gray-500 text-xs">
    Status
  </p>

  <p
  className={`
    font-black
    text-lg

    ${
      borrow.status === "Borrowed"
        ? "text-yellow-400"
        : borrow.status === "Return Requested"
        ? "text-blue-400"
        : borrow.status === "Returned"
        ? "text-green-400"
        : "text-gray-400"
    }
  `}
>
  {borrow.status === "Borrowed"
    ? "🔴 Hutang"
    : borrow.status === "Return Requested"
    ? "🟡 Menunggu Verifikasi"
    : borrow.status === "Returned"
    ? "🟢 Lunas"
    : borrow.status}
</p>

</div>

</div>

              </div>

             {
  borrow.items?.map(
    (item) => (

      <div
        key={item.itemId}
        className="
          flex
          justify-between
          py-1
        "
      >

        <span>
          {item.itemName}
        </span>

        <span className="text-red-400">
          x{item.quantity}
        </span>

      </div>

    )
  )
}

<button
  disabled={
    borrow.status ===
    "Menunggu Pelunasan"
  }
  onClick={() =>
    openReturnModal(
      borrow
    )
  }
  className={`
    w-full
    mt-4
    py-3
    rounded-xl
    font-black
    tracking-wider
    transition-all

    ${
      borrow.status ===
      "Menunggu Pelunasan"
        ? `
          bg-gray-800
          text-gray-500
          cursor-not-allowed
        `
        : `
          bg-gradient-to-r
          from-red-700
          via-red-600
          to-red-800
          hover:from-red-600
          hover:to-red-700
          border
          border-red-500/40
        `
    }
  `}
>

  {
    borrow.status ===
    "Menunggu Pelunasan"
      ? "PELUNASAN DI PROSES"
      : "↩ AJUKAN PELUNASAN"
  }

</button>

            </div>

          )
        )
      )
}
  </div>

  <div
  className="
    bg-[#111111]
    border
    border-red-900/30
    rounded-3xl
    p-6
  "
>

  <h2 className="text-xl font-black mb-4">
    OUTSTANDING RETURNS
  </h2>

  <div
    className="
      mb-4
      p-4
      rounded-xl
      bg-red-950/20
      border
      border-red-900/30
    "
  >

    <p className="text-gray-400 text-sm">
      Active Borrow Records
    </p>

    <p className="text-3xl font-black text-red-400">
      {borrowedItems.length}
    </p>

  </div>

  {
    borrowedItems.length === 0
      ? (
          <p className="text-gray-500">
            No outstanding returns
          </p>
        )
      : (
          borrowedItems.map(
            (borrow) => (

              <div
                key={borrow.id}
                className="
                  mb-4
                  border
                  border-red-900/20
                  rounded-xl
                  p-3
                "
              >

                <p
                  className="
                    text-xs
                    uppercase
                    text-red-400
                    mb-2
                  "
                >
                  RETURN REQUIRED
                </p>

                {
                  borrow.items?.map(
                    (item) => (

                      <div
                        key={item.itemId}
                        className="
                          flex
                          justify-between
                          py-1
                        "
                      >

                        <span>
                          {item.itemName}
                        </span>

                        <span className="text-red-400">
                          x{item.quantity}
                        </span>

                      </div>

                    )
                  )
                }

              </div>

            )
          )
      )
  }

</div>

</div>

      </div>

{
  showReturnModal && (

    <div
      className="
        fixed
        inset-0
        bg-black/80
        backdrop-blur-sm
        flex
        items-center
        justify-center
        z-50
      "
    >

      <div
        className="
          w-full
          max-w-xl
          bg-[#111111]
          border
          border-red-900/40
          rounded-3xl
          p-6
        "
      >

        <h2
          className="
            text-2xl
            font-black
            mb-5
          "
        >
          PENGEMBALIAN BARANG
        </h2>

        <p className="text-gray-400 mb-5">
          Return borrowed warehouse items
        </p>

        <div className="space-y-2">

          {selectedBorrow?.items?.map(
            (item) => (

              <div
                key={item.itemId}
                className="
                  flex
                  justify-between
                  bg-black/30
                  rounded-xl
                  px-4
                  py-3
                "
              >

                <span>
                  {item.itemName}
                </span>

                <span className="text-red-400">
                  x{item.quantity}
                </span>

              </div>

            )
          )}

        </div>

        <textarea
          value={returnReason}
          onChange={(e) =>
            setReturnReason(
              e.target.value
            )
          }
          placeholder="
Describe item condition,
missing parts,
damaged parts,
or notes...
"
          className="
            w-full
            mt-5
            bg-black
            border
            border-red-900/30
            rounded-xl
            px-4
            py-3
            min-h-[120px]
          "
        />
        <div className="mt-4">

  <p className="text-gray-400 text-sm mb-2">
    Evidence Photo
  </p>

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setReturnPhoto(
        e.target.files[0]
      )
    }
    className="
      w-full
      bg-black
      border
      border-red-900/30
      rounded-xl
      p-3
    "
  />

</div>

        <div
          className="
            flex
            gap-3
            mt-5
          "
        >

          <button
            onClick={() => {

            setShowReturnModal(
              false
            );

            setReturnReason(
              ""
            );

            setReturnPhoto(
              null
            );

          }}
            className="
              flex-1
              py-3
              rounded-xl
              border
              border-red-900/30
            "
          >
            CANCEL
          </button>

          <button
            onClick={
              handleSubmitReturn
            }
            disabled={
              uploadingPhoto
            }
            className="
              flex-1
              py-3
              rounded-xl
              bg-red-600
              hover:bg-red-700
              font-bold
              disabled:opacity-50
            "
          >

            {
              uploadingPhoto
                ? "UPLOADING..."
                : "SUBMIT"
            }

          </button>

        </div>

      </div>

    </div>

  )
}

    </AppLayout>
  );
}