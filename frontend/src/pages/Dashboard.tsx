// frontend/src/pages/Dashboard.tsx
import CalendarPanel from "../components/CalendarPanel";
import ItemListPreview from "../components/ItemListPreview";
import CoordinationListPreview from "../components/CoordinationListPreview";
import Header from "../components/Header"

export default function Dashboard() {
    return (
        <>
            <Header />
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">ダッシュボード</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CalendarPanel />
                    <ItemListPreview />
                    <CoordinationListPreview />
                </div>
            </div>
        </>
    );
}
