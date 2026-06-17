import {
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import {
  useNavigate,
} from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import EmptyState from "../components/common/EmptyState";
import FamilyHierarchy from "../components/FamilyHierarchy";

const ITEMS_PER_PAGE = 4;

export default function WardrobePage() {

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
  selectedOutfit,
  setSelectedOutfit,
] = useState(null);

const [
  selectedImage,
  setSelectedImage,
] = useState(null);

const [
  showcaseIndex,
  setShowcaseIndex,
] = useState(0);

const [activeTab, setActiveTab] =
  useState("wardrobe");

const navigate =
  useNavigate();

  const [musicOn, setMusicOn] =
  useState(true);

const [volume, setVolume] =
  useState(30); // 0 - 100

const audioRef =
  useRef(null);

  // =====================================
  // OUTFITS DATA
  // GANTI URL FOTO SESUAI BAJU KAMU
  // =====================================

 const outfits = [
  {
    id: 1,
    title: "DWARRIORS Male Black-A Shirt",
    access: "All Male Member",
    category: "Casual",
    image: "https://i.ibb.co.com/GvKcZxL2/kemeja-dw-1-depan-Photoroom.png",

    images: [
    "https://i.ibb.co.com/GvKcZxL2/kemeja-dw-1-depan-Photoroom.png",
    "https://i.ibb.co.com/xqCCXMzr/kemeja-dw-1-belakang-Photoroom.png",
  ],

     code: "DW-MBS-001",

  acquisition:
    "Family Member",

  rarity:
    "Common",

  version:
    "Season 1",

  description:
    "Standard male black shirt used by active family members."
  },

  {
    id: 2,
    title: "DWARRIORS Male Red Shirt",
    access: "All Male Member",
    category: "Casual",
    image: "https://i.ibb.co.com/CKDSWcvn/kemeja-dw-merah-Photoroom.png",
    images: [
    "https://i.ibb.co.com/CKDSWcvn/kemeja-dw-merah-Photoroom.png",
    "https://i.ibb.co.com/JR5JGMLV/kemeja-dw-merah-belakang-Photoroom.png",
  ],
  code: "DW-MRS-001",

 acquisition:
    "Family Member",

  rarity:
    "Common",

  version:
    "Season 1",


description:
  "Standard male red shirt used by active family members.",
  },

  {
    id: 3,
    title: "DWARRIORS Male Black-B Shirt ",
    access: "All Male Members",
    category: "Casual",
    image: "https://i.ibb.co.com/mFvjggZ4/kemeja-dw-2-depan-Photoroom.png",
images: [
    "https://i.ibb.co.com/mFvjggZ4/kemeja-dw-2-depan-Photoroom.png",
    "https://i.ibb.co.com/twBBSYzN/kemeja-dw-2-belakang-Photoroom.png",
  ],
    code: "DW-MBS-002",

acquisition:
  "Family Supply",

rarity:
  "Common",

version:
  "Season 2",

description:
  "Standard male black shirt used by active family members.",
  },

   {
    id: 4,
    title: "DWARRIORS Female Red Shirt ",
    access: "All Female Members",
    category: "Casual",
    image: "https://i.ibb.co.com/Gfz11rXL/KEMEJA-CEWE-DW-Photoroom.png",
images: [
    "https://i.ibb.co.com/Gfz11rXL/KEMEJA-CEWE-DW-Photoroom.png",
    "https://i.ibb.co.com/1fZJy2TK/KEMEJA-CEWE-DW-BELAKANG-Photoroom.png",
  ],
    code: "DW-FRS-001",

acquisition:
  "Family Supply",

rarity:
  "Common",

version:
  "Season 1",

description:
  "Standard female red shirt used by active family members.",
  },

  {
    id: 5,
    title: "DWARRIORS Female Black-A Shirt ",
    access: "All Female Members",
    category: "Casual",
    image: "https://i.ibb.co.com/bjKWPD2K/KEMEJA-CEWE-2-Photoroom.png",
images: [
    "https://i.ibb.co.com/bjKWPD2K/KEMEJA-CEWE-2-Photoroom.png",
    "https://i.ibb.co.com/CKcmbQ1H/KEMEJA-CEWE-2-BELAKANG-Photoroom.png",
  ],
    code: "DW-FBS-001",

acquisition:
  "Family Supply",

rarity:
  "Common",

version:
  "Season 1",

description:
  "Standard female red shirt used by active family members.",
  },

  {
    id: 6,
    title: "DWARRIORS Female Black-B Shirt ",
    access: "All Female Members",
    category: "Casual",
    image: "https://i.ibb.co.com/1tTqGtzX/KEMEJA-CEWE-1-DW-Photoroom.png",
images: [
    "https://i.ibb.co.com/1tTqGtzX/KEMEJA-CEWE-1-DW-Photoroom.png",
    "https://i.ibb.co.com/DD9HX4g2/KEMEJA-CEWE-1-BELAKANG-DW-Photoroom.png",
  ],
    code: "DW-FBS-001",

acquisition:
  "Family Supply",

rarity:
  "Common",

version:
  "Season 2",

description:
  "Standard female red shirt used by active family members.",
  },

  {
    id: 7,
    title: "DWARRIORS Red Vest",
    access: "All Members",
    category: "Combat",
    image: "https://i.ibb.co.com/RTXWWPz7/vest-dw-merah-Photoroom.png",
    images: [
      "https://i.ibb.co.com/RTXWWPz7/vest-dw-merah-Photoroom.png",
      "https://i.ibb.co.com/B5G6Rp0z/vest-dw-merah-belakang-Photoroom.png",
    ],
    code: "DW-VR-001",
    acquisition: "Combat Division",
    rarity: "Rare",
    version: "Season 1",
    description: "Heavy combat armor issued during high-risk operations and warfare.",
  },

  {
    id: 8,
    title: "DWARRIORS Black Vest",
    access: "All Members",
    category: "Combat",
    image: "https://i.ibb.co.com/c9Fydgj/vest-dw-hitam-Photoroom.png",
    images: [
      "https://i.ibb.co.com/c9Fydgj/vest-dw-hitam-Photoroom.png",
      "https://i.ibb.co.com/M57R00cs/vest-dw-hitam-belakang-Photoroom.png",
    ],
    code: "DW-BV-001",
    acquisition: "Combat Division",
    rarity: "Rare",
    version: "Season 1",
    description: "Heavy combat armor issued during high-risk operations and warfare.",
  },

];

  const categories = [
  "All",
  "Casual",
  "Combat",
];


const showcaseOutfits = [
  outfits[0],
  outfits[1],
  outfits[8],
];


useEffect(() => {

  const interval =
    setInterval(() => {

      setShowcaseIndex(
        (prev) =>
          prev ===
          showcaseOutfits.length - 1
            ? 0
            : prev + 1
      );

    }, 5000);

  return () =>
    clearInterval(interval);

}, []);

const currentShowcase =
  showcaseOutfits[showcaseIndex] ||
  outfits[0];

useEffect(() => {

  const audio =
    audioRef.current;

  if (!audio) return;

  if (musicOn) {

  audio.volume = volume / 100;

  audio.play().catch(() => {
    console.log(
      "Autoplay blocked by browser"
    );
  });

} else {

    audio.pause();

  }

}, [musicOn]);

useEffect(() => {

  if (!audioRef.current) return;

  audioRef.current.volume =
    volume / 100;

}, [volume]);

useEffect(() => {

  const startMusic = () => {

    if (
      audioRef.current &&
      musicOn
    ) {

      audioRef.current
        .play()
        .catch(() => {});

    }

    window.removeEventListener(
      "click",
      startMusic
    );

  };

  window.addEventListener(
    "click",
    startMusic
  );

  return () =>
    window.removeEventListener(
      "click",
      startMusic
    );

}, [musicOn]);

  // =====================================
  // FILTER
  // =====================================


  
  const filteredOutfits =
    useMemo(() => {

      let data =
        [...outfits];

      if (
        filter !== "All"
      ) {

        data =
          data.filter(
            (
              item
            ) =>
              item.category ===
              filter
          );
      }

      if (
        search.trim()
      ) {

        data =
          data.filter(
            (
              item
            ) =>
               item.title
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    item.access
      .toLowerCase()
      .includes(search.toLowerCase())
          );
      }

      return data;

    }, [
      search,
      filter,
    ]);

  const totalPages =
    Math.ceil(
      filteredOutfits.length /
        ITEMS_PER_PAGE
    );

  const paginatedItems =
    useMemo(() => {

      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      return filteredOutfits.slice(
        start,
        start +
          ITEMS_PER_PAGE
      );

    }, [
      filteredOutfits,
      currentPage,
    ]);

  return (

    <AppLayout>

    <audio
  ref={audioRef}
  loop
  autoPlay
>
  <source
    src="https://res.cloudinary.com/dbn9lgdi4/video/upload/v1781335095/D.WARRIORS_ANTHEM_-_Prod.By_MANGBORIS_Official_Audio_GTA_jsl6fg.mp3"
    type="audio/mpeg"
  />
</audio>

      <div className="relative min-h-screen overflow-hidden text-white">

        {/* BACKGROUND */}

        <div className="absolute inset-0 bg-gradient-to-br from-[#070707]
via-[#130909]
to-[#000000]" />

        <div className="absolute top-0 left-0 w-full max-w-[600px] min-h-[600px] bg-red-900/20 blur-[200px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-full max-w-[500px] min-h-[500px] bg-yellow-600/10 blur-[180px] rounded-full" />

        <div className="relative z-10 p-6">

          {/* HERO */}

          <div
className="
relative
overflow-hidden
bg-gradient-to-br
from-[#050505]
via-[#120000]
to-[#000000]
backdrop-blur-xl
border
border-red-700/30
rounded-3xl
px-8
py-8
mb-8
shadow-[0_0_60px_rgba(220,38,38,0.25)]
"
>

  {/* Background Accent */}

  <div className="absolute inset-0 opacity-20">

    <div
  className="
  absolute
  top-0
  right-0
  w-full max-w-[400px]
  min-h-[400px]
  bg-red-700/25
  blur-[150px]
  rounded-full
  "
/>

  </div>

  <div
    className="
    relative
    flex
    flex-col
    lg:flex-row
    items-center
    gap-8
    "
  >

    {/* LOGO */}

    <div
      className="
      shrink-0
      w-32
      h-32
      rounded-full
      border
      border-red-600/40
      bg-black/50
      flex
      items-center
      justify-center
      shadow-[0_0_40px_rgba(220,38,38,0.45)]
      "
    >

      <img
        src="https://i.ibb.co.com/nMrw6G4N/logodw.png"
        alt="DWARRIORS"
        className="w-24 h-24 object-contain"
      />

    </div>

    {/* CONTENT */}

    <div className="flex-1">

      <p
        className="
        font-[Cinzel]
        text-red-400
        uppercase
        tracking-[0.8em]
        text-xs
        mb-2
        "
      >
        DWARRIORS ORGANIZATION
      </p>

      <h1
        className="
        text-4xl
        lg:text-5xl
        font-[Cinzel]
        text-white
        tracking-wider
        "
      >
        DWARRIORS
      </h1>

      <p
        className="
        text-yellow-500
        tracking-[0.4em]
        font-[Cinzel]
        uppercase
        text-sm
        mt-2
        "
      >
        BLOOD • POWER • LEGACY
      </p>

      <div
        className="
        w-24
        min-h-[2px]
        bg-gradient-to-r
        from-red-500
to-red-700
        mt-4
        mb-4
        "
      />

      <p
        className="
        text-gray-400
        font-[Cinzel]
        max-w-3xl
        leading-relaxed
        "
      >
       Official clothing archive and uniform regulations
for every member of the DWARRIORS Organization.
      </p>

    </div>

    {/* SIDE INFO */}

    {/* RIGHT SIDE */}

<div
  className="
  hidden
  xl:flex
  items-center
  gap-8
  "
>

  {/* BIG LOGO */}

  <img
    src="https://i.ibb.co.com/gLwhkLsg/logodw-1.png"
    alt="DWARRIORS Symbol"
    className="
      w-56
      h-56
      object-contain
      opacity-90
      drop-shadow-[0_0_40px_rgba(220,38,38,0.55)]
    "
  />

  {/* INFO BADGES */}

  <div
    className="
    flex
    flex-col
    gap-3
    "
  >

    <span
      className="
      px-4
      py-2
      rounded-xl
      bg-red-900/20
      border
      border-red-700/30
      text-red-300
      text-sm
      "
    >
      GTA V Roleplay
    </span>

    <span
      className="
      px-4
      py-2
      rounded-xl
      bg-yellow-900/10
      border
      border-yellow-700/30
      text-yellow-300
      text-sm
      "
    >
      Family Archive
    </span>

    <button
  onClick={() =>
    setMusicOn(!musicOn)
  }
  className="
    px-4
    py-2
    rounded-xl
    bg-red-900/20
    border
    border-red-500/30
    text-red-300
    text-sm
    hover:bg-red-700/20
    transition-all
  "
>
  {musicOn
    ? "🔊 Music ON"
    : "🔇 Music OFF"}
</button>
<div
  className="
    bg-black/30
    border
    border-red-500/20
    rounded-xl
    px-3
    py-3
  "
>

  <div
    className="
      flex
      justify-between
      items-center
      mb-2
    "
  >

    <span
      className="
        text-xs
        text-red-300
      "
    >
      Volume
    </span>

    <span
      className="
        text-xs
        text-red-200
        font-bold
      "
    >
      {volume}%
    </span>

  </div>

  <input
    type="range"
    min="0"
    max="100"
    value={volume}
    onChange={(e) =>
      setVolume(
        Number(
          e.target.value
        )
      )
    }
    className="
      w-full
      cursor-pointer
    "
  />

</div>

  </div>

</div>

  </div>

</div>

{/* NAVIGATION TABS */}

<div
  className="
    flex
    items-center
    gap-4
    mb-10
    bg-white/5
    border
    border-red-600/30
    rounded-3xl
    p-3
    backdrop-blur-xl
  "
>

  <button
    onClick={() =>
      setActiveTab("wardrobe")
    }
    className={`
      flex-1
      py-4
      rounded-2xl
      font-bold
      transition-all
      ${
        activeTab === "wardrobe"
          ? "bg-gradient-to-r from-red-900 to-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.35)]"
          : "text-gray-400 hover:text-white"
      }
    `}
  >
    WARDROBE ARCHIVE
  </button>

  <button
    onClick={() =>
      setActiveTab("hierarchy")
    }
    className={`
      flex-1
      py-4
      rounded-2xl
      font-bold
      transition-all
      ${
        activeTab === "hierarchy"
          ? "bg-gradient-to-r from-red-900 to-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.35)]"
          : "text-gray-400 hover:text-white"
      }
    `}
  >
    ORGANIZATION HIERARCHY
  </button>

</div>

{activeTab === "wardrobe" && (
  <>

    {/* CURRENT SHOWCASE */}

<div
className="
relative
overflow-hidden
rounded-[40px]

border
border-red-600/30

bg-gradient-to-br
from-[#220909]
via-[#301010]
to-[#180808]

backdrop-blur-2xl

shadow-[0_0_50px_rgba(220,38,38,0.18)]

mb-10
"
>

  <div className="grid lg:grid-cols-[500px_1fr]">

    {/* IMAGE */}

   <div
className="
relative
bg-gradient-to-b
from-[#351010]
via-[#250909]
to-[#180808]
"
>

<img
src={currentShowcase?.image}
alt={currentShowcase?.title}
className="
w-full
h-[520px]
object-contain
p-8
"
/>

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-transparent
          via-transparent
          to-black
        "
      />

    </div>

    {/* CONTENT */}

    <div
      className="
p-8
flex
flex-col
justify-center
"
    >

      <p
        className="
          text-red-400
          uppercase
          tracking-[0.4em]
          text-sm
          mb-4
        "
      >
        DWARRIORS SIGNATURE COLLECTION
      </p>

      <h2
        className="
          text-4xl
          font-black
          leading-tight
          mb-6
        "
      >
        {currentShowcase.title}
      </h2>

      <p
        className="
          text-gray-300
          text-lg
          leading-relaxed
        "
      >
        {currentShowcase.description}
      </p>

      <div
        className="
          grid
          grid-cols-2
          gap-4
          mt-8
        "
      >

        <div
className="
bg-gradient-to-br
from-red-950/40
to-red-900/20

border
border-red-600/20

rounded-2xl
p-4
"
>
          <p className="text-red-400 text-xs">
            CATEGORY
          </p>

          <h3 className="font-bold mt-2">
            {currentShowcase.category}
          </h3>
        </div>

       <div
className="
bg-gradient-to-br
from-red-950/40
to-red-900/20

border
border-red-600/20

rounded-2xl
p-4
"
>
          <p className="text-red-400 text-xs">
            RARITY
          </p>

          <h3 className="font-bold mt-2 text-yellow-300">
            {currentShowcase.rarity}
          </h3>
        </div>

      </div>

      <button
        onClick={() =>
          setSelectedOutfit(
            currentShowcase
          )
        }
        className="
          mt-8
          w-fit
          px-8
          py-4
          rounded-2xl
          bg-gradient-to-r
          from-red-900
          to-red-600
          font-bold
          hover:scale-105
          transition-all
        "
      >
        View Details
      </button>

    </div>

  </div>

</div>


          {/* STATS */}

 </>
)}
    {activeTab === "hierarchy" && (
  <FamilyHierarchy />
)}

{activeTab === "wardrobe" && (
<>
          {/* SEARCH */}

          <div className="mb-6">

            <input
              type="text"
              placeholder="Search wardrobe..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full md:w-[400px] bg-black/50 border border-red-700/30 rounded-2xl px-5 py-4 outline-none focus:border-red-500"
            />

          </div>

          {/* FILTER */}

          <div className="flex flex-wrap gap-3 mb-10">

            {categories.map(
              (
                category
              ) => (

                <button
                  key={
                    category
                  }
                  onClick={() =>
                    setFilter(
                      category
                    )
                  }
                  className={`px-5 py-3 rounded-2xl transition-all font-semibold ${
                    filter ===
                    category
                      ? "bg-gradient-to-r from-red-900 to-red-600"
                      : "bg-black/50 border border-red-700/30"
                  }`}
                >
                  {category}
                </button>

              )
            )}

          </div>

                    {/* OUTFIT GRID */}

          <div className="
grid
grid-cols-1
md:grid-cols-2
gap-6
items-stretch
">

            {paginatedItems.map(
              (item) => (

                <div
  key={item.id}
  onClick={() => {
  setSelectedOutfit(item);

  setSelectedImage(
    item.images?.[0] ||
    item.image
  );
}}
  className="
group
relative
cursor-pointer
overflow-hidden

bg-gradient-to-br
from-[#220909]
via-[#301010]
to-[#180808]

backdrop-blur-2xl

border
border-red-600/30

hover:border-red-400

rounded-[32px]

transition-all
duration-500

hover:-translate-y-2

hover:shadow-[0_0_50px_rgba(220,38,38,0.45)]
min-h-[520px]
h-full
flex
flex-col
"
>
                 <div
className="
absolute
inset-0
opacity-0
group-hover:opacity-100
transition-all
duration-500

bg-gradient-to-br
from-red-700/20
via-transparent
to-red-900/20
"
/>
<div
className="
absolute
top-1/2
left-1/2
-translate-x-1/2
-translate-y-1/2

w-72
h-72

bg-red-700/20
blur-[100px]

opacity-40
"
/>
                  {/* IMAGE */}

                  <div className="relative overflow-hidden">

                    <img
                      src={
  item.image ||
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f"
}
                      alt={item.title}
                      className="
w-full
h-[340px]
object-contain

bg-gradient-to-b
from-[#351010]
via-[#250909]
to-[#1a0808]

p-4

group-hover:scale-105
transition-all
duration-700
"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute top-4 right-4">

                      <span
className="
px-3
py-1
rounded-full

bg-black/80

border
border-red-500/40

text-red-300
text-xs
font-bold

tracking-widest
uppercase
"
>
                        {item.category}
                      </span>

                    </div>

                  </div>

                  {/* CONTENT */}

                  <div
className="
p-6
flex
flex-col
flex-1

bg-gradient-to-b
from-red-950/10
to-red-900/5
"
>

  <h2 className="text-2xl font-black text-white mb-4">
  {item.title}
</h2>

<div
className="
w-20
h-[2px]
rounded-full
bg-gradient-to-r
from-red-600
to-red-900
mb-5
"
/>

  <div className="space-y-4 flex-1">

    <div>

      <p className="text-xs uppercase tracking-widest text-red-400">
        Category
      </p>

      <p className="font-semibold">
        {item.category}
      </p>

    </div>

    <div>

      <p className="text-xs uppercase tracking-widest text-red-400">
        Authorized Rank
      </p>

      <span
className="
inline-flex

px-4
py-2

rounded-full

bg-black/60

border
border-red-600/40

text-red-300

font-bold
tracking-wide
"
>
  {item.access}
</span>

    </div>

    <div>

      <p className="text-xs uppercase tracking-widest text-red-400">
        Status
      </p>

      <span
className="
inline-flex

px-4
py-2

rounded-full

bg-gradient-to-r
from-red-950
to-red-700

border
border-red-500/40

text-red-100

font-bold
text-sm
"
>
        Official Uniform
      </span>

      <div className="mt-auto pt-6">

  <span
    className="
      px-4
      py-2
      rounded-full
      bg-gradient-to-r
      from-red-900
      to-red-600
      text-white
      text-xs
      tracking-widest
      uppercase
      font-bold
    "
  >
    DWARRIORS ORGANIZATION
  </span>

</div>

    </div>

  </div>

</div>

                </div>

              )
            )}

          </div>

          {/* EMPTY */}

          {filteredOutfits.length === 0 && (

            <div className="mt-10">

              <EmptyState
                title="No wardrobe found"
              />

            </div>

          )}
          {/* PAGINATION */}

          {totalPages > 1 && (

            <div className="flex justify-center items-center gap-4 mt-12">

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
                className="px-5 py-3 rounded-2xl bg-white/5 border border-red-600/30 disabled:opacity-40 hover:border-red-500 transition-all"
              >
                Previous
              </button>

              <span className="font-semibold text-red-200">

                Page {currentPage}
                {" "}
                of
                {" "}
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
                className="px-5 py-3 rounded-2xl bg-white/5 border border-red-600/30 disabled:opacity-40 hover:border-red-500 transition-all"
              >
                Next
              </button>

            </div>

          )}
          </>
)}
        </div>

      </div>

          {selectedOutfit && (

  <div
    className="
      fixed
      inset-0
      z-[999]
      bg-black/80
      backdrop-blur-xl
      flex
      items-center
      justify-center
      p-6
    "
    onClick={() => {
  setSelectedOutfit(null);
  setSelectedImage(null);
}}
  >

    <div
      onClick={(e) =>
        e.stopPropagation()
      }
      className="
        w-full
        max-w-7xl
        bg-gradient-to-br
        from-[#070707]
via-[#130909]
to-[#000000]
        border
        border-red-500/30
        rounded-[40px]
        overflow-hidden
        shadow-[0_0_70px_rgba(220,38,38,0.45)]
      "
    >

      <div className="grid lg:grid-cols-[650px_1fr]">

        {/* IMAGE */}

        <div
className="
relative

bg-gradient-to-b
from-[#351010]
via-[#250909]
to-[#1a0808]
"
>
  

          <img
  src={
    selectedImage ||
    selectedOutfit.image
  }
  alt={selectedOutfit.title}
  className="
    w-full
    h-[850px]
    object-contain

    bg-gradient-to-b
    from-[#351010]
    via-[#250909]
    to-[#1a0808]

    p-6
  "
/>

         <div
className="
absolute
inset-0

bg-gradient-to-t
from-black/80
via-transparent
to-transparent
"
/>
          <div
  className="
    absolute
    bottom-5
    left-1/2
    -translate-x-1/2
    flex
    gap-3
    z-20
  "
>
  {(selectedOutfit.images ||
    [selectedOutfit.image])
      .slice(0, 3)
      .map((img, index) => (

    <img
      key={index}
      src={img}
      alt=""
      onClick={() =>
        setSelectedImage(img)
      }
      className={`
        w-28
        h-28
        rounded-xl
        object-cover
        cursor-pointer
        border-2
        transition-all
        ${
          selectedImage === img
? "border-red-500 scale-110 shadow-[0_0_20px_rgba(220,38,38,0.6)]"
: "border-red-900/30"
        }
      `}
    />

  ))}
</div>

        </div>

        {/* CONTENT */}

        <div className="p-10 flex flex-col">

          <div className="mb-6">

            <span
              className="
                px-4
                py-2
                rounded-full
                bg-red-700/30
                border
                border-red-500/30
                text-red-200
                text-sm
              "
            >
              {selectedOutfit.category}
            </span>

          </div>

          <h2
            className="
              text-5xl
              font-black
              text-white
              leading-tight
            "
          >
            {selectedOutfit.title}
          </h2>

          <p
  className="
    mt-6
    text-gray-300
    leading-relaxed
  "
>
  {selectedOutfit.description}
</p>

<div
  className="
    mt-8
    grid
    grid-cols-2
    gap-4
  "
>

  <div className="bg-white/5 rounded-2xl p-4">
    <p className="text-xs text-red-400 uppercase">
      Outfit Code
    </p>

    <h3 className="font-bold mt-2">
      {selectedOutfit.code}
    </h3>
  </div>

  <div className="bg-white/5 rounded-2xl p-4">
    <p className="text-xs text-red-400 uppercase">
      Rarity
    </p>

    <h3 className="font-bold mt-2 text-yellow-300">
      {selectedOutfit.rarity}
    </h3>
  </div>

  <div className="bg-white/5 rounded-2xl p-4">
    <p className="text-xs text-red-400 uppercase">
      Acquisition
    </p>

    <h3 className="font-bold mt-2">
      {selectedOutfit.acquisition}
    </h3>
  </div>

  <div className="bg-white/5 rounded-2xl p-4">
    <p className="text-xs text-red-400 uppercase">
      Version
    </p>

    <h3 className="font-bold mt-2">
      {selectedOutfit.version}
    </h3>
  </div>

</div>

          <div className="mt-8 space-y-5">

            <div>

              <p className="text-red-400 text-sm uppercase tracking-widest">
                Authorized Rank
              </p>

              <h3 className="text-xl font-bold mt-2">
                {selectedOutfit.access}
              </h3>

            </div>

            <div>

              <p className="text-red-400 text-sm uppercase tracking-widest">
                Status
              </p>

              <h3 className="text-xl font-bold mt-2 text-red-300">
DWARRIORS Official Uniform
</h3>

            </div>

          </div>

          <div className="mt-auto pt-10">

            <div
              className="
px-5
py-3

rounded-full

bg-gradient-to-r
from-red-950
via-red-800
to-red-600

text-white

text-xs
tracking-[0.2em]

uppercase

font-black

shadow-[0_0_25px_rgba(220,38,38,0.5)]
"
            >
              DWARRIORS ORGANIZATION
            </div>

          </div>

          <button
  onClick={() => {
    setSelectedOutfit(null);
    setSelectedImage(null);
  }}
            className="
mt-10

bg-gradient-to-r
from-red-950
via-red-800
to-red-600

hover:scale-105

px-6
py-4

rounded-2xl

font-black

shadow-[0_0_30px_rgba(220,38,38,0.5)]

transition-all
duration-300
"
          >
            Close
          </button>

        </div>

      </div>

    </div>

  </div>

)}


    </AppLayout>

  );
}