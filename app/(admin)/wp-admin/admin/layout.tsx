import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#000F0A] overflow-hidden">
            <Sidebar />
            <main className="flex-1 lg:pl-64 overflow-y-auto">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}