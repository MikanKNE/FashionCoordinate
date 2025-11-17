// frontend/src/components/CalendarPanel.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OutfitModal from "./OutfitModal";
import { getUsageByDate } from "../api/usage_history";

export default function CalendarPanel() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [usageMap, setUsageMap] = useState<Record<string, any[]>>({});
  const navigate = useNavigate();

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDay = firstDayOfMonth.getDay();
  const totalDays = 42;
  const calendarDays = Array.from({ length: totalDays }, (_, i) => {
    const dayOffset = i - startDay + 1;
    return new Date(currentYear, currentMonth, dayOffset);
  });

  const handleClick = (d: Date) => {
    setSelectedDate(d);
    setShowModal(true);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  // ----------------------------
  // 使用履歴取得（表示用）
  // ----------------------------
  useEffect(() => {
    const fetchUsage = async () => {
      // 月初から月末まで
      const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
      // Supabase 側で月単位で取得
      const res = await getUsageByDate(monthStart);
      if (res.status === "success") {
        const map: Record<string, any[]> = {};
        res.data.forEach((u: any) => {
          const key = u.used_date; // YYYY-MM-DD
          if (!map[key]) map[key] = [];
          map[key].push(u.items); // items 配列
        });
        setUsageMap(map);
      }
    };
    fetchUsage();
  }, [currentMonth, currentYear]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-3">
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
          const isSelected = selectedDate && isSameDay(d, selectedDate);

          const baseClasses = "p-2 rounded-xl transition font-medium w-full relative";
          const todayClasses = "bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100";
          const selectedClasses = "bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-blue-50";
          const otherMonthClasses = "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700";
          const currentMonthClasses = "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700";

          // const dateKey = d.toISOString().split("T")[0];
          // const images = usageMap[dateKey] || [];

          return (
            <div key={d.toISOString()} className="relative">
              <button
                onClick={() => handleClick(d)}
                className={`${baseClasses} ${isToday ? todayClasses : isSelected ? selectedClasses : !isCurrentMonth ? otherMonthClasses : currentMonthClasses
                  }`}
              >
                {d.getDate()}
              </button>

              {/* 使用アイテムの画像を表示 */}
              {/* {images.length > 0 && (
                <div className="absolute top-0 right-0 flex flex-wrap gap-1 mt-1 justify-center">
                  {images.map((item: any) => (
                    <img
                      key={item.item_id}
                      src={item.image_url}
                      alt={item.name}
                      className="w-6 h-6 rounded-full border border-gray-200 dark:border-slate-600"
                    />
                  ))}
                </div>
              )} */}
            </div>
          );
        })}
      </div>

      {/* モーダル表示 */}
      {showModal && selectedDate && (
        <OutfitModal date={selectedDate} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
