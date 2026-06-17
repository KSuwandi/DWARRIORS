import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function FamilyHierarchy() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {

  if (!loading && user) {
    loadMembers();
  }

}, [loading, user]);

  async function loadMembers() {

  try {

    console.log("===== LOAD MEMBERS =====");

    console.log("USER LOGIN =", user);

    const snapshot = await getDocs(
      collection(db, "users")
    );

    console.log(
      "TOTAL DOCS =",
      snapshot.docs.length
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      "SEMUA USER =",
      data
    );

    data.forEach((u)=>{

console.log(
  "RP NAME =",
  u.rpName
);

console.log(
  "ROLE =",
  u.role
);

console.log(
  "STATUS =",
  u.status
);

});

    const memberOnly =
      data.filter(
        (u) => u.role === "MEMBER"
      );

    console.log(
      "MEMBER SAJA =",
      memberOnly
    );

    setUsers(data);

  } catch (error) {

    console.error(
      "LOAD MEMBERS ERROR =",
      error
    );

  }

}

  const hierarchy = [
    {
      role: "BOSS",
      members: [
        {
          name: "Juan El Patron",
          title: "BOSS",
          photo: "https://i.ibb.co.com/QvY0Df6L/Juan-El-Patron-BOS-Photoroom.png",
          description:
            "The head of the DWARRIORS family. Commands absolute loyalty and controls every aspect of the organization's bloodline, power, and legacy.",
        },
      ],
    },
    {
      role: "UNDERBOSS",
      members: [
        {
          name: "Binjai",
          title: "UNDERBOSS",
          photo: "https://i.ibb.co.com/ZR5Tgy6q/BINJAI-UNDERBOSS-Photoroom.png",
          description:
            "The elite executives of the DWARRIORS family. They act as the BOSS's most trusted commanders, ensuring power, discipline, and loyalty throughout the organization.",
        },
        {
          name: "Kanbe",
          title: "UNDERBOSS",
          photo: "https://i.ibb.co.com/1GqNMRCm/KANBE-UNDERBOSS-Photoroom.png",
          description:
            "The elite executives of the DWARRIORS family. They act as the BOSS's most trusted commanders, ensuring power, discipline, and loyalty throughout the organization.",
        },
        {
          name: "Baron",
          title: "UNDERBOSS",
          photo: "https://i.ibb.co.com/V0CJVs8W/BARON.png",
          description:
           "The elite executives of the DWARRIORS family. They act as the BOSS's most trusted commanders, ensuring power, discipline, and loyalty throughout the organization.",
        },
        {
          name: "Santuy",
          title: "UNDERBOSS",
          photo: "https://i.ibb.co.com/QjM079Jm/SANTUY-UNDERBOSS-Photoroom.png",
          description:
           "The elite executives of the DWARRIORS family. They act as the BOSS's most trusted commanders, ensuring power, discipline, and loyalty throughout the organization.",
        },
      ],
    },
    {
      role: "CONSIGLIERE",
      members: [
        {
          name: "Van",
          title: "CONSIGLIERE",
          photo: "https://i.ibb.co.com/7tBYk3XF/VAN-CONSIGLERE-Photoroom.png",
          description:
            "A circle of senior advisors entrusted with protecting the interests of the DWARRIORS family. Their wisdom and counsel shape the future of the organization.",
        },
        {
          name: "James",
          title: "CONSIGLIERE",
          photo: "https://i.ibb.co.com/bjkQjy7N/James-CONSIGLERE-Photoroom.png",
          description:
            "A circle of senior advisors entrusted with protecting the interests of the DWARRIORS family. Their wisdom and counsel shape the future of the organization.",
        },
        {
          name: "Wildar",
          title: "CONSIGLIERE",
          photo: "https://i.ibb.co.com/B8PSfYY/WILDAR-CONSIGLERE-Photoroom.png",
          description:
            "A circle of senior advisors entrusted with protecting the interests of the DWARRIORS family. Their wisdom and counsel shape the future of the organization.",
        },
        {
          name: "Cantika",
          title: "CONSIGLIERE",
          photo: "https://i.ibb.co.com/dCV2hMZ/CANTIKA-CONSIGLERE-Photoroom.png",
          description:
            "A circle of senior advisors entrusted with protecting the interests of the DWARRIORS family. Their wisdom and counsel shape the future of the organization.",
        },

        
      ],
    },
    {
      role: "CAPO",
      members: [
        {
          name: "Alex",
          title: "CAPO",
          photo: "https://i.ibb.co.com/BVyMQ3Rh/ALEX-CAPO-Photoroom.png",
          description:
            "The field commanders of the DWARRIORS ORGANIZATION. Each CAPO oversees their own crew and safeguards the family's influence, reputation, and strength.",
        },
         {
          name: "Alysha",
          title: "CAPO",
          photo: "https://i.ibb.co.com/Kx5sPJZP/ALYSHA-CAPO-Photoroom.png",
          description:
            "The field commanders of the DWARRIORS ORGANIZATION. Each CAPO oversees their own crew and safeguards the family's influence, reputation, and strength.",
        },
         {
          name: "Nico",
          title: "CAPO",
          photo: "https://i.ibb.co.com/BVyMQ3Rh/NICO-CAPO-Photoroom.png",
          description:
            "The field commanders of the DWARRIORS ORGANIZATION. Each CAPO oversees their own crew and safeguards the family's influence, reputation, and strength.",
        },
         {
          name: "Malfoy",
          title: "CAPO",
          photo: "https://i.ibb.co.com/BVyMQ3Rh/MALFOY-CAPO-Photoroom.png",
          description:
            "The field commanders of the DWARRIORS ORGANIZATION. Each CAPO oversees their own crew and safeguards the family's influence, reputation, and strength.",
        },
      ],
    },
  ];

  const activeMember =
    selectedMember || hierarchy[0].members[0];

  const memberList =
