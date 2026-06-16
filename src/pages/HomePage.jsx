import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";


export default function HomePage() {

const [loading, setLoading] = useState(true);
const [selectedImage, setSelectedImage] = useState(null);

const [isPlaying, setIsPlaying] = useState(false);
const [volume, setVolume] = useState(30);

const particles = useMemo(
  () =>
    Array.from({ length: 60 }, () => ({
      left: Math.random() * 100,
      size: 2 + Math.random() * 5,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
    })),
  []
);
   const audioRef = useRef(null);



useEffect(() => {
  const audio = audioRef.current;

  if (!audio) return;

  audio.volume = volume / 100;

  audio.play()
    .then(() => setIsPlaying(true))
    .catch(() => {});
}, []);

useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 3000);

  return () => clearTimeout(timer);
}, []);

const toggleMusic = () => {
  const audio = audioRef.current;

  if (!audio) return;

  if (audio.paused) {
    audio.play();
    setIsPlaying(true);
  } else {
    audio.pause();
    setIsPlaying(false);
  }
};

const handleVolume = (e) => {
  const value = Number(e.target.value);

  setVolume(value);

  if (audioRef.current) {
    audioRef.current.volume = value / 100;
  }
};

if (loading) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-red-700/30 blur-[180px] rounded-full" />

      <div className="relative z-10 text-center animate-fadeIn">

        <h1 className="text-6xl md:text-8xl font-black tracking-[0.3em] text-white">
          DWARRIORS
        </h1>

        <p className="mt-4 text-3xl text-red-400">
          BLOOD • POWER • LEGACY
        </p>

        <div className="mt-10 w-72 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">

          <div
  className="h-full w-0 bg-gradient-to-r from-red-800 via-red-600 to-red-400 animate-loading"
/>
        </div>

        <p className="mt-6 text-gray-400 tracking-[0.3em] uppercase">
          Loading...
        </p>

      </div>

    </div>
  );
}


  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">

      {/* MAIN BACKGROUND */}

<div className="absolute inset-0 overflow-hidden">

  <img
    src="https://i.ibb.co.com/M5N31ymd/image-4d5022a.png"
    alt=""
    className="
      absolute
      inset-0
      w-full
      h-full
      object-cover
      opacity-200
      scale-110
    "
  />

  {/* DARK OVERLAY */}

  <div
    className="
      absolute
      inset-0
      bg-black/55
    "
  />

  {/* RED ATMOSPHERE */}

  <div
    className="
      absolute
      inset-0
      bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.35)_0%,rgba(0,0,0,0)_50%)]
    "
  />

  {/* VIGNETTE */}

  <div
    className="
      absolute
      inset-0
      bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.9)_100%)]
    "
  />

</div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">

{particles.map((particle, i) => (
  <span
    key={i}
    className="particle"
    style={{
      left: `${particle.left}%`,
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      animationDuration: `${3 + Math.random() * 4}s`,
animationDelay: `${Math.random() * 2}s`,
      background: "#dc2626",
boxShadow: "0 0 10px #dc2626",
    }}
  />
))}

</div>

      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute w-full max-w-[500px] min-h-[500px] bg-red-700 blur-[180px] rounded-full top-[-150px] left-[-100px]" />
        <div className="absolute w-full max-w-[400px] min-h-[400px] bg-red-900 blur-[160px] rounded-full bottom-[-120px] right-[-80px]" />
      </div>

      {/* MAIN */}
      <div className="relative z-10">
        <div
  className="
  fixed
  bottom-6
  left-6
  z-50
  w-[320px]
  bg-black/70
  backdrop-blur-xl
  border
  border-red-700/30
  rounded-3xl
  p-4
  shadow-[0_0_30px_rgba(220,38,38,0.25)]
