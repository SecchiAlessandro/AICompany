import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  PlusCircle,
  Activity,
  FolderOpen,
  History,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useWebSocketStore } from "@/stores/websocketStore";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/workflows", icon: GitBranch, label: "Workflows" },
  { to: "/workflows/new", icon: PlusCircle, label: "New Workflow" },
  { to: "/monitor", icon: Activity, label: "Monitor" },
  { to: "/results", icon: FolderOpen, label: "Outputs" },
  { to: "/history", icon: History, label: "History" },
];

export default function Sidebar() {
  const connected = useWebSocketStore((s) => s.connected);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
          <GitBranch className="h-4 w-4 text-emerald-400" />
        </div>
        <span className="font-semibold text-zinc-100">AICompany</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Connection status */}
      <div className="border-t border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2 text-xs">
          {connected ? (
            <>
              <Wifi className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-zinc-500" />
              <span className="text-zinc-500">Disconnected</span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