users.filter(

(u)=>

u.role?.toUpperCase() ===
"MEMBER"

);

console.log(
  "MEMBER LIST YANG DITAMPILKAN =",
  memberList
);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#120000] via-black to-[#050505]" />

      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute w-full max-w-[500px] min-h-[500px] bg-red-700 blur-[180px] rounded-full top-[-150px] left-[-100px]" />
        <div className="absolute w-full max-w-[400px] min-h-[400px] bg-red-700 blur-[160px] rounded-full bottom-[-120px] right-[-80px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">

        {/* SIDEBAR */}
        <div
  className="
    jgb-scrollbar
    w-full max-w-[320px]
    border-r
    border-red-500/20
    bg-black/50
    backdrop-blur-xl
    p-6
    overflow-y-auto
    shadow-[0_0_50px_rgba(220,38,38,0.25)]
  "
>

          <img
            src="https://i.ibb.co.com/nMrw6G4N/logodw.png"
            alt="DWARRIORS"
            className="w-32 mx-auto mb-6"
          />

          <h1
  className="
    text-center
    text-2xl
    font-black
    tracking-widest
    mb-10
    bg-gradient-to-r
    from-white
    via-red-300
    to-red-500
    bg-clip-text
    text-transparent
    drop-shadow-[0_0_20px_rgba(220,38,38,0.7)]
  "
>
  DWARRIORS ORGANIZATION