"
>

  <div className="flex items-center gap-4">

    <div
      className={`
      text-3xl
      ${isPlaying ? "animate-spin" : ""}
    `}
      style={{
        animationDuration: "6s",
      }}
    >
      ♬
    </div>

    <div className="flex-1">

      <p className="font-[Cinzel] text-red-300">
        DWARRIORS ANTHEM
      </p>

      <p className="text-xs text-gray-400">
        {isPlaying ? "Now Playing" : "Paused"}
      </p>

    </div>

    <button
      onClick={toggleMusic}
      className="
      px-4
      py-2
      rounded-xl
      bg-red-700
hover:bg-red-600
      transition-all
    "
    >
      {isPlaying ? "❚❚" : "▶"}
    </button>

  </div>

  <input
    type="range"
    min="0"
    max="100"
    value={volume}
    onChange={handleVolume}
    className="w-full mt-4"
  />

</div>
        <audio
  ref={audioRef}
  loop
>
  <source
    src="https://res.cloudinary.com/dbn9lgdi4/video/upload/v1781335095/D.WARRIORS_ANTHEM_-_Prod.By_MANGBORIS_Official_Audio_GTA_jsl6fg.mp3"
    type="audio/mpeg"
  />
</audio>

        {/* HERO DWARRIORS V2 */}
{/* HERO DWARRIORS RED LEGACY */}

<section
  className="
    relative
    h-screen
    flex
    items-center
    justify-center
    overflow-hidden
    px-6
  "
>
  {/* SKYLINE */}
  
  <div
    className="
      absolute
      bottom-0
      left-0
      w-full
      h-[350px]
      bg-gradient-to-t
      from-black
      via-black/70
      to-transparent
      pointer-events-none
    "
  />
  {/* LIGHTNING LEFT */}
  <div
  className="
    absolute
    left-[20%]
    top-[5%]
    w-[3px]
    h-[220px]
    bg-red-300
    rotate-[25deg]
    lightning-flash
    blur-[1px]
  "
/>

<div
  className="
    absolute
    left-[22%]
    top-[18%]
    w-[3px]
    h-[160px]
    bg-red-400
    -rotate-[20deg]
    lightning-flash
    blur-[1px]
  "
/>

<div
  className="
    absolute
    left-[18%]
    top-[30%]
    w-[3px]
    h-[140px]
    bg-red-500
    rotate-[35deg]
    lightning-flash
    blur-[1px]
  "
/>

<div
  className="
    absolute
    left-[15%]
    top-0
    w-[4px]
    h-[350px]
    bg-gradient-to-b
    from-red-300
    via-red-500
    to-transparent
    rotate-[15deg]
    blur-[2px]
    lightning-flash
    opacity-0
    pointer-events-none
  "
/>
<div
  className="
    absolute
    right-[18%]
    top-0
    w-[4px]
    h-[300px]
    bg-gradient-to-b
    from-red-300
    via-red-500
    to-transparent
    -rotate-[20deg]
    blur-[2px]
    lightning-flash
    opacity-0
    pointer-events-none
  "
/>

{/* RED SKY GLOW */}

<div
  className="
    absolute
    inset-0
    red-sky-pulse
    bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.35)_0%,transparent_60%)]
    pointer-events-none
  "
/>

{/* LIGHTNING FLASH */}

<div
  className="
    absolute
    inset-0
    lightning-flash
    bg-red-500/20
    pointer-events-none
  "
/>

 {/* WILL OF THE D */}

<img
  src="https://i.ibb.co.com/QFmF4W7W/logodw-2-Photoroom.png"
  alt="Will Of The D"
  className="
  block
  absolute
  z-30
  left-[-370px]
  top-1/2
  -translate-y-1/2
  w-[1200px]
  opacity-100
  select-none
  pointer-events-none
  will-logo
"
/>
<div
  className="
    hidden
    xl:block

    absolute
    left-[-200px]
    top-1/2
    -translate-y-1/2

    w-[500px]
    h-[700px]

    bg-red-700/10
    blur-[120px]

    pointer-events-none
  "
/>

  {/* RIGHT RAVEN */}
  <div
  className="
    hidden
    xl:block
    absolute
    right-[-80px]
    top-1/2
    -translate-y-1/2
    opacity-100
    pointer-events-none
  "
