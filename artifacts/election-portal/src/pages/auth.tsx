import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Shield, Fingerprint, Lock, User, Hash, ChevronDown } from "lucide-react";
import { getStates, getDistricts, getTalukas, getVillages } from "@/lib/india-locations";

export function Login() {
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({ aadhaarNumber: "", password: "" });

  useEffect(() => {
    if (isAuthenticated) setLocation("/");
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ data: formData });
      toast({ title: "Login successful", description: "Welcome back to the portal." });
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" });
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Fingerprint className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 mb-8">Sign in with your Aadhaar credential to access the voting booth.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Aadhaar Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text" required maxLength={12} inputMode="numeric"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono text-lg tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400"
                    placeholder="12 digit number"
                    value={formData.aadhaarNumber}
                    onChange={e => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="password" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-slate-900/20"
              >
                {isLoggingIn ? "Authenticating..." : "Secure Login"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.state || !formData.district || !formData.taluka || !formData.village) {
      toast({ title: "Location required", description: "Please select your State, District, Taluka and Village.", variant: "destructive" });
      return;
    }
    try {
      await register({
        data: {
          name: formData.name,
          aadhaarNumber: formData.aadhaarNumber,
          voterIdNumber: formData.voterIdNumber,
          mobileNumber: formData.mobileNumber,
          dateOfBirth: formData.dateOfBirth,
          password: formData.password,
          address: formData.address,
          state: formData.state,
          constituency: formData.constituency || formData.district,
        }
      });
      toast({ title: "Registration successful!", description: "Welcome to the India Election Portal." });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Please check your inputs", variant: "destructive" });
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
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <form onSubmit={handleSubmit} className="space-y-6">

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
                    <label className="text-sm font-semibold text-slate-700">Mobile Number</label>
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
                  type="submit"
                  disabled={isRegistering}
                  className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-orange-600 focus:ring-4 focus:ring-primary/20 transition-all shadow-lg shadow-primary/25 disabled:opacity-70"
                >
                  {isRegistering ? "Registering..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </motion.div>
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
          Aadhaar-linked authentication ensures every citizen gets exactly one vote, eliminating fraud and strengthening the electoral process.
        </p>
      </div>
      <div className="relative z-10 flex items-center space-x-4 text-slate-400 text-sm bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <Shield className="w-8 h-8 text-green-400 shrink-0" />
        <p>End-to-end encrypted. Your voting choices remain strictly confidential and anonymized.</p>
      </div>
    </div>
  );
}
