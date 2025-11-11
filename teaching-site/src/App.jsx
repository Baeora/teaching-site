import { useEffect, useState, useRef, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Music, CalendarDays, Mail, Phone, MapPin, ChevronRight } from "lucide-react";

// Uses semantic classes from src/theme.css (Tailwind v4)
// Brand colors come from CSS vars: --brand-primary, --brand-secondary, --brand-tertiary

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "lessons", label: "Lessons" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
];

/** ------------------------------------------------------------------ *
 *  VideoCarousel (native controls, 75% size, caption below, stable id)
 *  - Click-to-play via native controls (audio allowed)
 *  - No auto-advance until current video ends
 *  - Stable component identity via memo()
 *  - Persists active index in sessionStorage (lazy init)
 * ------------------------------------------------------------------- */
const VideoCarousel = memo(function VideoCarousel({
  videos,
  persistKey = "vc-index",
}) {
  // Restore last index immediately (prevents flash to 0 on remount)
  const [i, setI] = useState(() => {
    try {
      const saved = sessionStorage.getItem(persistKey);
      const n = Number.parseInt(saved ?? "0", 10);
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    } catch {
      return 0;
    }
  });
  const count = videos?.length ?? 0;

  // Stable host id for observers
  const idRef = useRef(null);
  if (!idRef.current) idRef.current = "vc-" + Math.random().toString(36).slice(2, 7);
  const id = idRef.current;

  // Refs to <video> elements
  const vidRefs = useRef([]);
  useEffect(() => {
    vidRefs.current = Array(count).fill(null).map((_, idx) => vidRefs.current[idx] || null);
  }, [count]);

  // Persist index on change
  useEffect(() => {
    try { sessionStorage.setItem(persistKey, String(i)); } catch {}
  }, [i, persistKey]);

  // Reset only non-active videos on slide change
  useEffect(() => {
    vidRefs.current.forEach((v, idx) => {
      if (!v || idx === i) return;
      try { v.pause(); } catch {}
      v.currentTime = 0;
    });
  }, [i]);

  // Pause when offscreen (don’t change index)
  useEffect(() => {
    const host = document.getElementById(id);
    if (!host) return;
    const obs = new IntersectionObserver(
      (ents) => {
        const visible = ents.some((e) => e.isIntersecting);
        if (!visible) {
          const v = vidRefs.current[i];
          if (v && !v.paused) try { v.pause(); } catch {}
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(host);
    return () => obs.disconnect();
  }, [id, i]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (!count) return;
      if (e.key === "ArrowRight") setI((p) => (p + 1) % count);
      if (e.key === "ArrowLeft")  setI((p) => (p - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  // Touch swipe
  useEffect(() => {
    let x0 = null;
    const host = document.getElementById(id);
    if (!host) return;
    const dn = (e) => (x0 = e.touches?.[0]?.clientX ?? null);
    const mv = (e) => {
      if (x0 == null) return;
      const dx = (e.touches?.[0]?.clientX ?? 0) - x0;
      if (Math.abs(dx) > 40) {
        setI((p) => (p + (dx < 0 ? 1 : -1) + count) % count);
        x0 = null;
      }
    };
    host.addEventListener("touchstart", dn, { passive: true });
    host.addEventListener("touchmove",  mv, { passive: true });
    return () => {
      host.removeEventListener("touchstart", dn);
      host.removeEventListener("touchmove",  mv);
    };
  }, [id, count]);

  if (!count) return null;

  // Show the first frame for the ACTIVE slide only (no posters)
  const onLoadedMeta = (video, idx) => () => {
    if (idx !== i) return;
    try { video.currentTime = 0.001; } catch {}
  };

  const onEnded = (idx) => () => {
    if (idx !== i) return;
    setI((p) => (p + 1) % count); // advance only after end
  };

  const currentVideo = videos[i];

  return (
    <section aria-label="Student Highlights">
      {/* VIDEO AREA */}
      <div
        id={id}
        className={`relative w-full h-120 overflow-hidden rounded-3xl border border-white/10 bg-white/5`}
      >
        {/* Slides */}
        <div
          className="absolute inset-0 flex transition-transform duration-500"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {videos.map((v, idx) => (
            <div key={idx} className="relative shrink-0 w-full h-full">
              {/* Video centered, 75% of area */}
              <div className="absolute inset-0 flex items-center justify-center">
                <video
                  ref={(el) => (vidRefs.current[idx] = el)}
                  className="max-h-[75%] max-w-[75%] w-auto h-auto object-contain rounded-xl shadow-lg video-chrome"
                  src={v.src}
                  controls
                  playsInline
                  preload="metadata"
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  disablePictureInPicture
                  onLoadedMetadata={onLoadedMeta(vidRefs.current[idx], idx)}
                  onEnded={onEnded(idx)}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>

              {/* Subtle contrast overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        {/* Themed nav arrows */}
        <button
          aria-label="Previous"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 shadow-lg
                     border border-white/10 bg-[#43b1cb] text-white
                     hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30"
          onClick={() => setI((p) => (p - 1 + count) % count)}
        >
          ‹
        </button>
        <button
          aria-label="Next"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 shadow-lg
                     border border-white/10 bg-[#43b1cb] text-white
                     hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30"
          onClick={() => setI((p) => (p + 1) % count)}
        >
          ›
        </button>
      </div>

      {/* CAPTION AREA (always below) */}
      {(currentVideo?.title || currentVideo?.caption) && (
        <div className="mt-4 flex justify-center">
          <div className="w-[min(75%,48rem)]">
            <div className="rounded-xl backdrop-blur bg-black/30 border border-white/10 p-3 md:p-4">
              {currentVideo.title && <h3 className="font-semibold">{currentVideo.title}</h3>}
              {currentVideo.caption && <p className="text-sm text-slate-200 mt-1">{currentVideo.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

// ---------------------------------------------------------------------


const FAQSection = memo(function FAQSection({ title = "FAQ", faqs = [], allowMultiple = false }) {
  const [open, setOpen] = useState(() => new Set());

  const toggle = (idx) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else {
        if (!allowMultiple) next.clear();
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <section id="faq" className="scroll-mt-16 section">
      <div className="container-6xl mx-auto">
        <h2 className="section-title">{title}</h2>
        <p className="mt-2 text-slate-300 max-w-prose">
          Everything you might be wondering before booking your first lesson.
        </p>

        <div className="mt-8 space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = open.has(idx);
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/70 to-slate-900/70
                           hover:border-white/20 transition-colors"
              >
                {/* Gradient glow ring */}
                <div className="relative">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100
                               transition-opacity"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--brand-primary), color-mix(in oklab, var(--brand-secondary) 60%, transparent))",
                      filter: "blur(16px)",
                    }}
                  />
                </div>

                <button
                  className="relative w-full flex items-start gap-4 text-left p-5 md:p-6"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  onClick={() => toggle(idx)}
                >
                  {/* Left accent pill */}
                  <span
                    className={`mt-1 h-6 w-1.5 rounded-full transition-colors
                                ${isOpen ? "bg-[var(--brand-primary)]" : "bg-white/20 group-hover:bg-white/40"}`}
                    aria-hidden
                  />
                  <span className="flex-1">
                    <span className="block font-semibold text-base md:text-lg">
                      {item.q}
                    </span>
                  </span>
                  <ChevronRight
                    className={`mt-0.5 size-5 shrink-0 transition-transform
                                ${isOpen ? "rotate-90 text-white" : "text-white/70 group-hover:text-white"}`}
                    aria-hidden
                  />
                </button>

                <div
                  id={`faq-panel-${idx}`}
                  role="region"
                  aria-labelledby={`faq-header-${idx}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out
                              ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 py-5 pb-5 md:px-6 md:pb-6 text-slate-300 leading-relaxed">
                      {typeof item.a === "string" ? <p>{item.a}</p> : item.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
});


export default function App() {
  const [active, setActive] = useState("home");

  // inside App() component:
  const [showThanks, setShowThanks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const modalCloseBtnRef = useRef(null);

  function encode(data) {
    return new URLSearchParams(data).toString();
  }

  async function handleContactSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    // Netlify requires the form-name in the body for AJAX posts
    if (!fd.get("form-name")) fd.set("form-name", form.getAttribute("name"));

    // Honeypot check (if bot-field has data, silently succeed)
    if (fd.get("bot-field")) {
      setShowThanks(true);
      setSubmitting(false);
      form.reset();
      return;
    }

    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(fd),
      });
      if (res.ok) {
        setShowThanks(true);
        form.reset();
        // move focus to modal for a11y
        setTimeout(() => modalCloseBtnRef.current?.focus(), 0);
      } else {
        alert("Sorry, something went wrong sending your message.");
      }
    } catch {
      alert("Network error while sending your message.");
    } finally {
      setSubmitting(false);
    }
  }


  // Memoize video list so parent re-renders don't recreate the array
  const videos = useMemo(
    () => [
      { src: "/otr.mov",   title: "Original Song Showcase",  caption: "Interested in learning how to write your own songs, or think your child might be? I have been writing songs for over 12 years and know how to play a large variety of instruments (which I can also teach to some capacity!) - I'd love to help my students along that journey " },
      { src: "/abby1.mp4", title: "Student Showcase",  caption: "Here is a video of one of my students performing one of my favorite Christmas tunes, notice how she is both demonstrating her strumming ability and her ability to pluck multiple strings at once, adding melody to the harmony!" },
      { src: "/andrews.mp4",  title: "Parent / Student Testimonial", caption: "Before I left Boston I asked one of my families if we could do an of Exit-Interview of sorts, partly for my own improvement but also so that one day I might be able to show prospective students what a lesson with me entails, and how students might feel years into the journey (Apologies for the video quality, I forgot to focus the lens before recording!)" },
    ],
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { threshold: 0.6 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
      <div className="min-h-screen w-screen">
        {/* Top Nav */}
        <header className="nav">
          <nav className="container-6xl mx-auto py-3 flex items-center justify-between">
            <a href="#home" className="nav-brand">
              <img src="logo_white.png" className="h-8"/>
              <span>South Hill Music Lessons</span>
            </a>
            <ul className="nav-list">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`nav-link ${active === s.id ? "nav-link--active" : ""}`}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <a href="#contact" className="btn btn-ghost md:inline-flex hidden">Book a Lesson</a>
          </nav>
        </header>

        {/* Hero */}
        <section id="home" className="relative overflow-hidden">
          <div className="container-6xl mx-auto py-8 md:py-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-10 items-center"
            >
              <div>
                <p className="badge badge-secondary">Spokane, WA • South Hill • Private Music Lessons</p>
                <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
                  Learn Guitar & Music Theory
                  <span className="block" style={{ color: "var(--brand-primary)" }}>
                    with Patient, Personalized Lessons
                  </span>
                </h1>
                <p className="mt-4 text-slate-300 max-w-prose">
                  I have been teaching my entire adult life, whether that be teaching myself how to play music, 
                  studying education at Rutgers University, or working with students 1 on 1 for over 5 years 
                  after studying songwriting in Boston, MA at Berklee College of Music; I really believe it is in my blood.
                  <br /><br />
                  My goal with this business is to provide incredibly high quality music lessons 
                  at an affordable price to a community that has accepted me with open arms 
                  since moving here last year.
                  <br /><br />
                  I would love for you or your child to be one of my students!
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#pricing" className="btn btn-primary">
                    See Pricing <ChevronRight className="size-4" />
                  </a>
                  <a href="#lessons" className="btn btn-outline">
                    What You'll Learn
                  </a>
                </div>
              </div>

              <div className="relative aspect-[3/4]">
                <div className="relative h-full w-full">
                  <img
                    src="full-body.jpg"               // put in /public or import from /src/assets
                    alt="Guitar instructor"
                    className="absolute inset-0 h-full w-full object-cover guitar-mask-custom"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-16 section">
          <div className="container-6xl mx-auto">
            <div className="">
              <div>
                <h2 className="section-title">About Your Teacher</h2>
                <div className="relative">
                  <div
                    className="absolute -inset-7"
                    style={{
                      background: "color-mix(in oklab, var(--brand-primary) 20%, transparent)",
                      filter: "blur(36px)",
                      borderRadius: "9999px"
                    }}
                    aria-hidden
                  />
                  <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-2xl">
                    {/* Profile card with circular image + blurb */}
                    <div className="">
                      <div className="flex items-start gap-4">
                        <img
                          src="headshot.jpg"
                          alt="Michael Skriloff - Music Teacher"
                          className="h-32 aspect-square rounded-full object-cover ring-1 ring-white/10"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">Hi! I’m Michael</h3>
                          <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                            I grew up in the suburbs of Edison, New Jersey and surprisingly I did not really get into music 
                            until I was ~17. Prior to that I was very interested in computer science, but after landing my 
                            first job I decided I wanted a different life. Using the money from work, I bought my first 
                            guitar and taught myself how to play it via YouTube - the rest is history. I started writing 
                            songs, got accepted into music school and ended up teaching 1 on 1 for 5 years in the greater 
                            Boston Area. 
                          </p>
                          <br></br>
                          <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                            Recently, I've landed here in Spokane, WA over on the South Hill and funnily enough I am in a 
                            similar situation to where I was when I was 17. When the pandemic hit I had to give up teaching and 
                            pivot back into computer science in order to survive. Now I am currently working in tech, but dreaming of getting
                            back to my roots and setting up a small school here where I can give back to my community. I would love to come 
                            full circle and make this my life once again.</p>
                        </div>
                      </div>
                      <div className="mt-4 h-px bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Optional feature cards omitted for brevity */}
            </div>
          </div>
        </section>

        {/* Video Carousel (replaces the old banner spacer) */}
        <div className="container-6xl mx-auto">
          <VideoCarousel videos={videos} persistKey="student-highlights" />
        </div>

        {/* Lessons */}
        <section id="lessons" className="scroll-mt-8 section">
          <div className="container-6xl mx-auto">
            <div className="flex items-center gap-3">
              <h2 className="section-title">My Curriculum</h2>
            </div>

            <p className="mt-3 text-slate-300 max-w-prose">
              I run a bit of an unorthodox teaching curriculum, but one that has served me for many years. I don't require
              beginner books, or force all of my students into one style of learning— instead, I meet my students where
              they are and allow them the creativity to choose their own adventure.
            </p>

            {/* Mobile: stacked pairs; Desktop: 1fr / 2fr split */}
            <div className="mt-8 grid gap-6 md:grid-cols-[1fr_2fr]">
              {/* LEFT: text cards */}
              <div className="hidden md:grid md:grid-rows-3 md:auto-rows-[minmax(0,1fr)] gap-6">
                {[
                  {
                    title: "Rhythm",
                    body:
                      "This part of the teaching will be focused on things like clean strumming, different chord shapes, unique tunings, and the practical applications for the theory that will be learned",
                  },
                  {
                    title: "Theory",
                    body:
                      "Learning an instrument is one thing, but you won't go very far if you don't dedicate time to learn the underlying theory behind the music you intend to play. This part of the curriculum focuses on the foundation of keys all the way up to full song analysis, and covers things like sight reading and ear training as well.",
                  },
                  {
                    title: "Lead",
                    body:
                      "What are rhythm and harmony without a melody to accompany them? This section of teaching aims to equip students with the ability to stand up on their own two feet and master the fretboard. They will learn how to improvise over any backing track in any key, and how to not just play their instrument, but make it sing.",
                  },
                ].map((c) => (
                  <div key={c.title} className="card-ghost p-6">
                    <h3 className="font-semibold text-xl">{c.title}</h3>
                    <p className="mt-3 text-slate-300 text-sm leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>

              {/* RIGHT: images grid (desktop) */}
              <div className="hidden md:grid md:grid-rows-3 md:auto-rows-[minmax(0,1fr)] gap-6">
                {[
                  { src: "rhythm.png", alt: "Rhythm practice" },
                  { src: "theory.png", alt: "Music theory notes" },
                  { src: "lead.png", alt: "Lead guitar playing" },
                ].map((img) => (
                  <div key={img.src} className="relative h-full w-full overflow-hidden rounded-2xl">
                    {/* keep rectangular images tidy */}
                    <div className="absolute inset-0">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* MOBILE: stacked pairs (text above image) */}
              <div className="md:hidden space-y-6">
                {[
                  {
                    title: "Rhythm",
                    body:
                      "We’ll focus on clean strumming, chord shapes, unique tunings, and practical applications for the theory you learn.",
                    img: { src: "rhythm.png", alt: "Rhythm practice" },
                  },
                  {
                    title: "Theory",
                    body:
                      "From the foundations of keys to full song analysis—plus sight reading and ear training to round out your musicianship.",
                    img: { src: "theory.png", alt: "Music theory notes" },
                  },
                  {
                    title: "Lead",
                    body:
                      "Master the fretboard, improvise in any key, and develop melodic phrasing so you don’t just play guitar—you make it sing.",
                    img: { src: "lead.png", alt: "Lead guitar playing" },
                  },
                ].map((c) => (
                  <div key={c.title} className="space-y-3">
                    <div className="card-ghost p-5">
                      <h3 className="font-semibold text-lg">{c.title}</h3>
                      <p className="mt-2 text-slate-300 text-sm leading-relaxed">{c.body}</p>
                    </div>
                    {/* constrain rectangular images; tweak aspect as you prefer */}
                    <div className="w-full overflow-hidden rounded-2xl">
                      <div className="aspect-[16/9] w-full">
                        <img
                          src={c.img.src}
                          alt={c.img.alt}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-16 section">
          <div className="container-6xl mx-auto">
            <h2 className="section-title">Pricing</h2>
            <p className="mt-2 text-slate-300 max-w-prose">One straightforward option for weekly or biweekly lessons.</p>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {[
                { name: "One Hour",  price: "$60", dur: "60 minutes",
                  features: ["Weekly or Biweekly", "Includes Free Intro", "Billed Monthly"]},
              ].map((tier) => (
                <div key={tier.name} className={`card p-6 ${tier.highlighted ? "highlight" : ""}`}>
                  {tier.highlighted && (
                    <span
                      className="absolute -mt-5 ml-6 text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ background: "var(--brand-primary)", color: "#0f172a" }}
                    >
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <p className="mt-1 text-sm text-slate-300">{tier.dur}</p>
                  <div className="mt-4 text-4xl font-extrabold">
                    {tier.price}
                    <span className="align-top text-sm font-semibold text-slate-300"> / lesson</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-1 dot" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className="btn btn-primary mt-6">
                    Book this <ChevronRight className="size-4" />
                  </a>
                </div>
              ))}
              <div>
                <h4>My Pricing Philosophy</h4>
                <br></br>
                <p>I am a firm believer that a 30-minute lesson is NOT enough time for any student to learn an instrument below a very advanced level. 
                  Often times, in a 30 minute lesson, a teacher shows up and has to spend the first 5-10 minutes recapping the previous lesson, 
                  checking homework, etc. and the final 5-10 minutes at the end are reserved for wrapping up. That is only about 15 minutes of 
                  real lesson time! </p>
              </div>
              <div>
                <p>By committing to a full 60-minute lesson, you are ensuring that you or your child will have more than enough time to relax, 
                  learn and absorb the teachings I can provide.</p>
                <br></br>
                <p>As for price, I believe in offering affordable, high quality lessons and so after researching price ranges in the area 
                  I have decided on a price which stays near the lower end of the pool but still reflects the level of schooling and 
                  experience I have amounted through my years at Berklee and as a teacher over time.</p>
              </div>
            </div>
          </div>
        </section>

        <FAQSection
          title="Questions about lessons"
          faqs={[
            {
              q: "Do you teach total beginners?",
              a: "Absolutely! We’ll start with posture, tuning, and a first song you choose so practice stays fun.",
            },
            {
              q: "Do you offer online lessons?",
              a: "Unfortunately, I do not. I firmly believe that, to get real value out of paid instruction, you MUST meet in person! There are so many little things that get lost over Zoom; Form, intonation, emotion; It is just so much better to be with your instructor and for that reason I do not offer online lessons out of principle.",
            },
            {
              q: "What ages do you teach?",
              a: "Typically ages 6-7+ and adults of all levels. If your child is younger, we can chat about readiness depending on where they are at developmentally!",
            },
            {
              q: "What should I bring to the first lesson?",
              a: "Just your guitar, a notebook and pencil to write with. If you don’t have a guitar yet, I can help you pick a great starter within your budget!",
            },
            {
              q: "Will there be homework?",
              a: "Yes. Every lesson I will assign homework, usually 2-3 assignments which will total up to an hour or two of practice each week (or more, for more dedicated students)",
            },
            {
              q: "How does scheduling and payment work?",
              a: "Time slots can be secured on a weekly recurring basis by snagging any open and available slot at the time of inquiry! Lessons are then payed for in advanced on a monthly basis, with invoices sent out on the first of the month - or the date of your first real lesson (after the intro) prorated to the end of that month.",
            },
            {
              q: "Will there be recitals?",
              a: "Yes! That is my plan at least, if I can get enough interest I would love to host a recital at the end of each year",
            },
          ]}
        />


        {/* Contact */}
        <section id="contact" className="scroll-mt-16 section">
          <div className="container-6xl mx-auto">
            <h2 className="section-title">Get in Touch</h2>
            <p className="mt-2 text-slate-300 max-w-prose">
              Questions, availability, or just curious if lessons are a fit? Send a note below or grab a slot on my calendar. I would love to hear from you!
            </p>

            <div className="mt-8 grid md:grid-cols-2 gap-10">
              {/* Netlify form (no backend needed). Enable on Netlify by turning on form handling. */}
              <form
                name="contact"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                className="card p-6"
                onSubmit={handleContactSubmit}
              >
                {/* Honeypot field (hidden from users) */}
                <input type="hidden" name="form-name" value="contact" /> 
                  <p className="hidden"> 
                    <label> Don’t fill this out: <input name="bot-field" />  
                    </label> 
                  </p> 
                <div className="grid sm:grid-cols-2 gap-4"> 
                  <div> 
                    <label className="text-sm text-slate-300">Name</label> 
                    <input name="name" required className="field" /> 
                  </div> 
                  <div> 
                    <label className="text-sm text-slate-300">Email</label> 
                    <input name="email" type="email" required className="field" /> 
                  </div> 
                  <div className="sm:col-span-2"> 
                    <label className="text-sm text-slate-300">Message</label> 
                    <textarea name="message" rows={5} className="field" /> 
                  </div> 
                </div>

                <button type="submit" className="btn text-white btn-primary mt-4" disabled={submitting}>
                  {submitting ? "Sending…" : <>Get in touch! <Mail className="size-4" /></>}
                </button>
              </form>


              {/* Calendly embed (optional). Replace data-url with your Calendly link */}
              <div className="card p-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-5" style={{ color: "var(--brand-primary)" }} />
                  <h3 className="text-xl font-semibold">Book a Free Intro</h3>
                </div>
                <p className="mt-2 text-sm text-slate-300">Choose a time that works for you.</p>
                <div className="mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10">
                  {/* Calendly Inline Embed:
                  <iframe
                    title="Book with South Hill Music Lessons"
                    src="https://calendly.com/YOUR-USERNAME/intro-lesson?hide_gdpr_banner=1"
                    width="100%" height="100%" frameBorder="0"
                  /> */}
                  <div className="h-full w-full grid place-items-center text-slate-400 text-sm">
                    Add your Calendly link to enable booking.
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-300 space-y-1">
                  <p className="flex items-center gap-2"><Phone className="size-4" /> (732) 850-2074</p>
                  <p className="flex items-center gap-2"><Mail className="size-4" /> lessons@southhillmusic.com</p>
                  <p className="flex items-center gap-2"><MapPin className="size-4" /> South Hill • Spokane, WA</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10">
          <div className="container-6xl mx-auto py-10 text-sm text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
            <p>© 2025 South Hill Music Lessons. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#about" className="hover:text-white">About</a>
              <a href="#lessons" className="hover:text-white">Lessons</a>
              <a href="#pricing" className="hover:text-white">Pricing</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </div>
          </div>
        </footer>

        {/* Thank-you Modal */}
        {showThanks && (
          <div
            className="fixed inset-0 z-[100] grid place-items-center bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="thanks-title"
          >
            <div className="w-[min(92vw,560px)] rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
              <h3 id="thanks-title" className="text-xl font-semibold">
                Thanks—your message is on its way!
              </h3>
              <p className="mt-3 text-slate-200 leading-relaxed">
                Your email has been sent! I will get back to you as soon as I am able, looking forward to chatting!
                <br /><br />— Michael
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  ref={modalCloseBtnRef}
                  className="btn btn-primary"
                  onClick={() => setShowThanks(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}
