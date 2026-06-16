import AppLayout from "../layouts/AppLayout";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  db,
} from "../services/firebase/config";

export default function ReturnPage() {

  const {
    user,
  } = useAuth();

  const [
    borrowedItems,
    setBorrowedItems,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    const loadBorrowedItems =
      async () => {

        try {

          if (!user?.uid) {

            setLoading(false);
            return;

          }

          const q =
            query(
              collection(
                db,
                "borrowed_items"
              ),
              where(
                "userId",
                "==",
                user.uid
              ),
              where(
                "status",
                "==",
                "Borrowed"
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
            "Load borrowed items error:",
            error
          );

        } finally {

          setLoading(false);

        }

      };

    loadBorrowedItems();

  }, [user]);

  return (

    <AppLayout>

      <div className="text-white">

        {/* HEADER */}

        <h1 className="text-5xl font-black">

          <span className="text-white">
            RETURN
          </span>

          <span className="text-red-500 ml-2">
            CENTER
          </span>

        </h1>

        <p className="text-gray-400 mt-3 text-lg">

          Return borrowed items to the
          DWARRIORS warehouse.

        </p>

        <p className="text-red-400 text-sm mt-3 uppercase tracking-[0.25em]">

          DWARRIORS PROPERTY RETURN

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
            RETURN CONTROL
          </p>

          <h2 className="text-3xl font-black mt-2">
            Return • Report • Close
          </h2>

          <p className="text-gray-400 mt-3">
            All borrowed items must be
            returned or reported after use.
          </p>

        </div>

        {/* STATS */}

        <div className="mb-6">

          <span className="text-red-400 text-sm uppercase tracking-[0.2em]">

            Active Borrowed Records:
            {" "}
            {borrowedItems.length}

          </span>

        </div>

        {/* LOADING */}

        {loading && (

          <div
            className="
              bg-[#111111]
              border
              border-red-900/30
              rounded-3xl
              p-8
              text-center
            "
          >

            Loading borrowed items...

          </div>

        )}

        {/* EMPTY */}

        {!loading &&
          borrowedItems.length === 0 && (

          <div
            className="
              bg-[#111111]
              border
              border-red-900/30
              rounded-3xl
              p-8
              text-center
            "
          >

            <h2 className="text-xl font-bold">
              No Active Borrowed Items
            </h2>

            <p className="text-gray-500 mt-2">
              You currently have no items
              to return.
            </p>

          </div>

        )}

        {/* BORROWED LIST */}

        <div className="space-y-6">

          {borrowedItems.map(
            (borrow) => (

              <div
                key={borrow.id}
                className="
                  bg-[#111111]
                  border
                  border-red-900/30
                  rounded-3xl
                  p-6
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
                  "
                >

                  <div>

                    <h2
                      className="
                        text-2xl
                        font-black
                      "
                    >
                      {borrow.rpName}
                    </h2>

                    <p
                      className="
                        text-gray-500
                        text-sm
                        mt-1
                      "
                    >

                      Borrow ID:
                      {" "}
                      {borrow.id}

                    </p>

                    <p
                      className="
                        text-gray-500
                        text-sm
                      "
                    >

                      Items:
                      {" "}
                      {borrow.items?.length || 0}

                    </p>

                  </div>

                  <span
                    className="
                      px-4
                      py-2
                      rounded-full
                      text-xs
                      font-bold
                      bg-yellow-500/20
                      text-yellow-400
                    "
                  >

                    BORROWED

                  </span>

                </div>

                {/* ITEM LIST */}

                <div
                  className="
                    mt-5
                    space-y-2
                  "
                >

                  {borrow.items?.map(
                    (item) => (

                      <div
                        key={item.itemId}
                        className="
                          flex
                          justify-between
                          items-center
                          bg-black/30
                          rounded-xl
                          px-4
                          py-3
                        "
                      >

                        <span>
                          {item.itemName}
                        </span>

                        <span
                          className="
                            text-red-400
                            font-bold
                          "
                        >
                          x
                          {item.quantity}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </AppLayout>

  );

}