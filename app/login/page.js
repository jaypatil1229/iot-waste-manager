"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function page() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false, // Don't redirect automatically
    });
    console.log(res);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      // Redirect to a protected page after successful login
      router.push("/");
    }
  };

  return (
    <div className="container w-full h-full flex items-center justify-center">
      <div className="bg-white p-4 rounded-3xl flex flex-col gap-1">
        <h1 className="text-xl text-center font-bold mb-4">Login</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 px-1">
              Email
            </label>
            <input
              onChange={handleChange}
              type="email"
              className="w-72 px-3 py-2 border border-gray-300 rounded-2xl"
              placeholder="Enter your email"
              required
              name="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 px-1">
              Password
            </label>
            <input
              onChange={handleChange}
              type="password"
              className="w-72 px-3 py-2 border border-gray-300 rounded-2xl"
              placeholder="Enter your password"
              required
              name="password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-2xl hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
