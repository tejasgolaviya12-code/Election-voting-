import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Shield, Fingerprint, Lock, Phone, User, Calendar, MapPin, Hash } from "lucide-react";

export function Login() {
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ aadhaarNumber: '', password: '' });

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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono text-lg tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400"
                    placeholder="12 digit number"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

export function Register() {
  const { register, isRegistering } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '', aadhaarNumber: '', voterIdNumber: '', mobileNumber: '', 
    dateOfBirth: '', state: '', constituency: '', address: '', password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ data: formData });
      toast({ title: "Registration successful", description: "You can now participate in elections." });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Please check your inputs", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-slate-900">Voter Registration</h2>
            <p className="text-slate-500 mt-2">Link your Aadhaar and Voter ID to create a secure digital identity.</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Full Name (As on Aadhaar)</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary outline-none transition-all"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Aadhaar Number</label>
                  <input required type="text" maxLength={12} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary outline-none transition-all font-mono"
                    placeholder="12 Digits"
                    value={formData.aadhaarNumber} onChange={e => setFormData({...formData, aadhaarNumber: e.target.value.replace(/\D/g, '')})} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Voter ID (EPIC) Number</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary outline-none transition-all uppercase"
                    value={formData.voterIdNumber} onChange={e => setFormData({...formData, voterIdNumber: e.target.value})} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Mobile Number</label>
                  <input required type="text" maxLength={10} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary outline-none transition-all"
                    value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value.replace(/\D/g, '')})} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                  <input required type="date" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary outline-none transition-all text-slate-700"
                    value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">State</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary outline-none transition-all"
                    value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Constituency</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary outline-none transition-all"
                  value={formData.constituency} onChange={e => setFormData({...formData, constituency: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Residential Address</label>
                <textarea required rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary outline-none transition-all resize-none"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-6">
                <label className="text-sm font-semibold text-slate-700">Create Password</label>
                <input required type="password" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary outline-none transition-all"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Link href="/login" className="text-sm text-slate-500 hover:text-primary font-medium">
                  Already registered? Login
                </Link>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="px-8 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all shadow-lg shadow-primary/25 disabled:opacity-70"
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
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
          alt="Pattern" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent mix-blend-overlay"></div>
      </div>
      
      <div className="relative z-10">
        <Link href="/" className="inline-block bg-white/10 backdrop-blur-sm p-3 rounded-2xl mb-12 border border-white/10 hover:bg-white/20 transition-colors">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10" />
        </Link>
        <h1 className="text-4xl font-display font-bold text-white mb-6 leading-snug">
          The foundation of democracy is a <span className="text-primary">secure vote</span>.
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
          Aadhaar-linked biometric authentication ensures every citizen gets exactly one vote, eliminating fraud and strengthening the electoral process.
        </p>
      </div>

      <div className="relative z-10 flex items-center space-x-4 text-slate-400 text-sm bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <Shield className="w-8 h-8 text-green-400" />
        <p>End-to-end encrypted. Your voting choices remain strictly confidential and anonymized.</p>
      </div>
    </div>
  );
}
