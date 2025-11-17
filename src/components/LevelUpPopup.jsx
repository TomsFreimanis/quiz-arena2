// src/components/LevelUpPopup.jsx
import { motion } from "framer-motion";

export default function LevelUpPopup({ level, reward, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="bg-slate-900/90 border border-yellow-400/50 p-8 rounded-3xl shadow-2xl text-center text-white w-80"
      >
        <h2 className="text-3xl font-extrabold text-yellow-400 mb-3">
          🎉 LEVEL UP!
        </h2>

        <p className="text-xl mb-4">Tu sasniedzi <b>{level}. līmeni</b>!</p>

        {reward && (
          <div className="mb-4">
            <p className="text-yellow-300 text-lg font-bold">Balva:</p>

            {"coins" in reward && (
              <p className="text-green-400 mt-1">
                💰 +{reward.coins} monētas
              </p>
            )}

            {"avatar" in reward && (
              <p className="text-blue-300 mt-1">
                🖼️ Jauns avatars: <b>{reward.avatar}</b>
              </p>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-yellow-400 text-black rounded-xl font-bold hover:bg-yellow-300"
        >
          Aizvērt
        </button>
      </motion.div>
    </div>
  );
}
