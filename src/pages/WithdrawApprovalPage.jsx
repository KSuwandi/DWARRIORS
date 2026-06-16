import AppLayout from "../layouts/AppLayout";

import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "../contexts/AuthContext";


import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "../services/firebase/config";

export default function WithdrawApprovalPage() {
  const {
  user,
  role,
} = useAuth();

  const [requests, setRequests] =
    useState([]);

  useEffect(() => {

    const loadRequests =
      async () => {

        try {

          const snapshot =
            await getDocs(
              collection(
                db,
                "withdraw_requests"
              )
            );

          const data =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setRequests(data);

        } catch (error) {

          console.error(
            "Load withdraw requests error:",
            error
          );

        }

      };

    loadRequests();

  }, []);

  const handleApprove =
async (request) => {

    try {

if (
  request.status !==
  "Pending"
) {

  alert(
    "Request already processed"
  );

  return;

}

for (const item of request.items) {

  const inventoryRef =
    doc(
      db,
      "inventory",
      item.itemId
    );

  const inventorySnap =
    await getDoc(
      inventoryRef
    );

  if (
    !inventorySnap.exists()
  ) {

    throw new Error(
      `${item.itemName} not found`
    );

  }

  const currentStock =
    Number(
      inventorySnap.data()
        .stock || 0
    );

  const newStock =
    currentStock -
    Number(
      item.quantity
    );

  if (newStock < 0) {

    throw new Error(
      `Insufficient stock: ${item.itemName}`
    );

  }

  await updateDoc(
    inventoryRef,
    {
      stock:
        newStock,
    }
  );

}

const now =
  new Date();

const debtCode =
  `WD-${
    String(
      now.getDate()
    ).padStart(2, "0")
  }${
    String(
      now.getMonth() + 1
    ).padStart(2, "0")
  }${
    String(
      now.getFullYear()
    ).slice(-2)
  }-${
    Date.now()
      .toString()
      .slice(-3)
  }`;

await addDoc(
  collection(
    db,
    "borrowed_items"
  ),
  {

    debtCode:
      debtCode,

    userId:
      request.userId,

    rpName:
      request.rpName,

    withdrawRequestId:
      request.id,

    items:
      request.items,

    status:
      "Borrowed",

    returned:
      false,

    returnedAt:
      null,

    approvedBy:
      user?.rpName ||
      "Unknown",

    approvedByRole:
      role,

    approvedAt:
  serverTimestamp(),

createdAt:
  serverTimestamp(),
  }
);

      await updateDoc(
        doc(
          db,
          "withdraw_requests",
          request.id
        ),
        {
          status:
            "Approved",
        }
      );

      setRequests(
  (prev) =>
    prev.map(
      (requestData) =>
        requestData.id === request.id
          ? {
              ...requestData,
              status: "Approved",
            }
          : requestData
    )
);

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Failed to approve request"
      );

    }

  };

  const handleReject =
  async (requestId) => {

    try {

      await updateDoc(
        doc(
          db,
          "withdraw_requests",
          requestId
        ),
        {
          status:
            "Rejected",
        }
      );

      setRequests(
  (prev) =>
    prev.map(
      (requestData) =>
        requestData.id === requestId
          ? {
              ...requestData,
              status: "Rejected",
            }
          : requestData
    )
);

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Failed to reject request"
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
            APPROVAL
          </span>

        </h1>

        <p className="text-gray-400 mt-3">

          Approve or reject warehouse
          withdrawal requests.

        </p>

        {/* STATS */}

        <div className="mt-4">

          <span className="text-red-400 text-sm uppercase tracking-[0.2em]">

            Total Requests:
            {" "}
            {requests.length}

          </span>

        </div>

        {/* REQUEST LIST */}

        <div className="mt-8 space-y-5">

          {requests.length === 0 ? (

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

              <p className="text-gray-500">

                No withdraw requests found

              </p>

            </div>

          ) : (

            requests.map(
              (request) => (

                <div
                  key={request.id}
                  className="
                    bg-[#111111]
                    border
                    border-red-900/30
                    rounded-3xl
                    p-6
                  "
                >

                  {/* TOP */}

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
                        {request.rpName}
                      </h2>

                      <p
                        className="
                          text-gray-500
                          text-sm
                          mt-1
                        "
                      >

                        Items:
                        {" "}
                        {request.items?.length || 0}

                      </p>

                    </div>

                    <span
  className={`
    px-4
    py-2
    rounded-full
    text-xs
    font-bold

    ${
      request.status ===
      "Approved"
        ? "bg-green-500/20 text-green-400"
        : request.status ===
          "Rejected"
        ? "bg-red-500/20 text-red-400"
        : "bg-yellow-500/20 text-yellow-400"
    }
  `}
>

  {request.status}

</span>

                  </div>

{
  request.status ===
    "Pending" && (

    <div
      className="
        flex
        gap-3
        mt-5
      "
    >

      <button
        onClick={() =>
  handleApprove(
    request
  )
}
        className="
          px-5
          py-2
          rounded-xl
          bg-green-600
          hover:bg-green-700
          font-bold
        "
      >
        APPROVE
      </button>

      <button
        onClick={() =>
          handleReject(
            request.id
          )
        }
        className="
          px-5
          py-2
          rounded-xl
          bg-red-600
          hover:bg-red-700
          font-bold
        "
      >
        REJECT
      </button>

    </div>

  )
}
                  {/* ITEM LIST */}

                  <div
                    className="
                      mt-5
                      space-y-2
                    "
                  >

                    {request.items?.map(
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
            )

          )}

        </div>

      </div>

    </AppLayout>

  );

}