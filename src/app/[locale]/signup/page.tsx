"use client";

import { useState } from "react";
import { signup } from "@/lib/actions";
import { useRouter } from "@/i18n/routing";

export default function SignUpPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"INDIVIDUAL" | "DEALERSHIP">("INDIVIDUAL");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    dealershipName: "",
    location: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signup({ ...formData, accountType });
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "Signup failed");
    }
  };

  const handleLink = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/signin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        
        <div className="flex gap-4 mb-6">
          <button 
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${accountType === "INDIVIDUAL" ? "border-primary bg-primary/10 text-primary" : "border-zinc-200 dark:border-zinc-700"}`}
            onClick={() => setAccountType("INDIVIDUAL")}
          >
            Individual
          </button>
          <button 
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${accountType === "DEALERSHIP" ? "border-primary bg-primary/10 text-primary" : "border-zinc-200 dark:border-zinc-700"}`}
            onClick={() => setAccountType("DEALERSHIP")}
          >
            Dealership
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input type="text" required className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input type="text" required className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" required className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          
          {accountType === "DEALERSHIP" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Dealership Name</label>
                <input type="text" required className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" value={formData.dealershipName} onChange={e => setFormData({...formData, dealershipName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dealership Location</label>
                <input type="text" required className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          
          <button type="submit" className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 mt-4">Create Account</button>
        </form>
        
        <p className="mt-4 text-sm text-center">
          Already have an account? <a href="/signin" onClick={handleLink} className="text-primary hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  );
}
