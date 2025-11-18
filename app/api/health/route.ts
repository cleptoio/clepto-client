import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    database: {
      connected: false,
      userClientsTable: false,
      supportTicketsTable: false,
      error: null as string | null,
    },
    status: "unknown",
  };

  // Check environment variables
  if (!checks.environment.supabaseUrl || !checks.environment.supabaseAnonKey) {
    checks.status = "error";
    return NextResponse.json(
      {
        ...checks,
        message: "Missing required environment variables",
      },
      { status: 500 }
    );
  }

  // Check database connection and tables
  try {
    const supabase = await createClient();

    // Try to query user_clients table
    const { error: userClientsError } = await supabase
      .from("user_clients")
      .select("id")
      .limit(1);

    if (!userClientsError) {
      checks.database.userClientsTable = true;
    } else if (userClientsError.code === "42P01") {
      checks.database.error = "user_clients table does not exist. Run migration.";
    }

    // Try to query support_tickets table
    const { error: ticketsError } = await supabase
      .from("support_tickets")
      .select("id")
      .limit(1);

    if (!ticketsError) {
      checks.database.supportTicketsTable = true;
    }

    checks.database.connected = true;

    if (checks.database.userClientsTable && checks.database.supportTicketsTable) {
      checks.status = "healthy";
    } else {
      checks.status = "partial";
    }
  } catch (error: any) {
    checks.database.error = error.message;
    checks.status = "error";
  }

  return NextResponse.json(checks, {
    status: checks.status === "healthy" ? 200 : checks.status === "partial" ? 206 : 500,
  });
}
