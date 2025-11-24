// frontend/src/pages/Dashboard.tsx
import Header from "../components/Header"
import Card from "../components/ui/Card";
import CalendarPanel from "../components/CalendarPanel";
import DashboardItemList from "../components/DashboardItemList";
import DashboardCoordinationList from "../components/DashboardCoordinationList";
import UsageHistoryDaily from "../components/UsageHistoryDaily";

export default function Dashboard() {
    return (
        <>
            <Header />
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">ダッシュボード</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card><CalendarPanel /></Card>
                    <Card><UsageHistoryDaily /></Card>
                    <Card><DashboardItemList /></Card>
                    <Card><DashboardCoordinationList /></Card>
                </div>
            </div>
        </>
    );
}
