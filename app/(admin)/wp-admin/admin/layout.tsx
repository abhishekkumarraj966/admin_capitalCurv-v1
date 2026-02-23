import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen overflow-hidden" style={{ backgroundColor: '#191A1F' }}>
            <Sidebar />
            <main className="flex-1 lg:pl-64 overflow-y-auto">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}