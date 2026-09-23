import { useEffect, useState } from "react";
import { useDatabaseService } from "@/hooks/useDatabaseService";

const ProfilePage = () => {
  const db = useDatabaseService();
  const [profile, setProfile] = useState({
    name: "Rio", email: "rio@email.com", location: "Coimbatore, Tamil Nadu", college: "",
    year: "4th Year", role: "AI Intern", github: "@rio-dev", linkedin: "",
    goal: "AI Engineer", timeline: "1 year", skillLevel: "Intermediate",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const saved = await db.getRecord("user_profile", "profile");
      if (saved?.data && typeof saved.data === "object") {
        setProfile(saved.data as typeof profile);
      }
    };

    void loadProfile();
  }, [db]);

  const update = async (key: string, value: string) => {
    const p = { ...profile, [key]: value };
    setProfile(p);
    await db.saveRecord("user_profile", { id: "profile", data: p, updatedAt: new Date().toISOString() });
  };

  const Field = ({ label, field, placeholder }: { label: string; field: string; placeholder?: string }) => (
    <div>
      <label className="text-xs text-rise-muted font-medium block mb-1">{label}</label>
      <input value={profile[field]} onChange={e => update(field, e.target.value)} placeholder={placeholder}
        className="w-full bg-rise-bg rounded-xl px-4 py-2.5 text-sm outline-none text-rise-text placeholder:text-rise-muted focus:ring-2 focus:ring-rise-orange/20 transition-all" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-rise-text mb-6">Profile</h2>

      {/* Avatar */}
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-rise-orange flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
          <span className="text-white text-3xl font-bold">R</span>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Field label="Full Name" field="name" />
        <Field label="Email" field="email" />
        <Field label="Location" field="location" />
        <Field label="College" field="college" placeholder="Your college" />
        <Field label="Current Year" field="year" />
        <Field label="Role" field="role" />
        <Field label="GitHub Username" field="github" />
        <Field label="LinkedIn URL" field="linkedin" placeholder="linkedin.com/in/..." />
      </div>

      <h3 className="font-semibold text-rise-text mb-3">Career Goals</h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Field label="Primary Goal" field="goal" />
        <div>
          <label className="text-xs text-rise-muted font-medium block mb-1">Target Timeline</label>
          <select value={profile.timeline} onChange={e => update("timeline", e.target.value)}
            className="w-full bg-rise-bg rounded-xl px-4 py-2.5 text-sm outline-none text-rise-text">
            <option>6 months</option><option>1 year</option><option>2 years</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-rise-muted font-medium block mb-1">Skill Level</label>
          <select value={profile.skillLevel} onChange={e => update("skillLevel", e.target.value)}
            className="w-full bg-rise-bg rounded-xl px-4 py-2.5 text-sm outline-none text-rise-text">
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
        </div>
      </div>

      <button className="w-full py-3 rounded-xl bg-rise-orange text-white font-semibold hover:opacity-90 transition-opacity">
        Save Profile
      </button>
    </div>
  );
};

export default ProfilePage;
