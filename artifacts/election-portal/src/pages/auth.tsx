import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Shield, Fingerprint, Lock, User, Hash, ChevronDown, Phone, KeyRound, CheckCircle, RotateCcw, AlertCircle } from "lucide-react";
import { getStates, getDistricts, getTalukas, getVillages } from "@/lib/india-locations";

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

async function apiFetch(path: string, body: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─── OTP Input Component ──────────────────────────────────────────────────────
function OTPInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const arr = digits.map((x, idx) => (idx === i ? d : x));
    onChange(arr.join(""));
    if (d && i < length - 1) refs.current[i + 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted.padEnd(length, "").slice(0, length));
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
            d ? "border-primary bg-primary/5 text-primary" : "border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
          }`}
        />
      ))}
    </div>
  );
}

// ─── OTP Step ────────────────────────────────────────────────────────────────
function OTPStep({
  maskedMobile, devOtp, onVerify, onResend, isLoading,
}: { maskedMobile: string; devOtp?: string; onVerify: (otp: string) => void; onResend: () => void; isLoading: boolean; }) {
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Phone className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">OTP Verification</h3>
        <p className="text-slate-500 text-sm">We sent a 6-digit OTP to</p>
        <p className="font-bold text-slate-800 mt-1">{maskedMobile}</p>
      </div>

      {devOtp && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Dev Mode — No SMS Configured</p>
            <p className="text-sm text-amber-700 mt-0.5">Your OTP is: <strong className="text-lg tracking-widest font-mono">{devOtp}</strong></p>
          </div>
        </div>
      )}

      <OTPInput value={otp} onChange={setOtp} />

      <button
        onClick={() => otp.length === 6 && onVerify(otp)}
        disabled={otp.length !== 6 || isLoading}
        className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-base hover:bg-orange-600 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-5 h-5" />}
        {isLoading ? "Verifying..." : "Verify & Continue"}
      </button>

      <div className="text-center text-sm">
        {seconds > 0 ? (
          <span className="text-slate-400">Resend OTP in <strong className="text-slate-700">{seconds}s</strong></span>
        ) : (
          <button onClick={() => { onResend(); setSeconds(60); setOtp(""); }} className="text-primary font-semibold hover:underline flex items-center gap-1 mx-auto">
            <RotateCcw className="w-4 h-4" /> Resend OTP
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Login ───────────────────────────────────────────────────────────────────
export function Login() {
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [aadhaar, setAadhaar] = useState("");
  const [step, setStep] = useState<"aadhaar" | "otp">("aadhaar");
  const [maskedMobile, setMaskedMobile] = useState("");
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  useEffect(() => { if (isAuthenticated) setLocation("/"); }, [isAuthenticated]);

  const handleSendOTP = async () => {
    if (!/^\d{12}$/.test(aadhaar)) {
      toast({ title: "Invalid Aadhaar", description: "Please enter a valid 12-digit Aadhaar number.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const data = await apiFetch("/api/auth/send-login-otp", { aadhaarNumber: aadhaar });
      setMaskedMobile(data.maskedMobile);
      setDevOtp(data.otp);
      setStep("otp");
      toast({ title: "OTP Sent", description: data.message });
    } catch (err: any) {
      toast({ title: "Failed to send OTP", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (otp: string) => {
    try {
      await login({ data: { aadhaarNumber: aadhaar, otp } as any });
      toast({ title: "Login Successful", description: "Welcome back to the India Election Portal." });
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex">
      <AuthSidebar />
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute top-8 right-8">
          <span className="text-sm text-slate-500">Don't have an account? </span>
          <Link href="/register" className="text-primary font-bold hover:underline">Register here</Link>
        </div>

        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === "aadhaar" ? (
              <motion.div key="aadhaar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Fingerprint className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Secure Login</h2>
                <p className="text-slate-500 mb-8">Enter your Aadhaar number to receive an OTP on your registered mobile.</p>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Aadhaar Number</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text" maxLength={12} inputMode="numeric"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono text-lg tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400"
                        placeholder="12 digit Aadhaar number"
                        value={aadhaar}
                        onChange={e => setAadhaar(e.target.value.replace(/\D/g, ""))}
                        onKeyDown={e => e.key === "Enter" && handleSendOTP()}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={aadhaar.length !== 12 || sending}
                    className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                    {sending ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Phone className="w-5 h-5" />}
                    {sending ? "Sending OTP..." : "Send OTP to Mobile"}
                  </button>

                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                    <Shield className="w-5 h-5 shrink-0 text-blue-500" />
                    OTP will be sent to your Aadhaar-linked mobile number registered with this portal.
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={() => { setStep("aadhaar"); setDevOtp(undefined); }} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-6 transition-colors">
                  ← Back
                </button>
                <OTPStep
                  maskedMobile={maskedMobile}
                  devOtp={devOtp}
                  onVerify={handleVerify}
                  onResend={handleSendOTP}
                  isLoading={isLoggingIn}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Register ────────────────────────────────────────────────────────────────
const inputClass = "w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all";
const selectClass = `${inputClass} appearance-none bg-white text-slate-700 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`;

function SelectField({ label, value, onChange, options, disabled, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; disabled?: boolean; placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <select required className={selectClass} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
          <option value="">{placeholder}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

export function Register() {
  const { register, isRegistering, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<"form" | "otp" | "done">("form");
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState("");

  const [formData, setFormData] = useState({
    name: "", aadhaarNumber: "", voterIdNumber: "", mobileNumber: "",
    dateOfBirth: "", password: "", address: "",
    state: "", district: "", taluka: "", village: "", constituency: "",
  });

  const states = getStates();
  const districts = formData.state ? getDistricts(formData.state) : [];
  const talukas = formData.district ? getTalukas(formData.state, formData.district) : [];
  const villages = formData.taluka ? getVillages(formData.state, formData.district, formData.taluka) : [];

  useEffect(() => { if (isAuthenticated) setLocation("/"); }, [isAuthenticated]);

  const set = (k: string) => (v: string) => setFormData(f => ({ ...f, [k]: v }));

  const handleStateChange = (val: string) => setFormData(f => ({ ...f, state: val, district: "", taluka: "", village: "", address: "", constituency: "" }));
  const handleDistrictChange = (val: string) => setFormData(f => ({ ...f, district: val, taluka: "", village: "", constituency: val }));
  const handleTalukaChange = (val: string) => setFormData(f => ({ ...f, taluka: val, village: "" }));
  const handleVillageChange = (val: string) => setFormData(f => ({
    ...f, village: val,
    address: val ? `${val}, ${f.taluka}, ${f.district}, ${f.state}` : f.address,
  }));

  const validateForm = () => {
    const { name, aadhaarNumber, voterIdNumber, mobileNumber, dateOfBirth, password, address, state, district, taluka, village } = formData;
    if (!name || !aadhaarNumber || !voterIdNumber || !mobileNumber || !dateOfBirth || !password || !address || !state || !district || !taluka || !village) {
      toast({ title: "All fields required", description: "Please fill in all personal and location details.", variant: "destructive" });
      return false;
    }
    if (!/^\d{12}$/.test(aadhaarNumber)) { toast({ title: "Invalid Aadhaar", description: "Aadhaar must be exactly 12 digits.", variant: "destructive" }); return false; }
    if (!/^\d{10}$/.test(mobileNumber)) { toast({ title: "Invalid Mobile", description: "Mobile number must be 10 digits.", variant: "destructive" }); return false; }
    if (password.length < 6) { toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" }); return false; }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;
    setSending(true);
    try {
      const data = await apiFetch("/api/auth/send-otp", { mobileNumber: formData.mobileNumber });
      setDevOtp(data.otp);
      setStep("otp");
      toast({ title: "OTP Sent", description: data.message });
    } catch (err: any) {
      toast({ title: "Failed to send OTP", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleVerifyAndRegister = async (otp: string) => {
    try {
      await register({
        data: {
          name: formData.name, aadhaarNumber: formData.aadhaarNumber,
          voterIdNumber: formData.voterIdNumber, mobileNumber: formData.mobileNumber,
          dateOfBirth: formData.dateOfBirth, password: formData.password,
          address: formData.address, state: formData.state,
          constituency: formData.constituency || formData.district,
          otp,
        } as any
      });
      toast({ title: "Registration Successful!", description: "Welcome to the India Election Portal." });
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
      setStep("form");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mx-auto mb-4">
              <User className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900">Voter Registration</h2>
            <p className="text-slate-500 mt-2">Link your Aadhaar and Voter ID to create a secure digital identity.</p>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mt-6">
              {["Fill Details", "Verify Mobile", "Done"].map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    i === 0 && step === "form" ? "border-primary bg-primary text-white" :
                    i === 1 && step === "otp" ? "border-primary bg-primary text-white" :
                    i === 2 && step === "done" ? "border-green-500 bg-green-500 text-white" :
                    (i === 0 && step !== "form") ? "border-green-500 bg-green-500 text-white" :
                    "border-slate-300 bg-white text-slate-400"
                  }`}>
                    {(i === 0 && step !== "form") || (i === 1 && step === "done") ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    (i === 0 && step === "form") || (i === 1 && step === "otp") ? "text-primary" : "text-slate-400"
                  }`}>{label}</span>
                  {i < 2 && <div className={`w-8 h-0.5 ${i === 0 && step !== "form" ? "bg-green-400" : "bg-slate-200"}`} />}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
              >
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Full Name (As on Aadhaar)</label>
                        <input required type="text" className={inputClass} placeholder="Enter your full name"
                          value={formData.name} onChange={e => set("name")(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Aadhaar Number</label>
                        <input required type="text" maxLength={12} inputMode="numeric" className={`${inputClass} font-mono tracking-widest`} placeholder="12 Digit Number"
                          value={formData.aadhaarNumber} onChange={e => set("aadhaarNumber")(e.target.value.replace(/\D/g, ""))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Voter ID (EPIC) Number</label>
                        <input required type="text" className={`${inputClass} uppercase`} placeholder="e.g. ABC1234567"
                          value={formData.voterIdNumber} onChange={e => set("voterIdNumber")(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Mobile Number <span className="text-primary text-xs">(OTP will be sent here)</span></label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">+91</span>
                          <input required type="text" maxLength={10} inputMode="numeric" className={`${inputClass} pl-12`} placeholder="10 digit mobile"
                            value={formData.mobileNumber} onChange={e => set("mobileNumber")(e.target.value.replace(/\D/g, ""))} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                        <input required type="date" className={`${inputClass} text-slate-700`}
                          value={formData.dateOfBirth} onChange={e => set("dateOfBirth")(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Residential Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <SelectField label="State / Union Territory" value={formData.state} onChange={handleStateChange} options={states} placeholder="— Select State —" />
                      <SelectField label="District" value={formData.district} onChange={handleDistrictChange} options={districts} disabled={!formData.state} placeholder={formData.state ? "— Select District —" : "Select state first"} />
                      <SelectField label="Taluka / Sub-District" value={formData.taluka} onChange={handleTalukaChange} options={talukas} disabled={!formData.district} placeholder={formData.district ? "— Select Taluka —" : "Select district first"} />
                      <SelectField label="Village / Town / Ward" value={formData.village} onChange={handleVillageChange} options={villages} disabled={!formData.taluka} placeholder={formData.taluka ? "— Select Village —" : "Select taluka first"} />
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Full Address</label>
                        <textarea required rows={2} className={`${inputClass} resize-none`} placeholder="House No., Street, Area..."
                          value={formData.address} onChange={e => set("address")(e.target.value)} />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Constituency</label>
                        <input type="text" className={inputClass} placeholder="Your parliamentary/assembly constituency"
                          value={formData.constituency} onChange={e => set("constituency")(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Account Security</h3>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Create Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input required type="password" className={`${inputClass} pl-10`} placeholder="Minimum 6 characters"
                          value={formData.password} onChange={e => set("password")(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link href="/login" className="text-sm text-slate-500 hover:text-primary font-medium">
                      Already registered? Login
                    </Link>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={sending}
                      className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-orange-600 focus:ring-4 focus:ring-primary/20 transition-all shadow-lg shadow-primary/25 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {sending ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Phone className="w-5 h-5" />}
                      {sending ? "Sending OTP..." : "Verify Mobile & Continue"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-md mx-auto"
              >
                <button onClick={() => setStep("form")} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-6">
                  ← Back to form
                </button>
                <OTPStep
                  maskedMobile={`+91-XXXXXX${formData.mobileNumber.slice(-4)}`}
                  devOtp={devOtp}
                  onVerify={handleVerifyAndRegister}
                  onResend={handleSendOTP}
                  isLoading={isRegistering}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AuthSidebar() {
  return (
    <div className="hidden lg:flex w-2/5 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
      <div className="absolute inset-0 z-0">
        <img src={`${import.meta.env.BASE_URL}images/auth-bg.png`} alt="Pattern" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent mix-blend-overlay" />
        {/* Indian flag tricolor accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
      </div>
      <div className="relative z-10">
        <Link href="/" className="inline-block bg-white/10 backdrop-blur-sm p-3 rounded-2xl mb-12 border border-white/10 hover:bg-white/20 transition-colors">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10" />
        </Link>
        <h1 className="text-4xl font-display font-bold text-white mb-6 leading-snug">
          The foundation of democracy is a <span className="text-primary">secure vote</span>.
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
          Aadhaar-linked OTP authentication ensures every citizen gets exactly one vote, eliminating fraud and strengthening the electoral process.
        </p>
      </div>
      <div className="relative z-10 flex items-center space-x-4 text-slate-400 text-sm bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <Shield className="w-8 h-8 text-green-400 shrink-0" />
        <p>OTP verified. End-to-end encrypted. Your voting choices remain strictly confidential and anonymized.</p>
      </div>
    </div>
  );
}
