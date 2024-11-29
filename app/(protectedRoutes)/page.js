"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Dashboard from "../components/Dashboard";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/login"); // Redirect to login page if not authenticated
    return null;
  }

  return (
    <main className="w-5/6 flex gap-3 h-full overflow-x-hidden">
      <Dashboard />
    </main>
  );
}
