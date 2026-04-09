import { useState } from "react";
import { Volume2 } from "lucide-react";

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!value)}
    className={`w-10 h-5 rounded-full transition-colors relative ${value ? "bg-rise-orange" : "bg-gray-300"}`}>
    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${value ? "left-5" : "left-0.5"}`} />
  </button>
);

const SettingsPage = () => {
  const [browserNotif, setBrowserNotif] = useState(true);
  const [linkedinReminder, setLinkedinReminder] = useState(true);
  const [githubReminder, setGithubReminder] = useState(true);
  const [fitnessReminder, setFitnessReminder] = useState(true);
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [sound, setSound] = useState("Chime");
  const [volume, setVolume] = useState(70);

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-rise-text mb-6">Settings</h2>

      {/* Account */}
      <Section title="Account">
        <SettingRow label="Change Password"><button className="text-xs bg-rise-bg px-3 py-1.5 rounded-lg text-rise-muted font-medium hover:bg-gray-200">Change</button></SettingRow>
        <SettingRow label="Export All Data"><button className="text-xs bg-rise-bg px-3 py-1.5 rounded-lg text-rise-muted font-medium hover:bg-gray-200">Export</button></SettingRow>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <SettingRow label="Browser Notifications"><Toggle value={browserNotif} onChange={setBrowserNotif} /></SettingRow>
        <SettingRow label="LinkedIn Reminder"><div className="flex items-center gap-2"><Toggle value={linkedinReminder} onChange={setLinkedinReminder} /><select className="text-xs bg-rise-bg rounded px-2 py-1 text-rise-muted"><option>Sunday</option><option>Saturday</option><option>Friday</option></select></div></SettingRow>
        <SettingRow label="GitHub Reminder"><div className="flex items-center gap-2"><Toggle value={githubReminder} onChange={setGithubReminder} /><select className="text-xs bg-rise-bg rounded px-2 py-1 text-rise-muted"><option>Daily</option><option>Weekly</option></select></div></SettingRow>
        <SettingRow label="Fitness Reminder"><div className="flex items-center gap-2"><Toggle value={fitnessReminder} onChange={setFitnessReminder} /><input type="time" defaultValue="07:00" className="text-xs bg-rise-bg rounded px-2 py-1 text-rise-muted" /></div></SettingRow>
      </Section>

      {/* Pomodoro */}
      <Section title="Pomodoro">
        <SettingRow label="Default Work Time"><input type="number" value={workTime} onChange={e => setWorkTime(+e.target.value)} className="w-16 bg-rise-bg rounded px-2 py-1 text-sm text-center text-rise-text" /></SettingRow>
        <SettingRow label="Default Break Time"><input type="number" value={breakTime} onChange={e => setBreakTime(+e.target.value)} className="w-16 bg-rise-bg rounded px-2 py-1 text-sm text-center text-rise-text" /></SettingRow>
        <SettingRow label="Sound"><select value={sound} onChange={e => setSound(e.target.value)} className="text-sm bg-rise-bg rounded px-3 py-1 text-rise-text"><option>Alarm</option><option>Beep</option><option>Chime</option><option>None</option></select></SettingRow>
        <SettingRow label="Volume"><div className="flex items-center gap-2"><Volume2 size={14} className="text-rise-muted" /><input type="range" min={0} max={100} value={volume} onChange={e => setVolume(+e.target.value)} className="w-32 accent-rise-orange" /></div></SettingRow>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <SettingRow label="Theme"><span className="text-sm text-rise-muted">Light (current)</span></SettingRow>
        <SettingRow label="Language"><span className="text-sm text-rise-muted">English</span></SettingRow>
      </Section>

      {/* RISE AI */}
      <Section title="RISE AI">
        <SettingRow label="Clear Chat History"><button className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100">Clear</button></SettingRow>
        <SettingRow label="Clear All Data"><button className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100">Clear All</button></SettingRow>
      </Section>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-xs font-semibold text-rise-muted uppercase tracking-wider mb-3">{title}</h3>
    <div className="card-rise space-y-0 divide-y divide-rise-border">{children}</div>
  </div>
);

const SettingRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
    <span className="text-sm text-rise-text">{label}</span>
    {children}
  </div>
);

export default SettingsPage;
