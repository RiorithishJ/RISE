import { FormEvent, useMemo, useState } from "react";

interface LockScreenProps {
  onUnlock: () => void;
}

const PASSWORD_KEY = "rise_password_hash";

const toHex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const hashPassword = async (password: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const LockScreen = ({ onUnlock }: LockScreenProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasPassword = useMemo(() => {
    if (typeof window === "undefined") return false;
    return !!window.localStorage.getItem(PASSWORD_KEY);
  }, []);

  const handleSetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const hash = await hashPassword(password);
      window.localStorage.setItem(PASSWORD_KEY, hash);
      onUnlock();
    } catch {
      setError("Unable to set password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlock = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const storedHash = window.localStorage.getItem(PASSWORD_KEY);
      const enteredHash = await hashPassword(password);

      if (storedHash && storedHash === enteredHash) {
        onUnlock();
        return;
      }

      setError("Incorrect password");
    } catch {
      setError("Incorrect password");
    } finally {
      setIsSubmitting(false);
      setPassword("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 shadow-[0_16px_50px_rgba(232,93,53,0.12)]">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e85d35]">RISE</p>
        </div>

        {!hasPassword ? (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#e85d35] focus:ring-2 focus:ring-[#e85d35]/20"
                placeholder="Enter a password"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#e85d35] focus:ring-2 focus:ring-[#e85d35]/20"
                placeholder="Confirm your password"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#e85d35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d6532e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Setting..." : "Set Password"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#e85d35] focus:ring-2 focus:ring-[#e85d35]/20"
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#e85d35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d6532e] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Unlocking..." : "Unlock"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LockScreen;
