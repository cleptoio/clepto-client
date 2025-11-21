'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClient } from '@/contexts/ClientContext';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setClientData } = useClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const supabase = createClient();

            // Sign in
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                throw authError;
            }

            if (!authData.user) {
                throw new Error('Login failed');
            }

            // Fetch client_id from user_clients table
            const { data: userClient, error: userClientError } = await supabase
                .from('user_clients')
                .select('client_id')
                .eq('user_id', authData.user.id)
                .single();

            if (userClientError || !userClient) {
                throw new Error('No client account found for this user');
            }

            // Fetch client details
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', userClient.client_id)
                .single();

            if (clientError || !clientData) {
                throw new Error('Could not fetch client information');
            }

            // Store client data in context
            setClientData(userClient.client_id, clientData);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error: any) {
            setError(error.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <Image
                            src="/clepto-logo.png"
                            alt="Clepto.io"
                            width={120}
                            height={120}
                            className="rounded-lg"
                        />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-orbitron">Clepto.io</CardTitle>
                        <CardDescription className="mt-2 text-base">
                            Welcome to Your Portal
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
