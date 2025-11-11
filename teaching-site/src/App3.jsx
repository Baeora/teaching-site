import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Music, CalendarDays, Mail, Phone, MapPin, ChevronRight } from "lucide-react";

// Uses semantic classes defined in src/theme.css (Tailwind v4)
// See theme.css for tokens (brand colors) and component class definitions.

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "lessons", label: "Lessons" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
];

export default function App() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.6 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="">
      {/* Top Nav */}
      <header className="">
        <nav className="">
          <a href="#home" className="">
            <Music className="" />
            <span>South Hill Music Lessons</span>
          </a>
          <ul className="">
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
          <a href="#contact" className="">Book a Lesson</a>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="">
        <div className="">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className=""
          >
            <div>
              <p className="">Spokane • South Hill • Private Music Lessons</p>
              <h1 className="">
                Learn Guitar & Music Theory
                <span className="" style={{ color: "var(--brand-primary)" }}>
                  with Patient, Personalized Lessons
                </span>
              </h1>
              <p className="">
                I have been teaching my entire life, whether that be teaching myself how to play music, 
                studying education at Rutgers University, or working with students 1 on 1 for over 5 years 
                after studying songwriting in Boston, MA at Berklee College of Music; I really believe it is in my blood.

                <br></br>
                <br></br>
                
                My goal with this business is to provide incredibly high quality music lessons 
                at an affordable price to a community that has accepted me with open arms 
                since moving here last year.

                <br></br>
                <br></br>

                I would love for you or your child to be one of my students!</p>
              <div className="">
                <a href="#pricing" className="">
                  See Pricing <ChevronRight className="" />
                </a>
                <a href="#lessons" className="">
                  What You'll Learn
                </a>
              </div>
            </div>
            
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="">
        <div className="">
          <div className="">
            <div>
              <h2 className="">About Your Teacher</h2>
              <p className="">Friendly, flexible, and focused on your goals.</p>
              <div className="">
              <div className="" style={{ background: "color-mix(in oklab, var(--brand-primary) 20%, transparent)", filter: "blur(36px)", borderRadius: "9999px" }} aria-hidden />
              <div className="">
                {/* Simple SVG illustration with brand gradient */}
                <div className="">
                  {/* Profile card with circular image + blurb */}
                  <div className="">
                    {/* Top row: avatar (left) + blurb (right) */}
                    <div className="">
                      {/* Avatar height = 33% of card height. The enclosing row is h-1/3, so this fills it. */}
                      <img
                        src="src\assets\headshot.jpg"      
                        alt="Michael Skriloff - Music Teacher"
                        className=""
                      />

                      {/* Blurb area */}
                      <div>
                        <h3 className="">Hi! I’m Michael</h3>
                        <p className="">
                          I grew up in the suburbs of Edison, New Jersey and surprisingly I did not really get into music until I was ~17. Prior to that I was very interested in computer science, but after landing my first job I decided I wanted a different life. Using the money, I bought my first guitar, and taught myself how to play it via YouTube - the rest is history. I started writing songs, got accepted into music school and ended up teaching 1 on 1 for 5 years in the greater Boston Area. 
                          {/* ↑ Edit this paragraph with your real upbringing blurb */}
                        </p>
                      </div>
                    </div>

                    {/* Optional: subtle separator */}
                    <div className="" />

                    {/* Optional: keep a decorative gradient strip or any extra content below */}
                    {/* <div className="mt-4 grid gap-3">
                      <div className="h-3 rounded-full" style={{ background: 'linear-gradient(90deg,#43b1cb,#ffb935)' }} />
                      <p className="text-sm text-slate-400">
                        Lessons available in-person on South Hill or online. Flexible scheduling.
                      </p>
                    </div> */}
                  </div>
                </div>

              </div>
            </div>
            </div>
            {/* <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Patient Coaching",
                  body: "Step-by-step guidance with clear practice plans so you always know what to do next.",
                },
                {
                  title: "Song‑First Lessons",
                  body: "Technique and theory taught through music you enjoy—so practice stays fun.",
                },
                {
                  title: "For All Levels",
                  body: "From first chords to advanced fretboard fluency, customized to your pace.",
                },
                {
                  title: "South Hill Studio",
                  body: "In‑person on Spokane’s South Hill or live online—your choice.",
                },
              ].map((c) => (
                <div key={c.title} className="card p-6">
                  <h3 className="font-semibold text-lg">{c.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{c.body}</p>
                </div>
              ))}
            </div> */} 
          </div>
        </div>
      </section>

      {/* Full‑width image spacer (~40vh) */}
      <section aria-label="Showcase Image" className="">
        <div
          className=""
          style={{ backgroundImage: "url('/your-wide-image.jpg')" }}
        >
          <div className="" />
        </div>
      </section>

      {/* Lessons */}
      <section id="lessons" className="">
        <div className="">
          <div className="">
            <CalendarDays className="" style={{ color: "var(--brand-primary)" }} />
            <h2 className="">What You'll Learn</h2>
          </div>
          <div className="">
            {[
              {
                title: "Foundations",
                pts: ["Posture & Picking", "Clean Chords", "Rhythm & Timing"],
              },
              {
                title: "Musicality",
                pts: ["Scales & Fretboard", "Chord Progressions", "Improvisation"],
              },
              {
                title: "Studio Skills",
                pts: ["Practice Systems", "Playing with a Click", "Recording Basics"],
              },
            ].map((card) => (
              <div key={card.title} className="">
                <h3 className="">{card.title}</h3>
                <ul className="">
                  {card.pts.map((pt) => (
                    <li key={pt} className="">
                      <span className="" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="">
        <div className="">
          <h2 className="">Pricing</h2>
          <p className="">Straightforward options for weekly lessons or flexible scheduling.</p>

          <div className="">
            {[
              {
                name: "Starter",
                price: "$30",
                dur: "30 minutes",
                features: ["Perfect for kids", "Focused skills", "Song of your choice"],
              },
              {
                name: "Standard",
                price: "$45",
                dur: "45 minutes",
                features: ["Most popular", "Technique + theory", "Practice plan"],
                highlighted: true,
              },
              {
                name: "Deep Dive",
                price: "$60",
                dur: "60 minutes",
                features: ["Advanced topics", "Improvisation & recording", "Custom curriculum"],
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`card p-6 ${tier.highlighted ? "highlight" : ""}`}
              >
                {tier.highlighted && (
                  <span className="absolute -mt-5 ml-6 text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "var(--brand-primary)", color: "#0f172a" }}>
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
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-16 section">
        <div className="container-6xl">
          <h2 className="section-title">Get in Touch</h2>
          <p className="mt-2 text-slate-300 max-w-prose">
            Questions, availability, or just curious if lessons are a fit? Send a note below or grab a slot on my calendar.
          </p>

          <div className="mt-8 grid md:grid-cols-2 gap-10">
            {/* Netlify form (no backend needed). Enable on Netlify by turning on form handling. */}
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              className="card p-6"
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden">
                <label>
                  Don’t fill this out: <input name="bot-field" />
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
              <button type="submit" className="btn btn-primary mt-4">
                Send Message <Mail className="size-4" />
              </button>
              <p className="mt-3 text-xs text-slate-400">This form uses Netlify Forms—no server needed.</p>
            </form>

            {/* Calendly embed (optional). Replace data-url with your Calendly link */}
            <div className="card p-6">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-5" style={{ color: "var(--brand-primary)" }} />
                <h3 className="text-xl font-semibold">Book a Free Intro</h3>
              </div>
              <p className="mt-2 text-sm text-slate-300">Choose a time that works for you.</p>
              <div className="mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10">
                {/* Calendly Inline Embed */}
                {/* 1) Add this script to index.html <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script> */}
                {/* 2) Then uncomment the iframe below and set your scheduling link */}
                {/* <iframe
                  title="Book with South Hill Music Lessons"
                  src="https://calendly.com/YOUR-USERNAME/intro-lesson?hide_gdpr_banner=1"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                /> */}
                <div className="h-full w-full grid place-items-center text-slate-400 text-sm">
                  Add your Calendly link to enable booking.
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-300 space-y-1">
                <p className="flex items-center gap-2"><Phone className="size-4" /> (509) 555‑0123</p>
                <p className="flex items-center gap-2"><Mail className="size-4" /> hello@southhillmusic.com</p>
                <p className="flex items-center gap-2"><MapPin className="size-4" /> South Hill • Spokane, WA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container-6xl py-10 text-sm text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} South Hill Music Lessons. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#about" className="hover:text-white">About</a>
            <a href="#lessons" className="hover:text-white">Lessons</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
