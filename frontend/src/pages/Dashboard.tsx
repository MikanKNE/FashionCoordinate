// frontend/src/pages/Dashboard.tsx
import { useState } from "react";
import toast from "react-hot-toast";

import Card from "../components/ui/Card";

import CalendarPanel from "../components/CalendarPanel";
import DashboardCoordinationList from "../components/DashboardCoordinationList";
import DashboardItemList from "../components/DashboardItemList";
import Header from "../components/Header"
import UsageHistoryDaily from "../components/UsageHistoryDaily";
import DashboardDeclutterList from "../components/DashboardDeclutterList";

function getTodayLocal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function Dashboard() {
    const today = getTodayLocal();

    // 親で日付を一元管理
    const [selectedDate, setSelectedDate] = useState(today);

    return (
        <>
            <Header />
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">ダッシュボード</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <Card>
                        <CalendarPanel
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                        />
                    </Card>

                    <Card>
                        <UsageHistoryDaily
                            date={selectedDate}
                            onChangeDate={setSelectedDate}
                        />
                    </Card>

                    <Card><DashboardItemList /></Card>
                    <Card><DashboardCoordinationList /></Card>

                    <Card>
                        <DashboardDeclutterList />
                    </Card>
                </div>
            </div>
        </>
    );
}
