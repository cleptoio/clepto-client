'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useClient } from '@/contexts/ClientContext';
import { createClient } from '@/lib/supabase';
import { Menu, X, LogOut, User, Settings } from 'lucide-react';
import Image from 'next/image';

const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/executions', label: 'Executions' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/projects', label: 'Projects' },
    { href: '/compliance', label: 'Compliance' },
    { href: '/support', label: 'Support' },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { client, clearClientData } = useClient();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        clearClientData();
        router.push('/login');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center space-x-3">
                    <Image
                        src="/clepto-logo.png"
                        alt="Clepto.io"
                        width={40}
                        height={40}
                        className="rounded"
                    />
                    <span className="text-xl font-orbitron font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        Clepto.io
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${pathname === link.href
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                    {/* Desktop User Dropdown */}
                    <div className="hidden md:block">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar>
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {client ? getInitials(client.name) : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{client?.name || 'User'}</p>
                                        <p className="text-xs text-muted-foreground">{client?.email || ''}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-white">
                    <nav className="container mx-auto px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${pathname === link.href
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t">
                            <div className="px-4 py-2 text-sm">
                                <p className="font-medium">{client?.name || 'User'}</p>
                                <p className="text-xs text-muted-foreground">{client?.email || ''}</p>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-destructive"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
