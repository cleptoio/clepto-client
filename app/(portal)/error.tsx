'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-600">Portal Error</CardTitle>
          </div>
          <CardDescription>
            Unable to load the client portal. This might be a configuration issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm font-semibold text-red-900 mb-2">Error Details:</p>
            <p className="text-sm text-red-800 font-mono break-all">
              {error.message || 'Unknown error occurred'}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm font-semibold text-yellow-900 mb-2">
              Troubleshooting Steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
              <li>
                <strong>Check Database Migration:</strong>
                <br />
                <span className="text-xs">
                  Run the SQL migration in Supabase:
                  <code className="block mt-1 bg-yellow-100 p-1 rounded">
                    supabase/migrations/002_client_portal_rls.sql
                  </code>
                </span>
              </li>
              <li>
                <strong>Verify Environment Variables:</strong>
                <br />
                <span className="text-xs">
                  Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
                  are set in Vercel
                </span>
              </li>
              <li>
                <strong>Check User-Client Mapping:</strong>
                <br />
                <span className="text-xs">
                  Ensure your user is linked to a client in the user_clients table
                </span>
              </li>
            </ol>
          </div>

          <div className="flex space-x-2">
            <Button onClick={reset} className="flex-1">
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/login')}
              className="flex-1"
            >
              Back to Login
            </Button>
          </div>

          <div className="text-center">
            <a
              href="mailto:support@clepto.io"
              className="text-sm text-primary hover:underline"
            >
              Contact Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
