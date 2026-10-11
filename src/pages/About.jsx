
import { Link } from "react-router-dom";
import { ArrowLeft, Leaf, HeartHandshake, Recycle, Users } from "lucide-react";

export default function About() {
  return (
    <main className="min-h-screen bg-[#f8fbf8] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/home" className="inline-flex items-center gap-2 font-bold text-brand-700">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <section className="mt-10 rounded-[2rem] bg-brand-900 px-7 py-12 text-white sm:px-12 sm:py-16">
          <Leaf size={40} className="text-emerald-300" />
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-emerald-200">About Waste2Worth</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Waste less. Share more. Create worth.
          </h1>
          <p className="mt-6 max-w-2xl leading-8 text-emerald-50/80">
            Waste2Worth is a community resource exchange platform designed to
            help people donate, exchange, and discover usable items instead
            of throwing them away.
          </p>
        </section>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            { icon: Recycle, title: "Reduce waste", text: "Keep useful items out of the waste stream." },
            { icon: HeartHandshake, title: "Help people", text: "Make useful resources easier to access." },
            { icon: Users, title: "Build community", text: "Connect people through sharing and reuse." },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-3xl border border-slate-100 bg-white p-6">
              <Icon size={28} className="text-brand-600" />
              <h2 className="mt-5 text-xl font-extrabold text-brand-900">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-brand-100 bg-white p-7 sm:p-10">
          <h2 className="text-2xl font-extrabold text-brand-900">Our vision</h2>
          <p className="mt-4 leading-8 text-slate-600">
            We want to make sharing a simple everyday habit. A book, a chair,
            a device, or a household item can be useful to someone else even
            when its current owner no longer needs it.
          </p>
          <Link to="/explore" className="mt-6 inline-flex items-center rounded-xl bg-brand-600 px-5 py-3 font-bold text-white">
            Explore items
          </Link>
        </div>
      </div>
    </main>
  );
}