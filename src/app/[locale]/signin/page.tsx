"use client";

import { useState } from "react";
import { login } from "@/lib/actions";
import { useRouter } from "@/i18n/routing";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      if (res.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded-lg p-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <button type="submit" className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90">Sign In</button>
        </form>
        <p className="mt-4 text-sm text-center">
          Don't have an account? <a href="/signup" className="text-primary hover:underline">Sign Up</a>
        </p>
        
        <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs">
          <p className="font-bold mb-2">Demo Accounts:</p>
          <ul className="space-y-1">
            <li>Admin: admin@carrelais.com / password</li>
            <li>Dealer: dealer@example.com / password</li>
            <li>User: user@example.com / password</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
