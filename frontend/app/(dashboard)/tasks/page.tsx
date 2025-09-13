"use client";

import { useRouter } from "next/navigation";
import TasksPage from "@/components/TasksPage";
import { AuthGuard } from "@/components/AuthGuard";

export default function Tasks() {
  const router = useRouter();

  const handleNavigate = (page: 'landing' | 'analytics' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile') => {
    switch (page) {
      case "dashboard":
        router.push("/dashboard");
        break;
      case "analytics":
        router.push("/analytics");
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
    }
  };

  const handleLogout = () => {
    // clear auth state, cookies, etc.
    router.push("/login");
  };

  return (
    <AuthGuard>
      <TasksPage onNavigate={handleNavigate} onLogout={handleLogout} />
    </AuthGuard>
  );
}
