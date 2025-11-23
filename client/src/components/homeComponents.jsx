import { useState } from "react";
import { Link } from "react-router-dom";
import clublogo from "../assets/Club_logo_white.png";
import backdrop from "../assets/backdrop.png";
import arrow from "../assets/arrow.svg";
import clublogofooter from "../assets/Club_logo_black.png";
import instagram from "../assets/instagram.svg";
import linkedin from "../assets/linkedin.svg";
/* ---------------- NAVBAR ---------------- */

export function Navbar() {
  return (
    <header className="w-full bg-[#000000] px-4 md:px-16 py-3 h-24 flex items-center justify-between">
      <div className="">
        <img
          src={clublogo}
          alt="Club Logo"
          className="h-30 w-auto"
        />
      </div>
      <div className="font-source font-bold text-3xl text-white/90">
        Leetcode Contest
      </div>
      <div className="flex gap-4">
        {/* SIGNUP BUTTON */}
        <Link
          to="/signup"
          className="h-[45px] px-4 rounded-lg font-semibold text-sm md:text-base 
                   bg-transparent text-white/90
                   hover:bg-white hover:text-black transition-colors duration-300
                   flex items-center justify-center"
        >
          <span className="relative z-10">Sign up</span>
        </Link>

        {/* LOGIN BUTTON */}
        <Link
          to="/login"
          className="h-[45px] px-4 rounded-lg bg-transparent font-semibold text-sm md:text-base 
           text-white/90 
           hover:bg-white hover:text-black hover:border-white transition-colors duration-300
           flex items-center justify-center"
        >
          Login
        </Link>
      </div>
    </header>
  );
}

//* ---------------- HERO SECTION ---------------- */

