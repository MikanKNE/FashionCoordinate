// src/components/ItemModal.tsx
import React, { useEffect, useState } from "react";
import type { Item } from "../types";
import ItemForm from "./ItemForm";
import { getItemDetail } from "../api/items";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";

interface Props {
  itemId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ItemModal({ itemId, isOpen, onClose }: Props) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    const fetchItem = async () => {
      if (!isOpen || itemId == null) return;
      setLoading(true);
      try {
        const res = await getItemDetail(itemId);
        if (res.status === "success") {
          setItem(res.data);
        } else {
          setItem(null);
          toast.error("アイテム詳細の取得に失敗しました");
        }
      } catch (err) {
        console.error(err);
        toast.error("アイテム詳細の取得に失敗しました");
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, isOpen]);


  const handleSave = (updatedItem: Item) => {
    setItem(updatedItem);
    setIsEditing(false);
    toast.success("保存しました");
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg w-96 relative animate-fadeIn border border-gray-300 dark:border-white/20">
        <button
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>

        {loading ? (
          <p className="text-center text-gray-700 dark:text-gray-100">読み込み中...</p>
        ) : item ? (
          <>
            {!isEditing ? (
              <>
                <img
                  src={item.image_url || "/noimage.png"}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-md mb-4 border border-gray-200 dark:border-white/20"
                />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{item.name}</h2>
                {item.category && (
                  <p className="text-gray-500 dark:text-gray-300">{item.category}</p>
                )}
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  ID: {item.item_id}
                </p>

                <Button
                  variant="primary"
                  className="mt-4 w-full"
                  onClick={() => setIsEditing(true)}
                >
                  編集
                </Button>
              </>
            ) : (
              <ItemForm
                item={item}
                onClose={() => setIsEditing(false)}
                onSave={handleSave}
              />
            )}
          </>
        ) : (
          <p className="text-gray-700 dark:text-gray-100">アイテムが見つかりません</p>
        )}
      </div>
    </div>
  );
}
