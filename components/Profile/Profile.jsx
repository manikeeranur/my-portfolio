"use client";

import { useState, useRef, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useAuth } from "@/components/context/AuthContext";
import { MyResumeContext } from "@/components/context/MyResumeContext";
import profileSeedData from "@/data/profileSeedData";
import Modal from "@/components/ui/Modal";

const genId = () => Math.random().toString(36).slice(2, 11);

// ─── Shared className helpers ──────────────────────────────────────────────

const cardCls = "rounded-2xl border border-[rgba(30,27,46,0.07)] bg-white/[.92] shadow-card backdrop-blur-md";
const inputCls =
  "w-full rounded-[10px] border border-[rgba(30,27,46,0.1)] bg-[rgba(30,27,46,0.04)] px-3.5 py-2.5 text-sm text-text placeholder:text-[#94a3b8] focus:border-2 focus:border-accent focus:outline-none";
const labelCls = "mb-1.5 block text-xs font-semibold text-text-secondary";
const btnPrimaryCls =
  "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-accent to-accent-hover px-4 py-2 text-sm font-bold text-white hover:shadow-[0_6px_20px_rgba(109,92,216,0.4)]";
const btnOutlineCls =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-accent/50 px-4 py-2 text-sm text-accent hover:border-accent hover:bg-accent/10";
const btnDangerCls =
  "inline-flex items-center gap-1.5 rounded-lg border border-[rgba(239,68,68,0.4)] px-4 py-2 text-sm text-[#ef4444] hover:border-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]";

const blankExp = () => ({
  id: genId(),
  position: "",
  company: "",
  startDate: "",
  endDate: "",
  current: false,
  technology: "",
  project: "",
  description: "",
});
const blankEdu = () => ({ id: genId(), institution: "", degree: "", field: "", startDate: "", endDate: "", grade: "" });
const blankProj = () => ({ id: genId(), name: "", description: "", technologies: "", liveUrl: "", githubUrl: "", image: null });
const blankTech = () => ({ id: genId(), name: "", category: "", image: null });

const EmptyState = ({ label }) => (
  <div className="py-12 text-center text-[#94a3b8]">
    <div className="mb-2 text-4xl">📭</div>
    <div className="text-sm">{label}</div>
  </div>
);

const FieldRow = ({ label, val }) => (
  <div>
    <div className="mb-0.5 text-[11px] uppercase tracking-wide text-[#94a3b8]">{label}</div>
    <div className={`text-sm ${val ? "text-text" : "text-[#94a3b8]"}`}>{val || "—"}</div>
  </div>
);

const TABS = [
  { label: "Personal", icon: "fa-user" },
  { label: "Skills", icon: "fa-code" },
  { label: "Experience", icon: "fa-briefcase" },
  { label: "Education", icon: "fa-graduation-cap" },
  { label: "Projects", icon: "fa-picture-o" },
  { label: "Techs Used", icon: "fa-server" },
  { label: "Settings", icon: "fa-cog" },
];

