import { useAdminGetUsers, useAdminUpdateUser, useAdminDeleteUser } from "@workspace/api-client-react";
import { maskAadhaar } from "@/lib/utils";
import { Shield, User, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { data: users, refetch, isLoading } = useAdminGetUsers();
  const updateRoleMutation = useAdminUpdateUser({ onSuccess: refetch });
  const deleteMutation = useAdminDeleteUser({ onSuccess: refetch });
  const { toast } = useToast();

  const handleRoleToggle = (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'voter' : 'admin';
    updateRoleMutation.mutate({ id: userId, data: { role: newRole as any } });
    toast({ title: "Role updated", description: `User is now ${newRole}` });
  };

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Manage Users</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Identifiers</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users?.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.mobileNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono text-slate-600">{maskAadhaar(user.aadhaarNumber)}</div>
                    <div className="text-xs text-slate-500">{user.voterIdNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleRoleToggle(user.id, user.role)}
                      disabled={updateRoleMutation.isPending}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                      {user.role}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        if (confirm(`Delete user ${user.name}? This is irreversible.`)) {
                          deleteMutation.mutate({ id: user.id });
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
