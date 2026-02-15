import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen overflow-hidden" style={{ background: 'linear-gradient(264.84deg, #037260 6.78%, #036958 24.2%, #024C40 55.04%, #023B32 91.68%)' }}>
            <Sidebar />
            <main className="flex-1 lg:pl-64 overflow-y-auto">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}