export function HeroSection() {
  return (
    // Add a wrapper div with overflow-hidden
    <div className="relative overflow-hidden">
      {/* LEFT CORNER PATTERN */}
      <img
        src={backdrop}
        alt=""
        className="absolute -left-8 inset-y-0 h-64 w-auto opacity-50 select-none z-0 rotate-12
             hidden sm:block"
      />
      <img
        src={backdrop}
        alt=""
        className="absolute -left-8 inset-y-60 h-64 w-auto opacity-50 select-none z-0 -rotate-12
             hidden sm:block"
      />
      <img
        src={backdrop}
        alt=""
        className="absolute -left-8 inset-y-120 h-64 w-auto opacity-50 select-none z-0 rotate-12
             hidden sm:block"
      />

      {/* right CORNER PATTERN */}
      <img
        src={backdrop}
        alt=""
        className="absolute -right-8 inset-y-0 h-64 w-auto opacity-50 select-none z-0 -rotate-12
             hidden sm:block"
      />
      <img
        src={backdrop}
        alt=""
        className="absolute -right-8 inset-y-60 h-64 w-auto opacity-50 select-none z-0 rotate-12
             hidden sm:block"
      />
      <img
        src={backdrop}
        alt=""
        className="absolute -right-8 inset-y-120 h-64 w-auto opacity-50 select-none z-0 -rotate-12
             hidden sm:block"
      />

      {/* The rest of your content starts here: */}
      <h1 className="relative z-10 text-6xl font-stack-notch font-semibold text-[#8d83ff] leading-tight pb-4">
        {/* ... */}
      </h1>
      {/* main heading */}
      <div className="text-center pt-24 pb-16">
        <h1 className=" text-6xl font-stack-notch font-semibold text-[#8d83ff] leading-tight pb-4">
          Master DSA &amp; Ace Your
          <br />
          Interviews
        </h1>

        <p className="text-2xl md:text-lg font-source italic text-slate-100/90 pb-16">
          Join the ultimate 7-week LeetCode challenge designed to prepare you
          for top tech interviews.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* PRIMARY BUTTON: Amber Filled -> White Filled (Hover) */}
          <Link
            to="/signup"
            className="btn-hover px-6 py-3 rounded-xl font-bold text-sm md:text-base 
                   bg-[#1D1E20] text-white
                   hover:bg-white hover:text-black transition-colors duration-200"
          >
            <span className="relative z-10 font-roboto font-bold text-lg">
              Register Now -{" "}
              <span className="font-roboto font-bold text-lg">₹199</span>
            </span>
          </Link>

          {/* SECONDARY BUTTON: White Filled -> Transparent/Outline (Hover) */}
          <Link
            to="/rules"
            className="btn-hover px-6 py-3 rounded-xl font-bold text-sm md:text-base 
                   bg-[#1D1E20] text-white
                   hover:bg-white hover:text-black transition-colors duration-200"
          >
            <span className="relative z-10">Rules</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 7-WEEK ROADMAP SECTION ---------------- */

const ROADMAP_WEEKS = [
  { week: 1, title: "Arrays & Strings" },
  { week: 2, title: "Linked Lists" },
  { week: 3, title: "Stacks & Queues" },
  { week: 4, title: "Trees & Graphs" },
  { week: 5, title: "Dynamic Programming" },
  { week: 6, title: "Greedy & Backtracking" },
  { week: 7, title: "Advanced Topics" },
];

export function RoadmapSection() {
  return (
    <section className="md:px-16 px-14 my-20">
      <h2 className="font-roboto text-4xl text-black font-extrabold mb-8 text-center letter-spacing-1 tracking-widest">
        7-Week DSA Roadmap
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {ROADMAP_WEEKS.map((i) => (
          <WeekCard key={i.week} week={i.week} title={i.title} />
        ))}
      </div>
    </section>
  );
}

function WeekCard({ week, title }) {
  return (
    <div className="bg-[#e5e4f5] rounded-2xl p-5 border border-[#b3b9f5]  text-[#673de6]">
      <div>
        <div className="font-bold font-dm-sans text-black text-lg">
          Week {week}
        </div>
      </div>
      <p className="mt-3 font-medium md:text-base">{title}</p>
    </div>
  );
}

/* ---------------- WHY PARTICIPATE SECTION ---------------- */

/* ---------------- WHY PARTICIPATE SECTION (lucide-react) ---------------- */

import { Award, BookOpen, Users } from "lucide-react";

export function WhyParticipate() {
  const features = [
    {
      icon: <Award size={42} className="text-[#673de6]" />,
      title: "Compete & Win",
      desc: "Climb the global leaderboard and showcase your skills.",
    },
    {
      icon: <BookOpen size={42} className="text-[#673de6]" />,
      title: "Structured Learning",
      desc: "Follow a curated 7-week roadmap covering essential DSA topics.",
    },
    {
      icon: <Users size={42} className="text-[#673de6]" />,
      title: "Community Support",
      desc: "Learn together with peers and stay motivated throughout the journey.",
    },
  ];

  return (
    <section className="px-8 md:px-16 py-16 bg-black my-20 mx-12 rounded-3xl">
      <h2 className="font-display text-3xl text-white font-bold mb-8 text-center">
        Why Participate?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((item, index) => (
          <div
            key={index}
            className="bg-black rounded-2xl p-6 text-center border border-white/10 hover:bg-white/5 transition"
          >
            <div className="flex justify-center mb-3">{item.icon}</div>

            <h3 className="text-lg text-white font-roboto mb-2">
              {item.title}
            </h3>

            <p className="text-sm md:text-[15px] font-dm-sans text-white">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FAQ SECTION ---------------- */

export function FAQSection() {
  const FAQ_ITEMS = [
    {
      question: "What is the contest duration?",
      answer: "The contest runs for 7 weeks with weekly DSA topics.",
    },
    {
      question: "How is the leaderboard calculated?",
      answer: "It is based on problems solved, difficulty, and consistency.",
    },
    {
      question: "Can I access previous weeks?",
      answer: "Yes, but weekly contests are time-bound.",
    },
    {
      question: "What’s the registration fee?",
      answer: "The registration fee is ₹199 for full 7-week access.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="px-4 md:px-16 my-20">
      <h2 className="font-display text-3xl text-black font-medium font-roboto mb-8 text-center gap-1">
        Frequently Asked Questions
      </h2>

      <div className="max-w-5xl mx-auto flex flex-col gap-3">
        {FAQ_ITEMS.map((item, index) => (
          <FAQItem
            key={index}
            index={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            toggle={toggle}
          />
        ))}
      </div>
    </section>
  );
}

function FAQItem({ index, question, answer, isOpen, toggle }) {
  return (
    <div
      onClick={() => toggle(index)}
      className=" white rounded-xl px-4 py-3 border border-[#b3b9f5] cursor-pointer duration-30 transition hover:bg-[#e5e4f5]"
    >
      {/* Question row */}
      <div className="flex items-center justify-between gap-3 p-1 ">
        <p className="m-0 text-sm md:text-[15px] font-medium text-black flex-1">
          {question}
        </p>
        <img
          src={arrow}
          alt="arrow"
          className={`w-8 h-8 shrink-0 transition-transform duration-400 ${
            isOpen ? "rotate-270" : "rotate-90"
          }`}
        />
      </div>

      {/* Answer */}
      {isOpen && (
        <p className="mt-2 text-xs md:text-sm text-black leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

// src/components/Footer.jsx  (or place into your homeComponents.jsx export)
export function Footer() {
  return (
    <footer className="bg-[#e5e4f5] text-black py-4 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top row: logo (left) + social icons (right) */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: logo + club name */}
          <div className="flex items-center gap-4">
            {/* Example local image path (replace with your actual logo file in public/) */}
            <img
              src={clublogofooter}
              alt="Tech Club logo"
              className="w-20 h-20 object-contain rounded-md ml-2"
            />
          </div>

          {/* Right: social icons (clickable) */}
          <div className="flex items-center gap-3">
            {/* Replace href and src values with your real social URLs and icon files */}

            <a
              href="https://www.instagram.com/techclub.woxsen/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={instagram}
                alt="Instagram"
                className="w-5 h-5 object-contain"
              />
            </a>

            <a
              href="https://www.linkedin.com/company/woxsen-technology-club/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={linkedin}
                alt="LinkedIn"
                className="w-5 h-5 object-contain"
              />
            </a>

            {/* add/remove social icons as needed */}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-black/10 pb-3" />

        {/* Bottom centered reserved rights */}
        <div className="text-center text-sm md:text-base text-black/80">
          &copy; {new Date().getFullYear()} Tech Club. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