const Profile = () => {
  const { logout, changePassword } = useAuth();
  const { profileData: profile, updateProfile } = useContext(MyResumeContext);
  const router = useRouter();
  const imageInputRef = useRef(null);
  const importRef = useRef(null);

  const [activeTab, setActiveTab] = useState("0");
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const [editPersonal, setEditPersonal] = useState(false);
  const [personalDraft, setPersonalDraft] = useState(profile.personalInfo);

  const [skillDlg, setSkillDlg] = useState({ open: false, value: "", category: "", editId: null });
  const [expDlg, setExpDlg] = useState({ open: false, data: null });
  const [eduDlg, setEduDlg] = useState({ open: false, data: null });
  const [projDlg, setProjDlg] = useState({ open: false, data: null });
  const [techDlg, setTechDlg] = useState({ open: false, data: null });
  const [pwDlg, setPwDlg] = useState({ open: false, current: "", next: "", confirm: "", show: false, err: "" });

  const [showImgUrl, setShowImgUrl] = useState(false);
  const [imgUrlDraft, setImgUrlDraft] = useState("");

  const toast = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  useEffect(() => {
    if (!snack.open) return;
    const t = setTimeout(() => setSnack((p) => ({ ...p, open: false })), 3000);
    return () => clearTimeout(t);
  }, [snack.open]);

  const downloadForPublic = (base64, folder, suggestedName) => {
    const [header, b64data] = base64.split(",");
    const mimeType = header.match(/:(.*?);/)[1];
    let ext = mimeType.split("/")[1];
    if (ext === "jpeg") ext = "jpg";
    if (ext === "svg+xml") ext = "svg";
    const safeName = suggestedName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const filename = `${safeName}.${ext}`;
    const path = `/images/${folder}/${filename}`;
    const byteChars = atob(b64data);
    const byteArr = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
    const blob = new Blob([byteArr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return path;
  };

  const save = async (updated) => {
    const result = await updateProfile(updated);
    if (result.success) toast("Saved successfully!");
    else toast(result.error || "Save failed", "error");
  };

  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast("Image too large. Max 3 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => save({ ...profile, profileImage: ev.target.result });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const savePersonal = () => {
    save({ ...profile, personalInfo: personalDraft });
    setEditPersonal(false);
  };
  const cancelPersonal = () => {
    setPersonalDraft(profile.personalInfo);
    setEditPersonal(false);
  };

  const openAddSkill = () => setSkillDlg({ open: true, value: "", category: "", editId: null });
  const openEditSkill = (sk) => setSkillDlg({ open: true, value: sk.name, category: sk.category || "", editId: sk.id });
  const saveSkill = () => {
    const name = skillDlg.value.trim();
    if (!name) return;
    const category = skillDlg.category.trim();
    const skills = skillDlg.editId
      ? profile.skills.map((s) => (s.id === skillDlg.editId ? { ...s, name, category } : s))
      : [...profile.skills, { id: genId(), name, category }];
    save({ ...profile, skills });
    setSkillDlg({ open: false, value: "", category: "", editId: null });
  };
  const deleteSkill = (id) => save({ ...profile, skills: profile.skills.filter((s) => s.id !== id) });

  const openAddExp = () => setExpDlg({ open: true, data: blankExp() });
  const openEditExp = (ex) => setExpDlg({ open: true, data: { ...ex } });
  const saveExp = () => {
    const d = expDlg.data;
    if (!d.company || !d.position) {
      toast("Company and Position are required", "error");
      return;
    }
    const exists = profile.experience.find((e) => e.id === d.id);
    const experience = exists ? profile.experience.map((e) => (e.id === d.id ? d : e)) : [...profile.experience, d];
    save({ ...profile, experience });
    setExpDlg({ open: false, data: null });
  };
  const deleteExp = (id) => save({ ...profile, experience: profile.experience.filter((e) => e.id !== id) });

  const openAddEdu = () => setEduDlg({ open: true, data: blankEdu() });
  const openEditEdu = (ed) => setEduDlg({ open: true, data: { ...ed } });
  const saveEdu = () => {
    const d = eduDlg.data;
    if (!d.institution) {
      toast("Institution is required", "error");
      return;
    }
    const exists = profile.education.find((e) => e.id === d.id);
    const education = exists ? profile.education.map((e) => (e.id === d.id ? d : e)) : [...profile.education, d];
    save({ ...profile, education });
    setEduDlg({ open: false, data: null });
  };
  const deleteEdu = (id) => save({ ...profile, education: profile.education.filter((e) => e.id !== id) });

  const openAddProj = () => setProjDlg({ open: true, data: blankProj() });
  const openEditProj = (p) => setProjDlg({ open: true, data: { ...p } });
  const handleProjImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast("Image too large. Max 3 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setProjDlg((prev) => ({ ...prev, data: { ...prev.data, image: ev.target.result } }));
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const saveProj = () => {
    const d = projDlg.data;
    if (!d.name) {
      toast("Project name is required", "error");
      return;
    }
    const exists = profile.projects.find((p) => p.id === d.id);
    const projects = exists ? profile.projects.map((p) => (p.id === d.id ? d : p)) : [...profile.projects, d];
    save({ ...profile, projects });
    setProjDlg({ open: false, data: null });
  };
  const deleteProj = (id) => save({ ...profile, projects: profile.projects.filter((p) => p.id !== id) });

  const openAddTech = () => setTechDlg({ open: true, data: blankTech() });
  const openEditTech = (t) => setTechDlg({ open: true, data: { ...t } });
  const handleTechImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      toast("Image too large. Max 1 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setTechDlg((prev) => ({ ...prev, data: { ...prev.data, image: ev.target.result } }));
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const saveTech = () => {
    const d = techDlg.data;
    if (!d.name) {
      toast("Tech name is required", "error");
      return;
    }
    const techs = profile.techs || [];
    const exists = techs.find((t) => t.id === d.id);
    const updated = exists ? techs.map((t) => (t.id === d.id ? d : t)) : [...techs, d];
    save({ ...profile, techs: updated });
    setTechDlg({ open: false, data: null });
  };
  const deleteTech = (id) => save({ ...profile, techs: (profile.techs || []).filter((t) => t.id !== id) });

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio_profile.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Profile exported as JSON!");
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        save({ ...profileSeedData, ...parsed });
        setPersonalDraft(parsed.personalInfo || profileSeedData.personalInfo);
      } catch {
        toast("Invalid JSON file", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleChangePassword = async () => {
    const { current, next, confirm } = pwDlg;
    if (!current || !next || !confirm) {
      setPwDlg((p) => ({ ...p, err: "All fields required" }));
      return;
    }
    if (next !== confirm) {
      setPwDlg((p) => ({ ...p, err: "New passwords do not match" }));
      return;
    }
    if (next.length < 6) {
      setPwDlg((p) => ({ ...p, err: "Password must be at least 6 characters" }));
      return;
    }
    const result = await changePassword(current, next);
    if (result.success) {
      setPwDlg({ open: false, current: "", next: "", confirm: "", show: false, err: "" });
      toast("Password changed successfully!");
    } else {
      setPwDlg((p) => ({ ...p, err: result.error }));
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f3f1fd] pb-16 text-text">
      <div className="sticky top-0 z-[100] flex items-center justify-between border-b border-[rgba(30,27,46,0.07)] bg-white/[.96] px-4 py-3 shadow-[0_4px_30px_rgba(30,27,46,0.08)] backdrop-blur-md md:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-teal text-lg">
            👤
          </div>
          <span className="text-base font-bold text-text">Profile Manager</span>
        </div>
        <button onClick={handleLogout} className={`${btnDangerCls} px-3.5 py-1.5 text-[13px]`}>
          <i className="fa fa-sign-out" aria-hidden="true" /> Logout
        </button>
      </div>

      <div className="mx-auto mt-6 max-w-5xl px-4">
        {/* Profile header card */}
        <div className={`${cardCls} mb-5 overflow-hidden`}>
          <div className="h-1 bg-gradient-to-r from-accent via-teal to-pink" />
          <div className="flex flex-wrap items-center gap-6 p-6">
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex h-[110px] w-[110px] items-center justify-center overflow-hidden rounded-full border-[3px] border-accent/40 bg-gradient-to-br from-accent to-teal text-4xl text-white"
                >
                  {profile.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.profileImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    profile.personalInfo.name?.[0]?.toUpperCase() || "?"
                  )}
                </button>
                <button
                  type="button"
                  title="Upload photo from device"
                  onClick={() => imageInputRef.current?.click()}
                  className="absolute bottom-0.5 right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover"
                >
                  <i className="fa fa-camera text-xs" aria-hidden="true" />
                </button>
                <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleProfileImage} />
              </div>

              {!showImgUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setImgUrlDraft(profile.profileImage?.startsWith("data:") ? "" : profile.profileImage || "");
                    setShowImgUrl(true);
                  }}
                  className="text-[11px] text-[#94a3b8] hover:text-accent"
                >
                  Use public folder path
                </button>
              ) : (
                <div className="mt-0.5 flex items-center gap-1">
                  <input
                    autoFocus
                    placeholder="/images/profile/photo.jpg"
                    value={imgUrlDraft}
                    onChange={(e) => setImgUrlDraft(e.target.value)}
                    className="w-[200px] rounded-md border border-[rgba(30,27,46,0.1)] bg-[rgba(30,27,46,0.04)] px-2 py-1.5 text-xs text-text focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imgUrlDraft.trim()) save({ ...profile, profileImage: imgUrlDraft.trim() });
                      setShowImgUrl(false);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent hover:bg-accent/25"
                  >
                    <i className="fa fa-check text-xs" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImgUrl(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-[rgba(239,68,68,0.1)] text-[#ef4444]"
                  >
                    <i className="fa fa-times text-xs" aria-hidden="true" />
                  </button>
                </div>
              )}

              {profile.profileImage && !profile.profileImage.startsWith("data:") && (
                <div className="max-w-[130px] break-all text-center text-[10px] text-teal">{profile.profileImage}</div>
              )}

              {profile.profileImage?.startsWith("data:") && (
                <button
                  type="button"
                  onClick={() => {
                    const path = downloadForPublic(profile.profileImage, "profile", "profile-photo");
                    save({ ...profile, profileImage: path });
                    toast(`File downloaded! FTP it to public/images/profile/ on your server. Path set to: ${path}`);
                  }}
                  className="rounded border border-teal/30 px-1.5 py-0.5 text-[11px] text-teal"
                >
                  <i className="fa fa-download mr-1 text-[10px]" aria-hidden="true" />
                  Save to public/images/
                </button>
              )}
            </div>

            <div className="min-w-[200px] flex-1">
              <div className="mb-0.5 text-xl font-bold text-text">{profile.personalInfo.name || "Your Name"}</div>
              <div className="mb-0.5 text-[15px] text-accent">{profile.personalInfo.title || "Your Title"}</div>
              <div className="text-[13px] text-text-secondary">{profile.personalInfo.location || "Location"}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: "Skills", count: profile.skills?.length || 0, color: "#6d5cd8" },
                  { label: "Experience", count: profile.experience?.length || 0, color: "#2dd4bf" },
                  { label: "Education", count: profile.education?.length || 0, color: "#f59e0b" },
                  { label: "Projects", count: profile.projects?.length || 0, color: "#ec4899" },
                ].map(({ label, count, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 rounded-md bg-[rgba(30,27,46,0.05)] px-3 py-1"
                    style={{ border: `1px solid ${color}33` }}
                  >
                    <span className="text-[15px] font-bold" style={{ color }}>
                      {count}
                    </span>
                    <span className="text-xs text-[#94a3b8]">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={exportJSON} className={`${btnOutlineCls} text-[13px]`}>
                <i className="fa fa-download" aria-hidden="true" /> Export JSON
              </button>
              <button type="button" onClick={() => importRef.current?.click()} className={`${btnOutlineCls} text-[13px]`}>
                <i className="fa fa-upload" aria-hidden="true" /> Import JSON
              </button>
              <input ref={importRef} type="file" accept=".json" hidden onChange={importJSON} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${cardCls} overflow-hidden`}>
          <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab}>
            <TabsPrimitive.List className="flex overflow-x-auto border-b border-[rgba(30,27,46,0.07)]">
              {TABS.map((t, i) => (
                <TabsPrimitive.Trigger
                  key={t.label}
                  value={String(i)}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-medium text-text-secondary data-[state=active]:border-accent data-[state=active]:text-accent"
                >
                  <i className={`fa ${t.icon}`} aria-hidden="true" /> {t.label}
                </TabsPrimitive.Trigger>
              ))}
            </TabsPrimitive.List>

            <div className="p-6">
              {/* Personal */}
              <TabsPrimitive.Content value="0">
                <div className="mb-5 flex items-center justify-between">
                  <div className="text-base font-bold text-text">Personal Information</div>
                  {!editPersonal ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPersonalDraft(profile.personalInfo);
                        setEditPersonal(true);
                      }}
                      className={btnOutlineCls}
                    >
                      <i className="fa fa-pencil" aria-hidden="true" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button type="button" onClick={cancelPersonal} className={btnDangerCls}>
                        <i className="fa fa-times" aria-hidden="true" /> Cancel
                      </button>
                      <button type="button" onClick={savePersonal} className={btnPrimaryCls}>
                        <i className="fa fa-save" aria-hidden="true" /> Save
                      </button>
                    </div>
                  )}
                </div>

                {editPersonal ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      { label: "Full Name", key: "name" },
                      { label: "Professional Title", key: "title" },
                      { label: "Email", key: "email" },
                      { label: "Phone", key: "phone" },
                      { label: "Location", key: "location" },
                      { label: "Website URL", key: "website" },
                      { label: "GitHub URL", key: "github" },
                      { label: "LinkedIn URL", key: "linkedin" },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className={labelCls}>{label}</label>
                        <input
                          value={personalDraft[key] || ""}
                          onChange={(e) => setPersonalDraft((p) => ({ ...p, [key]: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Bio / About Me</label>
                      <textarea
                        rows={4}
                        value={personalDraft.bio || ""}
                        onChange={(e) => setPersonalDraft((p) => ({ ...p, bio: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FieldRow label="Full Name" val={profile.personalInfo.name} />
                    <FieldRow label="Professional Title" val={profile.personalInfo.title} />
                    <FieldRow label="Email" val={profile.personalInfo.email} />
                    <FieldRow label="Phone" val={profile.personalInfo.phone} />
                    <FieldRow label="Location" val={profile.personalInfo.location} />
                    <FieldRow label="Website" val={profile.personalInfo.website} />
                    <FieldRow label="GitHub" val={profile.personalInfo.github} />
                    <FieldRow label="LinkedIn" val={profile.personalInfo.linkedin} />
                    {profile.personalInfo.bio && (
                      <div className="sm:col-span-2">
                        <div className="mb-0.5 text-[11px] uppercase tracking-wide text-[#94a3b8]">Bio</div>
                        <div className="text-sm leading-relaxed text-text">{profile.personalInfo.bio}</div>
                      </div>
                    )}
                  </div>
                )}
              </TabsPrimitive.Content>

              {/* Skills */}
              <TabsPrimitive.Content value="1">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-text">Skills</div>
                    <div className="mt-0.5 text-xs text-[#94a3b8]">
                      {profile.skills.length} skill{profile.skills.length !== 1 ? "s" : ""} — grouped by category in the
                      resume
                    </div>
                  </div>
                  <button type="button" onClick={openAddSkill} className={btnPrimaryCls}>
                    <i className="fa fa-plus" aria-hidden="true" /> Add Skill
                  </button>
                </div>
                {profile.skills.length === 0 ? (
                  <EmptyState label="No skills added yet" />
                ) : (
                  (() => {
                    const hasCat = profile.skills.some((s) => s.category);
                    const SkillChip = ({ sk }) => (
                      <span
                        key={sk.id}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-accent/35 bg-accent/15 px-3 py-1.5 text-sm text-[#5b4bc4] hover:bg-accent/25"
                        onClick={() => openEditSkill(sk)}
                      >
                        {sk.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSkill(sk.id);
                          }}
                          className="text-[#5b4bc4] hover:text-[#ef4444]"
                        >
                          <i className="fa fa-times-circle" aria-hidden="true" />
                        </button>
                      </span>
                    );
                    if (!hasCat)
                      return (
                        <div className="flex flex-wrap gap-3">
                          {profile.skills.map((sk) => (
                            <SkillChip key={sk.id} sk={sk} />
                          ))}
                        </div>
                      );
                    const groups = {};
                    profile.skills.forEach((s) => {
                      const cat = s.category || "Uncategorized";
                      if (!groups[cat]) groups[cat] = [];
                      groups[cat].push(s);
                    });
                    return Object.entries(groups).map(([cat, items]) => (
                      <div key={cat} className="mb-6">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="whitespace-nowrap text-[11px] uppercase tracking-wider text-[#94a3b8]">
                            {cat}
                          </span>
                          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] text-accent">
                            {items.length}
                          </span>
                          <span className="h-px flex-1 bg-[rgba(30,27,46,0.06)]" />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {items.map((sk) => (
                            <SkillChip key={sk.id} sk={sk} />
                          ))}
                        </div>
                      </div>
                    ));
                  })()
                )}
              </TabsPrimitive.Content>

              {/* Experience */}
              <TabsPrimitive.Content value="2">
                <div className="mb-5 flex items-center justify-between">
                  <div className="text-base font-bold text-text">Work Experience</div>
                  <button type="button" onClick={openAddExp} className={btnPrimaryCls}>
                    <i className="fa fa-plus" aria-hidden="true" /> Add Experience
                  </button>
                </div>
                {profile.experience.length === 0 ? (
                  <EmptyState label="No experience added yet" />
                ) : (
                  <div className="flex flex-col gap-3">
                    {profile.experience.map((ex) => (
                      <div key={ex.id} className={`${cardCls} border-l-[3px] border-l-accent p-4`}>
                        <div className="flex flex-wrap justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-[15px] font-bold text-accent">{ex.position}</div>
                            <div className="text-sm font-semibold text-text">{ex.company}</div>
                            <div className="mt-1 text-xs text-[#94a3b8]">
                              {ex.startDate} — {ex.current ? "Present" : ex.endDate}
                            </div>
                            {ex.technology && (
                              <div className="mt-2 text-xs">
                                <span className="font-semibold text-[#94a3b8]">Technology: </span>
                                <span className="text-text-secondary">{ex.technology}</span>
                              </div>
                            )}
                            {ex.project && (
                              <div className="mt-1 text-xs">
                                <span className="font-semibold text-[#94a3b8]">Project: </span>
                                <span className="text-teal">{ex.project}</span>
                              </div>
                            )}
                            {ex.description && (
                              <div className="mt-2 text-[13px] leading-relaxed text-text-secondary">{ex.description}</div>
                            )}
                          </div>
                          <div className="flex items-start gap-1">
                            <button
                              type="button"
                              onClick={() => openEditExp(ex)}
                              className="rounded-md p-1.5 text-accent hover:bg-accent/15"
                            >
                              <i className="fa fa-pencil" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteExp(ex.id)}
                              className="rounded-md p-1.5 text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]"
                            >
                              <i className="fa fa-trash" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsPrimitive.Content>

              {/* Education */}
              <TabsPrimitive.Content value="3">
                <div className="mb-5 flex items-center justify-between">
                  <div className="text-base font-bold text-text">Education</div>
                  <button type="button" onClick={openAddEdu} className={btnPrimaryCls}>
                    <i className="fa fa-plus" aria-hidden="true" /> Add Education
                  </button>
                </div>
                {profile.education.length === 0 ? (
                  <EmptyState label="No education added yet" />
                ) : (
                  <div className="flex flex-col gap-3">
                    {profile.education.map((ed) => (
                      <div key={ed.id} className={`${cardCls} p-4`}>
                        <div className="flex flex-wrap justify-between gap-2">
                          <div>
                            <div className="text-[15px] font-bold text-accent">
                              {ed.degree} {ed.field && `— ${ed.field}`}
                            </div>
                            <div className="text-sm font-semibold text-text">{ed.institution}</div>
                            <div className="mt-1 text-xs text-[#94a3b8]">
                              {ed.startDate} — {ed.endDate}
                              {ed.grade && <span className="ml-3 text-teal">Grade: {ed.grade}</span>}
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <button
                              type="button"
                              onClick={() => openEditEdu(ed)}
                              className="rounded-md p-1.5 text-accent hover:bg-accent/15"
                            >
                              <i className="fa fa-pencil" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteEdu(ed.id)}
                              className="rounded-md p-1.5 text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]"
                            >
                              <i className="fa fa-trash" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsPrimitive.Content>

              {/* Projects */}
              <TabsPrimitive.Content value="4">
                <div className="mb-5 flex items-center justify-between">
                  <div className="text-base font-bold text-text">Projects</div>
                  <button type="button" onClick={openAddProj} className={btnPrimaryCls}>
                    <i className="fa fa-plus" aria-hidden="true" /> Add Project
                  </button>
                </div>
                {profile.projects.length === 0 ? (
                  <EmptyState label="No projects added yet" />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {profile.projects.map((p) => (
                      <div key={p.id} className={`${cardCls} h-full overflow-hidden`}>
                        {p.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={p.name} className="block h-40 w-full object-cover" />
                        )}
                        <div className="p-4">
                          <div className="mb-1 font-bold text-accent">{p.name}</div>
                          {p.description && (
                            <div className="mb-2 text-[13px] leading-snug text-text-secondary">{p.description}</div>
                          )}
                          {p.technologies && (
                            <div className="mb-2 flex flex-wrap gap-1.5">
                              {p.technologies
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean)
                                .map((t) => (
                                  <span
                                    key={t}
                                    className="rounded-full border border-teal/30 bg-teal/10 px-2 py-0.5 text-[11px] text-teal"
                                  >
                                    {t}
                                  </span>
                                ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {p.liveUrl && (
                                <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-teal">
                                  <i className="fa fa-link" aria-hidden="true" />
                                </a>
                              )}
                              {p.githubUrl && (
                                <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-text-secondary">
                                  <i className="fa fa-github" aria-hidden="true" />
                                </a>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => openEditProj(p)}
                                className="rounded-md p-1.5 text-accent hover:bg-accent/15"
                              >
                                <i className="fa fa-pencil" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProj(p.id)}
                                className="rounded-md p-1.5 text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]"
                              >
                                <i className="fa fa-trash" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsPrimitive.Content>

              {/* Techs Used */}
              <TabsPrimitive.Content value="5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-text">Techs Used</div>
                    <div className="mt-0.5 text-xs text-[#94a3b8]">
                      Shown on the website&apos;s &quot;Techs Used&quot; section — separate from resume skills
                    </div>
                  </div>
                  <button type="button" onClick={openAddTech} className={btnPrimaryCls}>
                    <i className="fa fa-plus" aria-hidden="true" /> Add Tech
                  </button>
                </div>
                {(() => {
                  const techs = profile.techs || [];
                  if (techs.length === 0) return <EmptyState label="No techs added yet" />;
                  const groups = techs.reduce((acc, t) => {
                    const cat = t.category || "Uncategorized";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(t);
                    return acc;
                  }, {});
                  return Object.entries(groups).map(([cat, items]) => (
                    <div key={cat} className="mb-6">
                      <div className="mb-3 text-[11px] uppercase tracking-wider text-[#94a3b8]">{cat}</div>
                      <div className="flex flex-wrap gap-3">
                        {items.map((t) => (
                          <div key={t.id} className={`${cardCls} flex items-center gap-3 border-l-2 border-l-accent px-3 py-2`}>
                            {t.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={t.image} alt={t.name} className="h-7 w-7 rounded object-contain" />
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-br from-accent to-teal text-sm font-extrabold text-white">
                                {t.name[0]?.toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm text-text">{t.name}</span>
                            <div className="ml-1 flex gap-1">
                              <button
                                type="button"
                                onClick={() => openEditTech(t)}
                                className="p-0.5 text-accent hover:bg-accent/15"
                              >
                                <i className="fa fa-pencil text-xs" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteTech(t.id)}
                                className="p-0.5 text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]"
                              >
                                <i className="fa fa-trash text-xs" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </TabsPrimitive.Content>

              {/* Settings */}
              <TabsPrimitive.Content value="6">
                <div className="mb-6 text-base font-bold text-text">Settings</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div className={`${cardCls} p-5 text-center`}>
                    <div className="mb-2 text-4xl">🔒</div>
                    <div className="mb-1 font-semibold">Change Password</div>
                    <div className="mb-4 text-[13px] text-text-secondary">Update your login password</div>
                    <button
                      type="button"
                      onClick={() => setPwDlg((p) => ({ ...p, open: true }))}
                      className={`${btnOutlineCls} w-full`}
                    >
                      Change Password
                    </button>
                  </div>
                  <div className={`${cardCls} p-5 text-center`}>
                    <div className="mb-2 text-4xl">📥</div>
                    <div className="mb-1 font-semibold">Export Profile</div>
                    <div className="mb-4 text-[13px] text-text-secondary">Download your profile as JSON</div>
                    <button type="button" onClick={exportJSON} className={`${btnOutlineCls} w-full`}>
                      <i className="fa fa-download" aria-hidden="true" /> Export JSON
                    </button>
                  </div>
                  <div className={`${cardCls} p-5 text-center`}>
                    <div className="mb-2 text-4xl">📤</div>
                    <div className="mb-1 font-semibold">Import Profile</div>
                    <div className="mb-4 text-[13px] text-text-secondary">Restore from a JSON backup</div>
                    <button
                      type="button"
                      onClick={() => importRef.current?.click()}
                      className={`${btnOutlineCls} w-full`}
                    >
                      <i className="fa fa-upload" aria-hidden="true" /> Import JSON
                    </button>
                  </div>
                  <div className={`${cardCls} p-5 text-center`}>
                    <div className="mb-2 text-4xl">🔄</div>
                    <div className="mb-1 font-semibold">Reset to Default</div>
                    <div className="mb-4 text-[13px] text-text-secondary">Reload all original portfolio data</div>
                    <button
                      type="button"
                      onClick={() => {
                        updateProfile({ ...profileSeedData });
                        setPersonalDraft(profileSeedData.personalInfo);
                        toast("Profile reset to original data!", "info");
                      }}
                      className={`${btnDangerCls} w-full justify-center`}
                    >
                      Reset to Defaults
                    </button>
                  </div>

                  <div className={`${cardCls} border-teal/25 p-6 sm:col-span-2 md:col-span-4`}>
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">☁️</div>
                      <div>
                        <div className="mb-1 font-bold text-teal">MongoDB Atlas — Live Backend</div>
                        <div className="text-[13px] leading-relaxed text-text-secondary">
                          All profile changes are saved directly to MongoDB Atlas in real time. Every visitor sees the
                          latest data instantly — no file uploads or deployments needed.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsPrimitive.Content>
            </div>
          </TabsPrimitive.Root>
        </div>
      </div>

      {/* ── Tech dialog ── */}
      <Modal
        open={techDlg.open}
        onOpenChange={(o) => !o && setTechDlg({ open: false, data: null })}
        title={techDlg.data?.name ? "Edit Tech" : "Add Tech"}
        maxWidth="xs"
        footer={
          <>
            <button type="button" onClick={() => setTechDlg({ open: false, data: null })} className={btnDangerCls}>
              Cancel
            </button>
            <button type="button" onClick={saveTech} className={btnPrimaryCls}>
              Save
            </button>
          </>
        }
      >
        {techDlg.data && (
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Tech Name</label>
              <input
                autoFocus
                placeholder="e.g. React Js, TypeScript"
                value={techDlg.data.name}
                onChange={(e) => setTechDlg((p) => ({ ...p, data: { ...p.data, name: e.target.value } }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <input
                placeholder="e.g. Frontend Technologies, Tools & Platforms"
                value={techDlg.data.category}
                onChange={(e) => setTechDlg((p) => ({ ...p, data: { ...p.data, category: e.target.value } }))}
                className={inputCls}
              />
            </div>

            <div className="rounded-lg border border-[rgba(30,27,46,0.08)] p-4">
              <div className="mb-3 text-xs font-semibold text-text-secondary">
                Icon (optional — auto-matched by name if empty)
              </div>

              {techDlg.data.image && (
                <div className="mb-3 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={techDlg.data.image}
                    alt="preview"
                    className="h-11 w-11 rounded border border-[rgba(30,27,46,0.12)] bg-[rgba(30,27,46,0.04)] object-contain p-1"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="flex-1">
                    {techDlg.data.image.startsWith("data:") ? (
                      <>
                        <div className="mb-1 text-[11px] text-[#f59e0b]">Uploaded — stored as base64</div>
                        <button
                          type="button"
                          onClick={() => {
                            const name = techDlg.data.name || "tech-icon";
                            const path = downloadForPublic(techDlg.data.image, "techs", name);
                            setTechDlg((p) => ({ ...p, data: { ...p.data, image: path } }));
                            toast(`Downloaded! FTP to public/images/techs/ → path set: ${path}`);
                          }}
                          className="mr-2 rounded border border-teal/35 px-2 py-0.5 text-[11px] text-teal"
                        >
                          <i className="fa fa-download mr-1 text-[10px]" aria-hidden="true" />
                          Save to public/images/
                        </button>
                      </>
                    ) : (
                      <div className="break-all text-[11px] text-teal">{techDlg.data.image}</div>
                    )}
                    <button
                      type="button"
                      onClick={() => setTechDlg((p) => ({ ...p, data: { ...p.data, image: null } }))}
                      className="mt-0.5 block text-[11px] text-[#ef4444]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-3 flex items-center gap-2">
                <label className={`${btnOutlineCls} cursor-pointer text-xs`}>
                  <input type="file" accept="image/*,.svg" hidden onChange={handleTechImage} />
                  <i className="fa fa-camera" aria-hidden="true" /> Upload Image
                </label>
                <span className="text-[11px] text-[#94a3b8]">Max 1 MB · stored as base64</span>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-[rgba(30,27,46,0.07)]" />
                <span className="text-[11px] text-[#94a3b8]">or use public folder path</span>
                <span className="h-px flex-1 bg-[rgba(30,27,46,0.07)]" />
              </div>

              <input
                placeholder="/images/techs/react.svg"
                value={techDlg.data.image && !techDlg.data.image.startsWith("data:") ? techDlg.data.image : ""}
                onChange={(e) => setTechDlg((p) => ({ ...p, data: { ...p.data, image: e.target.value || null } }))}
                className={inputCls}
              />
              <div className="mt-1.5 text-[11px] text-[#94a3b8]">
                FTP your image to <span className="text-accent">public/images/techs/</span> then type the path here
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Skill dialog ── */}
      <Modal
        open={skillDlg.open}
        onOpenChange={(o) => !o && setSkillDlg((p) => ({ ...p, open: false }))}
        title={skillDlg.editId ? "Edit Skill" : "Add Skill"}
        maxWidth="xs"
        footer={
          <>
            <button type="button" onClick={() => setSkillDlg((p) => ({ ...p, open: false }))} className={btnDangerCls}>
              Cancel
            </button>
            <button type="button" onClick={saveSkill} className={btnPrimaryCls}>
              Save
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Skill name</label>
            <input
              autoFocus
              placeholder="e.g. React, Python, Figma"
              value={skillDlg.value}
              onChange={(e) => setSkillDlg((p) => ({ ...p, value: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && saveSkill()}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Category (for resume grouping)</label>
            <input
              placeholder="e.g. Language, Frameworks & Libraries"
              value={skillDlg.category}
              onChange={(e) => setSkillDlg((p) => ({ ...p, category: e.target.value }))}
              className={inputCls}
            />
            <div className="mt-1.5 text-[11px] text-[#94a3b8]">
              Groups skills together in the resume&apos;s Technical Skills section
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Experience dialog ── */}
      <Modal
        open={expDlg.open}
        onOpenChange={(o) => !o && setExpDlg({ open: false, data: null })}
        title={expDlg.data?.company ? "Edit Experience" : "Add Experience"}
        footer={
          <>
            <button type="button" onClick={() => setExpDlg({ open: false, data: null })} className={btnDangerCls}>
              Cancel
            </button>
            <button type="button" onClick={saveExp} className={btnPrimaryCls}>
              Save
            </button>
          </>
        }
      >
        {expDlg.data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Job Title / Position</label>
              <input
                value={expDlg.data.position || ""}
                onChange={(e) => setExpDlg((p) => ({ ...p, data: { ...p.data, position: e.target.value } }))}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Company / Organization</label>
              <input
                value={expDlg.data.company || ""}
                onChange={(e) => setExpDlg((p) => ({ ...p, data: { ...p.data, company: e.target.value } }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Start Date (e.g. Sep 2023)</label>
              <input
                value={expDlg.data.startDate || ""}
                onChange={(e) => setExpDlg((p) => ({ ...p, data: { ...p.data, startDate: e.target.value } }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input
                value={expDlg.data.endDate || ""}
                onChange={(e) => setExpDlg((p) => ({ ...p, data: { ...p.data, endDate: e.target.value } }))}
                disabled={expDlg.data.current}
                className={`${inputCls} disabled:opacity-50`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={expDlg.data.current || false}
                  onChange={(e) =>
                    setExpDlg((p) => ({
                      ...p,
                      data: { ...p.data, current: e.target.checked, endDate: e.target.checked ? "" : p.data.endDate },
                    }))
                  }
                  className="h-4 w-4 accent-accent"
                />
                Currently working here
              </label>
            </div>
            <div>
              <label className={labelCls}>Technology Stack</label>
              <input
                placeholder="React.js, TypeScript, MUI"
                value={expDlg.data.technology || ""}
                onChange={(e) => setExpDlg((p) => ({ ...p, data: { ...p.data, technology: e.target.value } }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Project Name</label>
              <input
                value={expDlg.data.project || ""}
                onChange={(e) => setExpDlg((p) => ({ ...p, data: { ...p.data, project: e.target.value } }))}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description / Responsibilities</label>
              <textarea
                rows={4}
                value={expDlg.data.description || ""}
                onChange={(e) => setExpDlg((p) => ({ ...p, data: { ...p.data, description: e.target.value } }))}
                className={inputCls}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Education dialog ── */}
      <Modal
        open={eduDlg.open}
        onOpenChange={(o) => !o && setEduDlg({ open: false, data: null })}
        title={eduDlg.data?.institution ? "Edit Education" : "Add Education"}
        footer={
          <>
            <button type="button" onClick={() => setEduDlg({ open: false, data: null })} className={btnDangerCls}>
              Cancel
            </button>
            <button type="button" onClick={saveEdu} className={btnPrimaryCls}>
              Save
            </button>
          </>
        }
      >
        {eduDlg.data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "Institution / University", key: "institution", full: true },
              { label: "Degree (e.g. B.Tech, MBA)", key: "degree" },
              { label: "Field of Study", key: "field" },
              { label: "Start Date", key: "startDate" },
              { label: "End Date", key: "endDate" },
              { label: "Grade / CGPA / Percentage", key: "grade", full: true },
            ].map(({ label, key, full }) => (
              <div key={key} className={full ? "sm:col-span-2" : ""}>
                <label className={labelCls}>{label}</label>
                <input
                  value={eduDlg.data[key] || ""}
                  onChange={(e) => setEduDlg((p) => ({ ...p, data: { ...p.data, [key]: e.target.value } }))}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ── Project dialog ── */}
      <Modal
        open={projDlg.open}
        onOpenChange={(o) => !o && setProjDlg({ open: false, data: null })}
        title={projDlg.data?.name ? "Edit Project" : "Add Project"}
        footer={
          <>
            <button type="button" onClick={() => setProjDlg({ open: false, data: null })} className={btnDangerCls}>
              Cancel
            </button>
            <button type="button" onClick={saveProj} className={btnPrimaryCls}>
              Save
            </button>
          </>
        }
      >
        {projDlg.data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Project Name</label>
              <input
                value={projDlg.data.name || ""}
                onChange={(e) => setProjDlg((p) => ({ ...p, data: { ...p.data, name: e.target.value } }))}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea
                rows={3}
                value={projDlg.data.description || ""}
                onChange={(e) => setProjDlg((p) => ({ ...p, data: { ...p.data, description: e.target.value } }))}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Technologies (comma separated)</label>
              <input
                placeholder="React, Node.js, MongoDB"
                value={projDlg.data.technologies || ""}
                onChange={(e) => setProjDlg((p) => ({ ...p, data: { ...p.data, technologies: e.target.value } }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Live URL</label>
              <input
                value={projDlg.data.liveUrl || ""}
                onChange={(e) => setProjDlg((p) => ({ ...p, data: { ...p.data, liveUrl: e.target.value } }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>GitHub URL</label>
              <input
                value={projDlg.data.githubUrl || ""}
                onChange={(e) => setProjDlg((p) => ({ ...p, data: { ...p.data, githubUrl: e.target.value } }))}
                className={inputCls}
              />
            </div>

            <div className="rounded-lg border border-[rgba(30,27,46,0.08)] p-4 sm:col-span-2">
              <div className="mb-3 text-xs font-semibold text-text-secondary">Project Image</div>
              {projDlg.data.image && (
                <div className="mb-3 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={projDlg.data.image}
                    alt="preview"
                    className="h-[72px] rounded-md border border-[rgba(30,27,46,0.1)] object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="flex-1">
                    {projDlg.data.image.startsWith("data:") ? (
                      <>
                        <div className="mb-1 text-[11px] text-[#f59e0b]">Uploaded — stored as base64</div>
                        <button
                          type="button"
                          onClick={() => {
                            const name = projDlg.data.name || "project-image";
                            const path = downloadForPublic(projDlg.data.image, "projects", name);
                            setProjDlg((p) => ({ ...p, data: { ...p.data, image: path } }));
                            toast(`Downloaded! FTP to public/images/projects/ → path set: ${path}`);
                          }}
                          className="mr-2 rounded border border-teal/35 px-2 py-0.5 text-[11px] text-teal"
                        >
                          <i className="fa fa-download mr-1 text-[10px]" aria-hidden="true" />
                          Save to public/images/
                        </button>
                      </>
                    ) : (
                      <div className="break-all text-[11px] text-teal">{projDlg.data.image}</div>
                    )}
                    <button
                      type="button"
                      onClick={() => setProjDlg((p) => ({ ...p, data: { ...p.data, image: null } }))}
                      className="mt-0.5 block text-[11px] text-[#ef4444]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              <div className="mb-3 flex items-center gap-2">
                <label className={`${btnOutlineCls} cursor-pointer text-xs`}>
                  <input type="file" accept="image/*" hidden onChange={handleProjImage} />
                  <i className="fa fa-camera" aria-hidden="true" /> Upload Image
                </label>
                <span className="text-[11px] text-[#94a3b8]">Max 3 MB · stored as base64</span>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-[rgba(30,27,46,0.07)]" />
                <span className="text-[11px] text-[#94a3b8]">or use public folder path</span>
                <span className="h-px flex-1 bg-[rgba(30,27,46,0.07)]" />
              </div>
              <input
                placeholder="/images/projects/impacteers.jpg"
                value={projDlg.data.image && !projDlg.data.image.startsWith("data:") ? projDlg.data.image : ""}
                onChange={(e) => setProjDlg((p) => ({ ...p, data: { ...p.data, image: e.target.value || null } }))}
                className={inputCls}
              />
              <div className="mt-1.5 text-[11px] text-[#94a3b8]">
                FTP your image to <span className="text-accent">public/images/projects/</span> then type the path here
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Change password dialog ── */}
      <Modal
        open={pwDlg.open}
        onOpenChange={(o) => !o && setPwDlg((p) => ({ ...p, open: false, err: "" }))}
        title="Change Password"
        maxWidth="xs"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPwDlg((p) => ({ ...p, open: false, err: "" }))}
              className={btnDangerCls}
            >
              Cancel
            </button>
            <button type="button" onClick={handleChangePassword} className={btnPrimaryCls}>
              Update
            </button>
          </>
        }
      >
        {pwDlg.err && (
          <div className="mb-4 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.1)] px-3 py-2 text-sm text-[#dc2626]">
            {pwDlg.err}
          </div>
        )}
        <div className="flex flex-col gap-4">
          {[
            { label: "Current Password", key: "current" },
            { label: "New Password", key: "next" },
            { label: "Confirm New Password", key: "confirm" },
          ].map(({ label, key }) => (
            <div key={key} className="relative">
              <label className={labelCls}>{label}</label>
              <input
                type={pwDlg.show ? "text" : "password"}
                value={pwDlg[key]}
                onChange={(e) => setPwDlg((p) => ({ ...p, [key]: e.target.value, err: "" }))}
                className={inputCls}
              />
              {key === "current" && (
                <button
                  type="button"
                  onClick={() => setPwDlg((p) => ({ ...p, show: !p.show }))}
                  className="absolute right-3 top-[34px] text-text-secondary"
                >
                  <i className={`fa ${pwDlg.show ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* ── Toast ── */}
      {snack.open && (
        <div
          className={`fixed bottom-6 right-6 z-[300] rounded-[10px] px-4 py-3 text-sm font-semibold text-white shadow-card-lg ${
            snack.severity === "error" ? "bg-[#ef4444]" : snack.severity === "info" ? "bg-accent" : "bg-teal"
          }`}
        >
          {snack.msg}
        </div>
      )}
    </div>
  );
};

export default Profile;
