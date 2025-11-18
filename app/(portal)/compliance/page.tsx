import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, FileText, Download, Mail } from "lucide-react";
import Link from "next/link";

export default async function CompliancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Mock sub-processors data (in production, this would come from database)
  const subProcessors = [
    {
      name: "OpenAI",
      service: "AI Language Models",
      location: "United States",
      status: "Active",
    },
    {
      name: "Anthropic",
      service: "AI Language Models",
      location: "United States",
      status: "Active",
    },
    {
      name: "Google Cloud",
      service: "AI Language Models",
      location: "United States",
      status: "Active",
    },
    {
      name: "Amazon Web Services",
      service: "Cloud Infrastructure",
      location: "United States",
      status: "Active",
    },
    {
      name: "Supabase",
      service: "Database & Authentication",
      location: "United States",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Compliance & Transparency
        </h1>
        <p className="text-muted-foreground">
          View our data processing agreements, sub-processors, and compliance
          information
        </p>
      </div>

      {/* Data Processing Agreement */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Data Processing Agreement (DPA)</CardTitle>
          </div>
          <CardDescription>
            Our agreement outlining data processing responsibilities and
            commitments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Agreement Status
              </p>
              <p className="text-sm font-semibold text-green-600">Active & Signed</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Signed Date
              </p>
              <p className="text-sm">January 15, 2025</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <p className="text-sm">v2.1</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-sm">January 10, 2025</p>
            </div>
          </div>
          <Separator />
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              View DPA
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sub-Processors */}
      <Card>
        <CardHeader>
          <CardTitle>Sub-Processors</CardTitle>
          <CardDescription>
            Third-party service providers who process data on our behalf
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider Name</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subProcessors.map((processor) => (
                <TableRow key={processor.name}>
                  <TableCell className="font-medium">{processor.name}</TableCell>
                  <TableCell>{processor.service}</TableCell>
                  <TableCell>{processor.location}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                      {processor.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Last updated: November 18, 2025
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You will be notified via email 30 days before any new sub-processor
              is added.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Cookie Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Privacy Policy</p>
              <p className="text-sm text-muted-foreground">
                Last updated: January 1, 2025
              </p>
            </div>
            <Button variant="outline" size="sm">
              View Policy
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Cookie Policy</p>
              <p className="text-sm text-muted-foreground">
                Last updated: January 1, 2025
              </p>
            </div>
            <Button variant="outline" size="sm">
              View Policy
            </Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Terms of Service</p>
              <p className="text-sm text-muted-foreground">
                Last updated: January 1, 2025
              </p>
            </div>
            <Button variant="outline" size="sm">
              View Terms
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Subject Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data Rights</CardTitle>
          <CardDescription>
            Under GDPR and DPDP regulations, you have the following rights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Right to Access:</strong> Request a copy of your personal data
            </p>
            <p className="text-sm">
              <strong>Right to Rectification:</strong> Request correction of
              inaccurate data
            </p>
            <p className="text-sm">
              <strong>Right to Erasure:</strong> Request deletion of your data
              (&quot;right to be forgotten&quot;)
            </p>
            <p className="text-sm">
              <strong>Right to Data Portability:</strong> Receive your data in a
              structured format
            </p>
            <p className="text-sm">
              <strong>Right to Object:</strong> Object to processing of your data
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium">Exercise Your Rights:</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/support">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Request Data Access
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Request Data Deletion
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Contact DPO
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Access */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log & Execution History</CardTitle>
          <CardDescription>
            Full transparency into all workflow executions and data processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You have access to a complete audit trail of all workflow executions,
            including timestamps, inputs, outputs, and AI models used.
          </p>
          <Link href="/executions">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              View Execution History
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
