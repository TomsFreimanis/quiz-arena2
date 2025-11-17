// src/pages/Profile.jsx

import { useState, useEffect } from "react";
import { auth, getUserData } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

import ProfileBadges from "../components/ProfileBadges";
import AvatarPicker from "../components/AvatarPicker";
import AvatarStore from "../components/AvatarStore";

import LevelUpPopup from "../components/LevelUpPopup";
import { getLevelReward } from "../utils/levelRewards";
import { getLevelProgress, getXpNeeded } from "../utils/level";

import { AVATARS } from "../utils/avatarList";

export default function Profile() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pendingReward, setPendingReward] = useState(null);

  // ======================
  // LOAD FIREBASE USER
  // ======================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        const d = await getUserData(user.uid);

        const level = d.level ?? 1;
        const xp = d.xp ?? 0;

        // check if level up reward exists
        if (xp >= getXpNeeded(level)) {
          const reward = getLevelReward(level);

          if (reward && !(d.rewardClaimed || []).includes(level)) {
            setPendingReward({ level, reward });
          }
        }

        setData({ ...d, id: user.uid });
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ======================
  // CLAIM LEVEL REWARD
  // ======================
  async function claimLevelReward() {
    if (!pendingReward) return;

    const { level, reward } = pendingReward;
    const userRef = doc(db, "users", data.id);

    await updateDoc(userRef, {
      coins: (data.coins ?? 0) + (reward.coins ?? 0),
      ownedAvatars: reward.avatar
        ? [...(data.ownedAvatars || []), reward.avatar]
        : data.ownedAvatars || [],
      rewardClaimed: [...(data.rewardClaimed || []), level],
    });

    setPendingReward(null);
    window.location.reload();
  }

  // ======================
  // LOADING SCREEN
  // ======================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 flex items-center justify-center">
        <p className="text-yellow-300 animate-pulse">Ielādē profilu...</p>
      </div>
    );
  }

  // ======================
  // NOT LOGGED IN
  // ======================
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 flex items-center justify-center">
        <div className="bg-slate-900/80 border border-yellow-500/40 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Profilam vajag pieteikties</h2>
          <a
            href="/login"
            className="inline-block px-5 py-2 bg-yellow-400 text-slate-900 font-semibold rounded-xl hover:bg-yellow-300"
          >
            🔑 Pieslēgties
          </a>
        </div>
      </div>
    );
  }

  // ======================
  // USER STATS
  // ======================
  const cosmetics = data?.cosmetics || {};
  const coins = data?.coins ?? 0;
  const points = data?.points ?? 0;
  const level = data?.level ?? 1;
  const xp = data?.xp ?? 0;
  const history = data?.history ?? [];

  // LEVEL BAR
  const progress = getLevelProgress(xp, level);

  // AVATAR
  const avatarId = data?.avatarId || "common1";
  const avatarObj = AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
  const avatarImg = avatarObj.url;

  // ======================
  // RENDER PAGE
  // ======================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 px-6 py-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-slate-950/85 border border-yellow-400/40 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.9)] p-8 max-w-3xl w-full text-white"
      >
        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={avatarImg}
            alt="avatar"
            className={`w-28 h-28 rounded-full border-4 object-cover shadow-xl ${
              cosmetics.frame_gold ? "border-yellow-400" : "border-slate-700"
            }`}
          />

          <h1 className="text-3xl font-extrabold mt-5">
            {firebaseUser.displayName || firebaseUser.email}
          </h1>

          <ProfileBadges cosmetics={cosmetics} />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <StatCard label="Punkti" value={points} color="text-purple-300" />
          <StatCard label="Monētas" value={coins} color="text-yellow-300" />
          <StatCard label="Līmenis" value={level} color="text-blue-300" />
          <StatCard label="XP" value={xp} color="text-emerald-300" />
        </div>

        {/* XP BAR */}
        <div className="w-full bg-slate-800 rounded-full h-3 mb-6 overflow-hidden">
          <div
            className="bg-yellow-400 h-full transition-all duration-500"
            style={{ width: `${progress.percent}%` }}
          ></div>
        </div>

        <p className="text-center text-xs text-slate-400 mb-8">
          {progress.current} / {progress.needed} XP līdz nākamajam līmenim
        </p>

        {/* USER AVATARS */}
        <AvatarPicker userData={data} />

        {/* STORE */}
        <div className="flex justify-center w-full">
          <AvatarStore userData={data} />
        </div>

        {/* HISTORY */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-yellow-300 mb-3">
            📜 Spēļu vēsture
          </h2>
          {history.length === 0 ? (
            <p className="text-slate-400">Nav spēļu vēstures.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800"
                >
                  <p className="font-semibold">{h.topic}</p>
                  <p className="text-sm text-slate-300">Punkti: {h.score}</p>
                  <p className="text-xs text-slate-400">{h.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* LEVEL UP POPUP */}
      <AnimatePresence>
        {pendingReward && (
          <LevelUpPopup
            level={pendingReward.level}
            reward={pendingReward.reward}
            onClose={claimLevelReward}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================
// SMALL STAT CARD COMPONENT
// =========================
function StatCard({ label, value, color }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl shadow-lg text-center">
      <p className="text-sm text-slate-300">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
