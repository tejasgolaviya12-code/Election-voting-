import { useAuth } from "@/hooks/use-auth";
import { maskAadhaar } from "@/lib/utils";
import { User, Shield, CreditCard, Phone, MapPin, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading || !user) {
    return <div className="p-20 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900">Voter Profile</h1>
        <p className="text-slate-500">Your digital electoral identity details</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Shield className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex items-center">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg mr-6 flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-400">
                <User className="w-10 h-10" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
              <div className="flex items-center text-slate-300">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 mr-3">
                  <CheckCircle className="w-3 h-3 mr-1" /> Verified Voter
                </span>
                <span>Role: <span className="capitalize">{user.role}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Identity Credentials</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailItem icon={CreditCard} label="Aadhaar Number" value={maskAadhaar(user.aadhaarNumber)} isMono />
            <DetailItem icon={Shield} label="Voter ID (EPIC)" value={user.voterIdNumber} isMono />
            <DetailItem icon={Phone} label="Registered Mobile" value={`+91 ${user.mobileNumber}`} isMono />
            <DetailItem icon={Calendar} label="Date of Birth" value={user.dateOfBirth ? format(new Date(user.dateOfBirth), 'dd MMMM yyyy') : 'N/A'} />
          </div>

          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 mt-10">Constituency Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailItem icon={MapPin} label="State" value={user.state || 'N/A'} />
            <DetailItem icon={MapPin} label="Constituency" value={user.constituency || 'N/A'} />
            <div className="md:col-span-2">
              <DetailItem icon={MapPin} label="Registered Address" value={user.address || 'N/A'} />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center text-sm text-slate-500">
          Account created on {format(new Date(user.createdAt), 'dd MMM yyyy')}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, isMono = false }: { icon: any, label: string, value: string, isMono?: boolean }) {
  return (
    <div className="flex items-start">
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mr-4 border border-slate-100">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-0.5">{label}</p>
        <p className={`text-base font-semibold text-slate-900 ${isMono ? 'font-mono tracking-wide' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
