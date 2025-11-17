import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { Coins, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    setLocalUser(stored ? JSON.parse(stored) : null);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        localStorage.removeItem("user");
        setLocalUser(null);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("user");
    setLocalUser(null);
    await signOut(auth);
  };

  return (
    <nav className="w-full bg-[#0A0D1F] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          🏀 <span>NBA Viktorīna</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-8 text-lg font-medium items-center">
          <Link className="hover:text-yellow-400" to="/">Sākums</Link>
          <Link className="hover:text-yellow-400" to="/quiz-start">Viktorīna</Link>
          <Link className="hover:text-yellow-400" to="/leaderboard">Līderi</Link>
          <Link className="hover:text-yellow-400" to="/achievements">Tituli</Link>
          <Link className="hover:text-yellow-400" to="/store">Veikals</Link>
          <Link className="hover:text-yellow-400" to="/profile">Profils</Link>
          <Link className="hover:text-yellow-400" to="/friends">Draugi</Link>

          {/* --- FIXED DROPDOWN --- */}
     <div className="relative group cursor-pointer select-none">

  <div className="flex items-center gap-1 hover:text-yellow-400">
    <Coins size={18} className="text-yellow-400" />
    Iegūt
    <ChevronDown 
      size={16}
      className="opacity-70 transition-transform duration-200 group-hover:rotate-180"
    />
  </div>

  {/* DROPDOWN */}
  <div className="
      absolute left-0 top-full mt-0 
      hidden group-hover:flex flex-col
      bg-[#111529] border border-white/10 rounded-lg shadow-lg 
      w-40 py-1 z-50 transition-all duration-150
    ">
    <Link className="px-4 py-2 hover:bg-white/10" to="/packs">🎁 Pakas</Link>
    <Link className="px-4 py-2 hover:bg-white/10" to="/daily">🎁 Dienas balvas</Link>
  </div>

</div>



          {localUser ? (
            <button
              onClick={handleLogout}
              className="
                ml-4 px-5 py-2 
                bg-gradient-to-r from-red-500 to-red-600
                text-white font-semibold 
                rounded-xl shadow-lg
                hover:scale-105 hover:shadow-[0_0_12px_rgba(255,50,50,0.6)]
                transition-all duration-200
              "
            >
              Iziet
            </button>
          ) : (
            <Link
              to="/login"
              className="
                ml-4 px-5 py-2 
                bg-gradient-to-r from-yellow-400 to-orange-500 
                text-black font-semibold 
                rounded-xl shadow-md
                hover:scale-105 hover:shadow-[0_0_12px_rgba(255,200,40,0.7)]
                transition-all duration-200
              "
            >
              Pieslēgties
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0A0D1F] border-t border-white/10 flex flex-col p-4 text-center gap-4 text-lg">
          
          <Link onClick={() => setOpen(false)} to="/">Sākums</Link>
          <Link onClick={() => setOpen(false)} to="/quiz-start">Viktorīna</Link>
          <Link onClick={() => setOpen(false)} to="/leaderboard">Līderi</Link>
          <Link onClick={() => setOpen(false)} to="/achievements">Tituli</Link>
          <Link onClick={() => setOpen(false)} to="/store">Veikals</Link>
          <Link onClick={() => setOpen(false)} to="/profile">Profils</Link>
          <Link onClick={() => setOpen(false)} to="/friends">Draugi</Link>

          {/* Mobile dropdown */}
          <div className="flex flex-col gap-2 bg-black/20 p-2 rounded-lg">
            <div className="text-white/70 text-sm">🪙 Iegūt</div>
            <Link onClick={() => setOpen(false)} to="/packs">🎁 Pakas</Link>
            <Link onClick={() => setOpen(false)} to="/daily">🎁 Dienas balvas</Link>
          </div>

          {localUser ? (
            <button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="
                px-5 py-2 
                bg-gradient-to-r from-red-500 to-red-600
                text-white font-semibold 
                rounded-xl shadow-lg
                hover:bg-red-500/90
                transition-all
              "
            >
              Iziet
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="
                px-5 py-2 
                bg-gradient-to-r from-yellow-400 to-orange-500
                text-black font-semibold 
                rounded-xl shadow-lg
                hover:scale-105
                transition-all
              "
            >
              Pieslēgties
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
