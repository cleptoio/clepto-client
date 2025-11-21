'use client';

import { useEffect, useState } from 'react';
import { useClient } from '@/contexts/ClientContext';
import { createClient } from '@/lib/supabase';
import { SubProcessor, DPASignature } from '@/types/database';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Download, FileText, Users, Info } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function CompliancePage() {
    const { clientId, isLoading: clientLoading } = useClient();
    const [subProcessors, setSubProcessors] = useState<SubProcessor[]>([]);
    const [dpaSignature, setDPASignature] = useState<DPASignature | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!clientLoading && clientId) {
            fetchComplianceData();
        }
    }, [clientId, clientLoading]);

    const fetchComplianceData = async () => {
        if (!clientId) return;

        try {
            const supabase = createClient();

            // Fetch sub-processors
            const { data: subProcessorsData } = await supabase
                .from('sub_processors')
                .select('*')
                .order('name');

            // Fetch DPA signature
            const { data: dpaData } = await supabase
                .from('dpa_signatures')
                .select('*')
                .eq('client_id', clientId)
                .single();

            setSubProcessors(subProcessorsData || []);
            setDPASignature(dpaData);
        } catch (error) {
            console.error('Error fetching compliance data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (clientLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Skeleton className="h-12 w-64 mb-8" />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Compliance & Privacy</h1>
                        <p className="text-muted-foreground">Your data protection and compliance information</p>
                    </div>
                </div>

                <Tabs defaultValue="privacy" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                        <TabsTrigger value="dpa">Data Processing Agreement</TabsTrigger>
                        <TabsTrigger value="processors">Sub-Processors</TabsTrigger>
                        <TabsTrigger value="rights">Your Data Rights</TabsTrigger>
                    </TabsList>

                    <TabsContent value="privacy">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Privacy Policy
                                </CardTitle>
                                <CardDescription>
                                    How Clepto.io protects and handles your data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="prose max-w-none">
                                <h3>1. Data Collection and Use</h3>
                                <p>
                                    Clepto.io collects and processes client data solely for the purpose of providing AI automation services. We are committed to protecting your privacy and ensuring GDPR compliance.
                                </p>

                                <h3>2. Data Storage and Security</h3>
                                <p>
                                    All client data is encrypted at rest and in transit. We use industry-standard security measures to protect your information from unauthorized access, disclosure, or destruction.
                                </p>

                                <h3>3. GDPR Compliance</h3>
                                <p>
                                    As a data processor, Clepto.io is fully compliant with the General Data Protection Regulation (GDPR). We process data only as instructed by our clients and maintain appropriate technical and organizational measures.
                                </p>

                                <h3>4. Data Retention</h3>
                                <p>
                                    Workflow execution data is retained for 90 days unless otherwise specified in your contract. You may request deletion of your data at any time through the Data Rights section.
                                </p>

                                <h3>5. Third-Party Services</h3>
                                <p>
                                    We use carefully vetted sub-processors to deliver our services. See the Sub-Processors tab for a complete list of third parties that may process your data.
                                </p>

                                <h3>6. Your Rights</h3>
                                <p>
                                    Under GDPR, you have the right to access, rectify, erase, restrict processing, data portability, and object to processing of your personal data. See the Data Rights tab for more information.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="dpa">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Data Processing Agreement
                                </CardTitle>
                                <CardDescription>
                                    Your signed DPA with Clepto.io
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {dpaSignature ? (
                                    <div className="space-y-4">
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>DPA Active</AlertTitle>
                                            <AlertDescription>
                                                Your Data Processing Agreement is active and compliant with GDPR requirements.
                                            </AlertDescription>
                                        </Alert>

                                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-100 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium">Signed At</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDateTime(dpaSignature.signed_at)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">IP Address</p>
                                                <p className="text-sm text-muted-foreground">{dpaSignature.ip_address}</p>
                                            </div>
                                        </div>

                                        <Button>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download DPA (PDF)
                                        </Button>
                                    </div>
                                ) : (
                                    <Alert>
                                        <AlertDescription>
                                            No DPA signature found. Please contact support to set up your Data Processing Agreement.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="processors">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Sub-Processors
                                </CardTitle>
                                <CardDescription>
                                    Third-party services that process your data
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {subProcessors.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        No sub-processors configured
                                    </p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Service</TableHead>
                                                <TableHead>Purpose</TableHead>
                                                <TableHead>Location</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subProcessors.map((processor) => (
                                                <TableRow key={processor.id}>
                                                    <TableCell className="font-medium">{processor.name}</TableCell>
                                                    <TableCell>{processor.service}</TableCell>
                                                    <TableCell>{processor.purpose}</TableCell>
                                                    <TableCell>{processor.location}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="rights">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Your Data Rights
                                </CardTitle>
                                <CardDescription>
                                    Exercise your GDPR rights
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2">Right to Access</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        You have the right to request a copy of all personal data we hold about you.
                                    </p>
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Request My Data
                                    </Button>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Right to Rectification</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        You have the right to request correction of inaccurate personal data.
                                    </p>
                                    <Button variant="outline">Update My Information</Button>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Right to Erasure</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        You have the right to request deletion of your personal data under certain conditions.
                                    </p>
                                    <Button variant="destructive">Delete My Account</Button>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Right to Data Portability</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        You have the right to receive your personal data in a structured, commonly used format.
                                    </p>
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export My Data
                                    </Button>
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Questions?</AlertTitle>
                                    <AlertDescription>
                                        If you have questions about your data rights or wish to exercise them, please contact our support team.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
