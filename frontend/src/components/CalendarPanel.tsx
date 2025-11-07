// frontend/src/components/CalendarPanel.tsx
import { useState } from "react";

export default function CalendarPanel() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date | null>(today);

    // 同じ日かどうかを比較
    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    // カレンダー生成
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

    const startDay = firstDayOfMonth.getDay(); // 月初の曜日
    const totalDays = 42; // 7×6 のグリッドに合わせる

    const calendarDays = Array.from({ length: totalDays }, (_, i) => {
        const dayOffset = i - startDay + 1;
        const date = new Date(currentYear, currentMonth, dayOffset);
        return date;
    });

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentYear, currentMonth + offset, 1);
        setCurrentMonth(newDate.getMonth());
        setCurrentYear(newDate.getFullYear());
    };

    return (
        <div className="bg-white rounded-2xl shadow p-4">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-3">
                <button
                    onClick={() => changeMonth(-1)}
                    className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                    ◁
                </button>
                <h2 className="text-lg font-semibold">
                    {currentYear}年 {currentMonth + 1}月
                </h2>
                <button
                    onClick={() => changeMonth(1)}
                    className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                    ▷
                </button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-1 text-center text-gray-600 mb-1">
                {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                    <div key={d} className="font-medium">
                        {d}
                    </div>
                ))}
            </div>

            {/* カレンダー */}
            <div className="grid grid-cols-7 gap-2 text-center">
                {calendarDays.map((d) => {
                    const isCurrentMonth = d.getMonth() === currentMonth;
                    const isToday = isSameDay(d, today);
                    const isSelected =
                        selectedDate && isSameDay(d, selectedDate);

                    return (
                        <button
                            key={d.toISOString()}
                            onClick={() => setSelectedDate(d)}
                            className={`p-2 rounded-xl transition font-medium ${isToday
                                ? "bg-blue-200 text-blue-900 font-semibold"
                                : isSelected
                                    ? "bg-blue-100 text-blue-700"
                                    : !isCurrentMonth
                                        ? "text-gray-400 hover:bg-gray-50"
                                        : "hover:bg-gray-50"
                                }`}
                        >
                            {d.getDate()}
                        </button>
                    );
                })}
            </div>

            {/* 選択日 */}
            <p className="mt-3 text-sm text-gray-600">
                選択日:{" "}
                {selectedDate
                    ? selectedDate.toLocaleDateString()
                    : "なし"}
            </p>
        </div>
    );
}
