// src/pages/Friends.jsx

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  getUserData,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from "../services/firebase";

import { motion } from "framer-motion";

export default function Friends() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI states
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const [friendsProfiles, setFriendsProfiles] = useState([]);

  // Load auth + user data
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        const d = await getUserData(u.uid);
        setUserData({ ...d, id: u.uid });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Load friends profiles
  useEffect(() => {
    const loadFriends = async () => {
      if (!userData?.friends?.length) {
        setFriendsProfiles([]);
        return;
      }
      const arr = [];
      for (const friendUid of userData.friends) {
        const d = await getUserData(friendUid);
        if (d) arr.push({ id: friendUid, ...d });
      }
      setFriendsProfiles(arr);
    };
    loadFriends();
  }, [userData?.friends]);

  const refresh = async () => {
    if (!firebaseUser) return;
    const fresh = await getUserData(firebaseUser.uid);
    setUserData({ ...fresh, id: firebaseUser.uid });
  };

  const handleSend = async () => {
    setErrorMsg("");
    setInfoMsg("");

    const code = friendCodeInput.trim().toUpperCase();
    if (!code) {
      setErrorMsg("Ievadi friend code.");
      return;
    }

    const res = await sendFriendRequest(userData.id, code);
    if (!res.ok) {
      const r = res.reason;
      const errors = {
        not_found: "Šāds friend code netika atrasts.",
        self_request: "Nevari pievienot pats sevi 😅",
        already_friends: "Jūs jau esat draugi.",
        already_sent: "Pieprasījums jau ir nosūtīts.",
      };
      setErrorMsg(errors[r] || "Neizdevās nosūtīt pieprasījumu.");
    } else {
      setInfoMsg("Pieprasījums nosūtīts!");
      setFriendCodeInput("");
      refresh();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(userData.friendCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const incoming = userData?.friendRequests?.incoming || [];
  const outgoing = userData?.friendRequests?.outgoing || [];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-yellow-300">
        Loading...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <div className="bg-slate-900 p-10 rounded-xl text-center">
          <h2 className="text-xl font-bold mb-4">Friend Arena requires login</h2>
          <a
            href="/login"
            className="px-4 py-2 bg-yellow-400 text-black rounded-xl"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 px-4 py-10 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-950/85 max-w-4xl w-full p-8 rounded-3xl border border-yellow-400/40 shadow-xl text-white"
      >
        <h1 className="text-3xl font-extrabold text-center mb-2">
          👥 Friend Arena
        </h1>
        <p className="text-center text-slate-300 mb-6 text-sm">
          Pievieno draugus ar friend code un sacenties leaderboardā.
        </p>

        {/* ================= FRIEND CODE ================= */}
        <div className="mb-8 bg-slate-900/70 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs text-slate-400">Tavs friend code:</p>
            <p className="text-3xl font-mono font-bold text-yellow-300 tracking-widest">
              {userData.friendCode}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="px-5 py-2 bg-yellow-400 text-black rounded-xl font-bold hover:bg-yellow-300"
          >
            {copied ? "✔ Copied!" : "📋 Copy"}
          </button>
        </div>

        {/* ================= ADD FRIEND ================= */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-bold mb-2">➕ Pievienot draugu</h2>
          <p className="text-xs text-slate-400 mb-3">
            Ievadi drauga friend code (piem. <b>ABC123</b>).
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={friendCodeInput}
              onChange={(e) => setFriendCodeInput(e.target.value)}
              placeholder="Friend code..."
              className="flex-1 bg-slate-950/70 border border-slate-700 px-4 py-2 rounded-xl text-sm outline-none focus:border-yellow-400"
            />

            <button
              onClick={handleSend}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-semibold"
            >
              Sūtīt
            </button>
          </div>

          {errorMsg && (
            <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
          )}
          {infoMsg && (
            <p className="text-emerald-400 text-xs mt-2">{infoMsg}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* ===== Incoming ===== */}
          <div>
            <h3 className="text-lg font-semibold mb-2">📥 Ienākošie</h3>

            {incoming.length === 0 ? (
              <p className="text-xs text-slate-500">Nav pieprasījumu.</p>
            ) : (
              incoming.map((uid) => (
                <IncomingRequest
                  key={uid}
                  uid={uid}
                  accept={async () => {
                    await acceptFriendRequest(userData.id, uid);
                    refresh();
                  }}
                  decline={async () => {
                    await declineFriendRequest(userData.id, uid);
                    refresh();
                  }}
                />
              ))
            )}
          </div>

          {/* ===== Outgoing ===== */}
          <div>
            <h3 className="text-lg font-semibold mb-2">📤 Nosūtītie</h3>

            {outgoing.length === 0 ? (
              <p className="text-xs text-slate-500">Nav nosūtītu pieprasījumu.</p>
            ) : (
              outgoing.map((uid) => <OutgoingRequest key={uid} uid={uid} />)
            )}
          </div>
        </div>

        {/* ================= FRIEND LIST ================= */}
        <div className="mt-10">
          <h3 className="text-xl font-bold text-yellow-300 mb-3">👑 Tavi draugi</h3>

          {friendsProfiles.length === 0 ? (
            <p className="text-slate-400 text-sm">
              Vēl nav draugu. Nosūti kādam friend requestu!
            </p>
          ) : (
            friendsProfiles.map((f) => (
              <FriendRow
                key={f.id}
                user={f}
                remove={async () => {
                  await removeFriend(userData.id, f.id);
                  refresh();
                }}
              />
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ===========================================================
   COMPONENTS
=========================================================== */

function IncomingRequest({ uid, accept, decline }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getUserData(uid).then((d) => d && setProfile({ id: uid, ...d }));
  }, [uid]);

  if (!profile) return null;

  const bestScore = profile.history?.length
    ? Math.max(...profile.history.map((h) => h.score || 0))
    : 0;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
      <Avatar user={profile} />

      <div className="flex-1">
        <p className="font-semibold text-sm">{profile.name || profile.email}</p>
        <p className="text-[11px] text-slate-400">
          Level {profile.level || 1} • Best {bestScore}
        </p>
      </div>

      <button
        onClick={accept}
        className="px-3 py-1 bg-emerald-500 text-black rounded-lg text-xs hover:bg-emerald-400"
      >
        Accept
      </button>

      <button
        onClick={decline}
        className="px-3 py-1 bg-slate-700 text-white rounded-lg text-xs hover:bg-slate-600"
      >
        Decline
      </button>
    </div>
  );
}

function OutgoingRequest({ uid }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getUserData(uid).then((d) => d && setProfile({ id: uid, ...d }));
  }, [uid]);

  if (!profile) return null;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
      <Avatar user={profile} />
      <div className="flex-1">
        <p className="font-semibold text-sm">{profile.name || profile.email}</p>
        <p className="text-[11px] text-slate-400">Pending...</p>
      </div>
    </div>
  );
}

function FriendRow({ user, remove }) {
  const bestScore = user.history?.length
    ? Math.max(...user.history.map((h) => h.score || 0))
    : 0;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center gap-4 mb-2">
      <Avatar user={user} />
      <div className="flex-1">
        <p className="font-semibold text-sm">{user.name || user.email}</p>
        <p className="text-[11px] text-slate-400">
          Level {user.level || 1} • Best {bestScore}
        </p>
      </div>

      <button
        onClick={remove}
        className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-400"
      >
        Remove
      </button>
    </div>
  );
}

function Avatar({ user }) {
  return (
    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
      {user.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}
