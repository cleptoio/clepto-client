'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Client } from '@/types/database';
import { useRouter } from 'next/navigation';

interface ClientContextType {
    clientId: string | null;
    client: Client | null;
    setClientData: (clientId: string, client: Client) => void;
    clearClientData: () => void;
    isLoading: boolean;
}

const ClientContext = createContext<ClientContextType>({
    clientId: null,
    client: null,
    setClientData: () => { },
    clearClientData: () => { },
    isLoading: true,
});

export function ClientProvider({ children }: { children: React.ReactNode }) {
    const [clientId, setClientId] = useState<string | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Fetch client_id from user_clients table
                const { data: userClient } = await supabase
                    .from('user_clients')
                    .select('client_id')
                    .eq('user_id', session.user.id)
                    .single();

                if (userClient?.client_id) {
                    // Fetch client details
                    const { data: clientData } = await supabase
                        .from('clients')
                        .select('*')
                        .eq('id', userClient.client_id)
                        .single();

                    if (clientData) {
                        setClientId(userClient.client_id);
                        setClient(clientData);
                    }
                }
            }

            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const setClientData = (newClientId: string, newClient: Client) => {
        setClientId(newClientId);
        setClient(newClient);
    };

    const clearClientData = () => {
        setClientId(null);
        setClient(null);
    };

    return (
        <ClientContext.Provider value={{ clientId, client, setClientData, clearClientData, isLoading }}>
            {children}
        </ClientContext.Provider>
    );
}

export function useClient() {
    const context = useContext(ClientContext);
    if (context === undefined) {
        throw new Error('useClient must be used within a ClientProvider');
    }
    return context;
}
