import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user's client
  const { data: userClient } = await supabase
    .from("user_clients")
    .select("client_id, clients(name, email, company)")
    .eq("user_id", user.id)
    .single();

  const client = userClient?.clients as any;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your account details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Client Name
              </p>
              <p className="text-sm">{client?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Email Address
              </p>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Company
              </p>
              <p className="text-sm">{client?.company || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Client ID
              </p>
              <p className="text-sm font-mono text-xs">
                {userClient?.client_id}
              </p>
            </div>
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground">
            To update your profile information, please contact{" "}
            <a
              href="mailto:support@clepto.io"
              className="text-primary hover:underline"
            >
              support@clepto.io
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            View your billing details and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Billing details are managed by your account administrator. For
            billing inquiries, please contact{" "}
            <a
              href="mailto:billing@clepto.io"
              className="text-primary hover:underline"
            >
              billing@clepto.io
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Account security and session information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Account Created
              </p>
              <p className="text-sm">
                {format(new Date(user.created_at), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Sign In
              </p>
              <p className="text-sm">
                {user.last_sign_in_at
                  ? format(new Date(user.last_sign_in_at), "PPp")
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Email Verified
              </p>
              <p className="text-sm">
                {user.email_confirmed_at ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-yellow-600">Not Verified</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                User ID
              </p>
              <p className="text-sm font-mono text-xs">{user.id}</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium">Password Management</p>
            <p className="text-sm text-muted-foreground">
              To change your password, please contact{" "}
              <a
                href="mailto:support@clepto.io"
                className="text-primary hover:underline"
              >
                support@clepto.io
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Session</p>
                <p className="text-sm text-muted-foreground">
                  You are currently signed in
                </p>
              </div>
              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