</h1>

          {hierarchy.map((group) => (
            <div
              key={group.role}
              className="mb-8"
            >
              <h2 className="text-red-400 font-black tracking-[0.3em] uppercase mb-4">
                {group.role}
              </h2>

              <div className="space-y-2">

                {group.members.map((member) => (
                  <button
                    key={member.name}
                    onClick={() =>
                      setSelectedMember(member)
                    }
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                      activeMember.name === member.name
                        ? "bg-red-700/30 border border-red-500"
                        : "bg-white/5 border border-red-700/20"
                    }`}
                  >
                    <p className="font-bold">
                      {member.name}
                    </p>

                    <p className="text-xs text-red-300">
                      {member.title}
                    </p>
                  </button>
                ))}

              </div>
            </div>
          ))}

          {/* MEMBER */}
          <div>

            <h2 className="text-red-400 font-black tracking-[0.3em] uppercase mb-4">
              MEMBER
            </h2>

            <div className="space-y-2">

              {memberList.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 bg-white/5 border border-red-700/20 rounded-xl p-2"
                >
                  <img
                    src={member.photo}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-red-500"
                  />

                  <div>
                    <p className="font-semibold text-sm">
                      {member.rpName}
                    </p>

                    <p className="text-xs text-red-300">
                      MEMBER
                    </p>
                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>

        {/* CONTENT */}
        <div className="flex-1 relative overflow-y-auto">

          {/* WATERMARK */}
          <div className="absolute inset-0 pointer-events-none">

            <h1
              className="
                absolute
                top-10
                left-10
                text-[220px]
                font-black
                uppercase
                text-white/[0.03]
                tracking-[0.15em]
              "
            >
              {activeMember.name}
            </h1>

            <img
              src="https://i.ibb.co.com/tTKwhGt1/Asset-18.png"
              alt=""
              className="
                absolute
                right-[-250px]
                top-1/2
                -translate-y-1/2
                w-full max-w-[1100px]
                opacity-[0.03]
              "
            />

          </div>

          <div className="relative z-10 min-h-screen">

            <div className="min-h-screen max-w-[1800px] mx-auto px-10 py-10">

              <div className="grid lg:grid-cols-[850px_1fr] min-h-screen items-center gap-12">

                {/* FOTO */}
                <div className="relative flex justify-center items-center">

                  <div className="absolute w-full max-w-[800px] min-h-[800px] bg-red-700/30 blur-[220px] rounded-full" />

                  <img
                    src={activeMember.photo}
                    alt=""
                    className="
                      relative
                      min-h-[900px]
                      xl:min-h-[1000px]
                      object-contain
                      drop-shadow-[0_0_90px_rgba(220,38,38,0.8)]
                    "
                  />

                </div>

                {/* INFO */}
                <div>

                  <p className="tracking-[0.4em] text-red-400 uppercase">
                    DWARRIORS ORGANIZATION
                  </p>

                  <h1 className="text-[6rem] xl:text-[7rem] font-black leading-none mt-4">
                    {activeMember.name}
                  </h1>

                  <div className="mt-6 inline-flex items-center gap-3 bg-red-900/30 border border-red-500/40 px-6 py-3 rounded-full">

                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />

                    <span className="uppercase tracking-[0.3em] text-red-300">
                      {activeMember.title}
                    </span>

                  </div>

                  <div className="w-48 min-h-[4px] rounded-full bg-gradient-to-r from-red-500 via-red-500 to-red-500 mt-8" />

                  <p className="text-gray-300 text-xl leading-relaxed mt-10 max-w-3xl">
                    {activeMember.description}
                  </p>

                  <div className="grid grid-cols-2 gap-6 mt-12">

                    <div className="bg-black/40 border border-red-700/30 rounded-3xl p-6 backdrop-blur-xl">

                      <h3 className="text-red-400 text-sm font-bold tracking-[0.2em]">
                        POSITION
                      </h3>

                      <p className="mt-3 text-2xl font-bold">
                        {activeMember.title}
                      </p>

                    </div>

                    <div className="bg-white/5 border border-red-700/20 rounded-3xl p-6 backdrop-blur-xl">

                      <h3 className="text-red-400 text-sm font-bold tracking-[0.2em]">
                        ORGANIZATION
                      </h3>

                      <p className="mt-3 text-2xl font-bold">
                        DWARRIORS
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}