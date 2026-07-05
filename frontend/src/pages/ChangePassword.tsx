import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../api/auth";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.old_password || !form.new_password || !form.new_password_confirm) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.new_password !== form.new_password_confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(form);
      toast.success("Password changed successfully!");
      navigate("/profile");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to change password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Change Password</h2>
        <p className="mt-1 text-sm text-gray-500">Update your account password</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type={show ? "text" : "password"}
              value={form.old_password}
              onChange={(e) => setForm({ ...form, old_password: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative mt-1">
              <input
                type={show ? "text" : "password"}
                value={form.new_password}
                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="Min. 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type={show ? "text" : "password"}
              value={form.new_password_confirm}
              onChange={(e) => setForm({ ...form, new_password_confirm: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Password"}
        </button>
      </form>
    </div>
  );
}
