import { motion } from "framer-motion";

export default function FloatingShapes({ variant = "hero" }: { variant?: "hero" | "section" }) {
  if (variant === "section") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-16 top-10 h-56 w-56 rounded-[40%] bg-gradient-to-br from-blue-300/30 to-blue-500/10 blur-2xl"
          animate={{ y: [0, 20, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-10 bottom-0 h-72 w-72 rounded-[45%] bg-gradient-to-tr from-sky-200/40 to-blue-400/10 blur-2xl"
          animate={{ y: [0, -25, 0], rotate: [0, -12, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1200px]">
      <motion.div
        className="absolute left-[8%] top-[18%] h-24 w-24 rounded-2xl border border-white/40 bg-gradient-to-br from-blue-400/40 to-blue-700/30 shadow-2xl shadow-blue-900/20 backdrop-blur-sm"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: [0, 25, 0], rotateY: [0, 25, 0], y: [0, -18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[12%] top-[12%] h-16 w-16 rounded-full bg-gradient-to-br from-blue-300 to-blue-600 opacity-70 shadow-xl shadow-blue-900/30"
        animate={{ y: [0, 22, 0], x: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[20%] bottom-[15%] h-20 w-20 rotate-45 rounded-xl border border-blue-200/60 bg-white/30 shadow-2xl shadow-blue-900/10 backdrop-blur-md"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateZ: [45, 90, 45], y: [0, -15, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[20%] h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-sky-300 opacity-60 blur-[1px]"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
    </div>
  );
}