>
    <img
  src="https://i.ibb.co.com/gLwhkLsg/logodw-1.png"
  alt=""
  className="
    w-[650px]
    drop-shadow-[0_0_60px_rgba(220,38,38,0.4)]
  "
/>
  </div>

  <div
  className="
    relative
    z-10
    w-full
    max-w-[1800px]
    mx-auto
    text-center
  "
>

    {/* TOP BADGE */}

    <div className="flex justify-center w-full">

  <div
    className="
      inline-flex
      items-center
      gap-3
      px-8
      py-3
      rounded-full
      border
      border-red-700/30
      bg-black/50
      backdrop-blur-xl
    "
  >
      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />

      <span className="uppercase tracking-[0.35em] text-sm text-red-100">
        DWARRIORS COMMUNITY ROLEPLAY GTA V
      </span>
    </div>
    </div>

    {/* TITLE */}

    <div className="relative mt-10 inline-block">

      <div
        className="
          absolute
          inset-0
          bg-red-600
          blur-[120px]
          opacity-50
          scale-150
        "
      />

   <h1
  className="
  font-[Cinzel]
    relative
    text-6xl
    md:text-[8rem]
    lg:text-[10rem]
    text-center
    font-black
    uppercase
    tracking-tight
    leading-none

    bg-gradient-to-b
    from-[#ffffff]
    via-[#ff6b6b]
    to-[#7a0000]

    bg-clip-text
    text-transparent
    opacity-100
  "
  style={{
    WebkitTextStroke: "1px rgba(60,0,0,0.85)",

    textShadow: `
      0 1px 0 rgba(255,255,255,0.4),
      0 3px 0 rgba(170,0,0,0.7),
      0 8px 15px rgba(0,0,0,0.6),
      0 0 20px rgba(255,50,50,0.8),
      0 0 40px rgba(220,38,38,0.6),
      0 0 80px rgba(220,38,38,0.35)
    `
  }}
>
  DWARRIORS
</h1>

    </div>

    {/* SUBTITLE */}

    <p
      className="
        mt-6
        text-red-300
        uppercase
        tracking-[0.5em]
        font-semibold
      "
    >
      BLOOD • POWER • LEGACY
    </p>

    {/* CENTER LOGO */}

    <div
      className="
        relative
        mt-12
        flex
        justify-center
        items-center
        h-[320px]
      "
    >
      {/* GLOW */}

      <div
        className="
          absolute
          w-[700px]
h-[700px]
          rounded-full
          bg-red-700/20
          blur-[180px]
        "
      />

      {/* MAIN LOGO */}

      <img
        src="https://i.ibb.co.com/nMrw6G4N/logodw.png"
        alt=""
        className="
  relative
  z-20
  -translate-x-6
  w-[280px] md:w-[380px]
  object-contain
  animate-floating
  drop-shadow-[0_0_80px_rgba(220,38,38,0.8)]
"
      />

    </div>

    {/* BUTTONS */}

    <div className="flex flex-wrap justify-center gap-6 mt-20">

      <Link to="/login">

        <button
          className="
            px-14
            py-5
            rounded-xl
            font-[Cinzel]
            text-lg
            border
            border-red-500/30
            bg-gradient-to-r
            from-red-900
            via-red-700
            to-red-500
            hover:scale-105
            transition-all
            shadow-[0_0_40px_rgba(220,38,38,0.4)]
            opacity-60
          "
        >
          ENTER ORGANIZATION
        </button>

      </Link>

      <Link to="/wardrobe">

        <button
          className="
            px-14
            py-5
            rounded-xl
            font-[Cinzel]
            text-lg
            border
            border-red-500/20
            bg-black/50
            backdrop-blur-xl
            hover:border-red-500/50
            hover:scale-105
            transition-all
            opacity-75
          "
        >
          DISCOVER OUR LEGACY
        </button>

      </Link>

    </div>

  </div>

</section>

      </div>

    </div>
  );
}