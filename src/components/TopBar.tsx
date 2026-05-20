import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, Bell, LogOut, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVitalyn } from "@/hooks/useVitalynStore";

export function TopBar({ subtitle }: { subtitle?: string }) {
  const { user, logout } = useVitalyn();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-lg bg-gradient-hero text-white shadow-sm">
            <Activity className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Vitalyn</div>
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground">
                  <User2 className="size-4" />
                </span>
                <span className="hidden text-sm sm:block">
                  {user?.fullName || user?.ward || user?.email || "Guest"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm font-medium">{user?.fullName || user?.ward}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
                <div className="mt-1 text-xs capitalize text-primary">{user?.role}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
