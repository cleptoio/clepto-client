import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  PlayCircle,
  DollarSign,
  Shield,
  HeadphonesIcon,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get client info for the user
  let clientName = "Client";
  try {
    const { data: userClient, error } = await supabase
      .from("user_clients")
      .select("client_id, clients(name)")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user client:", error);
      // If user_clients table doesn't exist or user not linked, show helpful message
      if (error.code === '42P01' || error.code === 'PGRST116') {
        throw new Error(
          "Database not set up. Please run the migration: supabase/migrations/002_client_portal_rls.sql"
        );
      }
    }

    clientName = (userClient?.clients as any)?.name || user.email?.split('@')[0] || "Client";
  } catch (error: any) {
    console.error("Portal layout error:", error);
    // Don't crash the whole app, just log the error and use default name
    clientName = user.email?.split('@')[0] || "Client";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-2xl font-bold text-primary">
              Clepto.io
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/executions"
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Executions</span>
              </Link>
              <Link
                href="/costs"
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                <DollarSign className="h-4 w-4" />
                <span>Costs</span>
              </Link>
              <Link
                href="/compliance"
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Compliance</span>
              </Link>
              <Link
                href="/support"
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                <HeadphonesIcon className="h-4 w-4" />
                <span>Support</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{clientName}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
