
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, Search, HandHeart, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Share an item",
    text: "Create a listing with its name, condition, category, location, and a clear photo.",
  },
  {
    number: "02",
    icon: Search,
    title: "Discover what you need",
    text: "Search for available items and filter by category to find useful things nearby.",
  },
  {
    number: "03",
    icon: HandHeart,
    title: "Connect and arrange",
    text: "Contact the other member and agree on a convenient, safe handover.",
  },
];

export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-[#f8fbf8] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/home" className="inline-flex items-center gap-2 font-bold text-brand-700">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="mt-10 text-center">
          <p className="text-sm font-extrabold uppercase tracking-widest text-brand-600">The process</p>
          <h1 className="mt-3 text-4xl font-extrabold text-brand-900 sm:text-5xl">How Waste2Worth works</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            A simple way to give usable items a second life through donations and exchanges.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ number, icon: Icon, title, text }) => (
            <article key={number} className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold tracking-widest text-brand-600">STEP {number}</span>
                <span className="rounded-2xl bg-brand-50 p-3 text-brand-700"><Icon size={24} /></span>
              </div>
              <h2 className="mt-7 text-xl font-extrabold text-brand-900">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-brand-100 bg-white p-7 sm:p-9">
          <ShieldCheck size={32} className="text-brand-600" />
          <h2 className="mt-4 text-2xl font-extrabold text-brand-900">Keep exchanges safe</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-600">
            <li>Meet in a public place whenever possible.</li>
            <li>Check the item's condition before accepting it.</li>
            <li>Never share passwords, OTPs, or sensitive financial details.</li>
            <li>Report suspicious listings or behavior when reporting is available.</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link to="/explore" className="inline-flex rounded-xl bg-brand-600 px-6 py-3.5 font-bold text-white">
            Start exploring
          </Link>
        </div>
      </div>
    </main>
  );
}