// frontend/src/components/CalendarPanel.tsx
import { useState } from "react";

function formatDateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarPanel({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: string;
  onSelectDate: (d: string) => void;
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDay = firstDayOfMonth.getDay();
  const totalDays = 42;
  const calendarDays = Array.from({ length: totalDays }, (_, i) => {
    const dayOffset = i - startDay + 1;
    return new Date(currentYear, currentMonth, dayOffset);
  });

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const handleClick = (d: Date) => {
    const iso = formatDateLocal(d);
    onSelectDate(iso);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow px-4">
      {/* ヘッダー */}
      <div className="relative mb-5 h-10">

        {/* 中央：◁ 日付 ▷ */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 whitespace-nowrap">
          <button
            className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
            onClick={() => changeMonth(-1)}
          >
            ◁
          </button>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {currentYear}年 {currentMonth + 1}月
          </h2>

          <button
            className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
            onClick={() => changeMonth(1)}
          >
            ▷
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 text-center text-gray-600 dark:text-gray-300 mb-1">
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* カレンダー */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {calendarDays.map((d) => {
          const isCurrentMonth = d.getMonth() === currentMonth;
          const isToday = isSameDay(d, today);
          const dateKey = formatDateLocal(d);
          const isSelected = selectedDate === dateKey;

          const baseClasses = "p-2 rounded-xl transition font-medium w-full";
          const todayClasses = "bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100";
          const selectedClasses = "bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-blue-50";
          const otherMonthClasses = "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700";
          const currentMonthClasses = "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700";

          return (
            <div key={d.toISOString()}>
              <button
                onClick={() => handleClick(d)}
                className={`${baseClasses} ${isToday
                  ? todayClasses
                  : isSelected
                    ? selectedClasses
                    : !isCurrentMonth
                      ? otherMonthClasses
                      : currentMonthClasses
                  }`}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
