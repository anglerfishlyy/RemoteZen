"use client";

import { useRouter } from "next/navigation";
import TeamsPage from "@/components/TeamsPage";
import { AuthGuard } from "@/components/AuthGuard";

export default function Teams() {
  const router = useRouter();

  const handleNavigate = (page: 'landing' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile' | 'teams') => {
    switch (page) {
      case "dashboard":
        router.push("/dashboard");
        break;
      case "tasks":
        router.push("/tasks");
        break;
      case "timer":
        router.push("/timer");
        break;
      case "profile":
        router.push("/profile");
        break;
      case "login":
        router.push("/login");
        break;
      case "landing":
      default:
        router.push("/");
        break;
      case "teams":
        router.push("/teams");
    }
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <AuthGuard>
      <TeamsPage onNavigate={handleNavigate} onLogout={handleLogout} />
    </AuthGuard>
  );
}


