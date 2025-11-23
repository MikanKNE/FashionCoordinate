// frontend/src/pages/UserProfilePage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserDetail, updateUser } from "../api/users";
import { getStorages, createStorage, deleteStorage } from "../api/storages";
import type { User, Storage } from "../types";
import Header from "../components/Header";
import Card from "../components/ui/Card";
import toast from "react-hot-toast";

export default function UserProfilePage() {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [storages, setStorages] = useState<Storage[]>([]);
  const [newStorage, setNewStorage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getUserDetail(authUser.id);
        if (res.status === "success") {
          setUserData(res.data);
          setDisplayName(res.data.display_name);
        }

        const storageRes = await getStorages();
        if (storageRes.status === "success") {
          setStorages(storageRes.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("データ取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser]);

  const handleSaveProfile = async () => {
    if (!userData) return;
    try {
      const res = await updateUser(userData.user_id, { display_name: displayName });
      if (res.status === "success") {
        setUserData({ ...userData, display_name: displayName });
        toast.success("保存しました");
      } else {
        toast.error("保存に失敗しました");
      }
    } catch (err) {
      console.error(err);
      toast.error("エラーが発生しました");
    }
  };

  const handleAddStorage = async () => {
    if (!newStorage) return;
    try {
      const res = await createStorage(newStorage);
      if (res.status === "success") {
        setStorages([...storages, res.data[0]]);
        setNewStorage("");
        toast.success("追加しました");
      } else {
        toast.error("追加に失敗しました");
      }
    } catch (err) {
      console.error(err);
      toast.error("エラーが発生しました");
    }
  };

  const handleDeleteStorage = async (id: number) => {
    if (!confirm("削除してよろしいですか？")) return;
    try {
      const res = await deleteStorage(id);
      if (res.status === "success") {
        setStorages(storages.filter(s => s.storage_id !== id));
        toast.success("削除しました");
      } else {
        toast.error("削除に失敗しました");
      }
    } catch (err) {
      console.error(err);
      toast.error("エラーが発生しました");
    }
  };

  if (loading) return <p className="p-6">読み込み中...</p>;
  if (!userData) return <p className="p-6 text-red-500">ユーザー情報が取得できません</p>;

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">ユーザー情報編集</h1>

        {/* ディスプレイ名変更 */}
        <Card>
          <div className="space-y-2">
            <label className="block font-medium">ディスプレイ名</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <button
              onClick={handleSaveProfile}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </Card>

        {/* 収納場所管理 */}
        <Card>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">収納場所</h2>
            <ul className="space-y-1">
              {storages.map((s) => (
                <li key={s.storage_id} className="flex justify-between items-center border px-3 py-2 rounded">
                  <span>{s.storage_location}</span>
                  <button
                    onClick={() => handleDeleteStorage(s.storage_id)}
                    className="text-red-500 hover:underline"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="新しい収納場所"
                value={newStorage}
                onChange={(e) => setNewStorage(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                onClick={handleAddStorage}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                追加
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
