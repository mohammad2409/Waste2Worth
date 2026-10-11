
import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { supabase } from "./lib/supabase.js";

import Requests from "./pages/Requests.jsx";
import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore.jsx";
import AddItem from "./pages/AddItem.jsx";
import EditItem from "./pages/EditItem.jsx";
import MyListings from "./pages/MyListings.jsx";
import About from "./pages/About.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import Login from "./pages/Login.jsx";

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fbf8]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
        <p className="mt-4 font-medium text-emerald-800">
          Loading Waste2Worth...
        </p>
      </div>
    </main>
  );
}

function ProtectedRoute({ user, loading, children }) {
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}

function PublicOnlyLogin({ user, loading }) {
  if (loading) return <LoadingScreen />;

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <Login />;
}

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f8fbf8] px-5 text-center">
      <h1 className="text-5xl font-black text-emerald-800">
        404
      </h1>

      <p className="mt-3 text-lg text-slate-600">
        Oops! This page could not be found.
      </p>

      <a
        href="/home"
        className="mt-6 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
      >
        Back to Home
      </a>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("Unable to load session:", error.message);
      }

      setUser(data?.session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const protectedPage = (page) => (
    <ProtectedRoute user={user} loading={loading}>
      {page}
    </ProtectedRoute>
  );

  return (
    <Routes>
      {/* Public pages: visitors can browse without logging in */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/about" element={<About />} />
      <Route path="/how-it-works" element={<HowItWorks />} />

      {/* Authentication */}
      <Route
        path="/login"
        element={<PublicOnlyLogin user={user} loading={loading} />}
      />

      {/* Login required */}
      <Route
        path="/add-item"
        element={protectedPage(<AddItem />)}
      />
      <Route
        path="/edit-item/:id"
        element={protectedPage(<EditItem />)}
      />
      <Route
        path="/my-listings"
        element={protectedPage(<MyListings />)}
      />
      <Route
        path="/requests"
        element={protectedPage(<Requests />)}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;