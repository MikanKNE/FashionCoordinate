// frontend/src/pages/UserProfilePage.tsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getUserDetail, updateUser, updateEmail, updatePassword } from "../api/users";
import { getStorages, createStorage, deleteStorage } from "../api/storages";

import { Button } from "../components/ui/Button";
import Card from "../components/ui/Card";
import Header from "../components/Header";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";

import { useAuth } from "../context/AuthContext";

import type { User, Storage } from "../types";

export default function UserProfilePage() {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [storages, setStorages] = useState<Storage[]>([]);
  const [newStorage, setNewStorage] = useState("");

  const [loading, setLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetStorageId, setTargetStorageId] = useState<number | null>(null);

  useEffect(() => {
    if (!authUser) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getUserDetail(authUser.id);
        if (res.status === "success") {
          setUserData(res.data);
          setDisplayName(res.data.display_name);
          setEmail(res.data.email);
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

  // =============== プロフィール保存 ===================
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
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  // =============== メール変更 ===================
  const handleUpdateEmail = async () => {
    if (!email.trim()) return toast.error("メールアドレスを入力してください");

    try {
      if (!userData) return;
      const res = await updateEmail(userData.user_id, email);
      if (res.status === "success") {
        toast.success("メールアドレスを更新しました");
      } else {
        toast.error("更新に失敗しました");
      }
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  // =============== パスワード変更 ===================
  const handleUpdatePassword = async () => {
    if (!password) return toast.error("パスワードを入力してください");
    if (password !== passwordConfirm) return toast.error("パスワードが一致しません");

    try {
      if (!userData) return;
      const res = await updatePassword(userData.user_id, password);
      if (res.status === "success") {
        setPassword("");
        setPasswordConfirm("");
        toast.success("パスワードを更新しました");
      } else {
        toast.error("更新に失敗しました");
      }
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  // =============== 収納追加 / 削除 ===================
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
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  const openDeleteModal = (id: number) => {
    setTargetStorageId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (targetStorageId === null) return;

    try {
      const res = await deleteStorage(targetStorageId);
      if (res.status === "success") {
        setStorages(storages.filter(s => s.storage_id !== targetStorageId));
        toast.success("削除しました");
      } else {
        toast.error("削除に失敗しました");
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsDeleteModalOpen(false);
      setTargetStorageId(null);
    }
  };


  if (loading) return <p className="p-6">読み込み中...</p>;
  if (!userData) return <p className="p-6 text-red-500">ユーザー情報が取得できません</p>;

  return (
    <>
      <Header />

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* ===== 上段: プロフィール & 認証 ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 左: 表示名 */}
          <Card>
            <div className="space-y-2">
              <label className="block font-medium">ディスプレイ名</label>
              {/* 現在の設定を薄く表示 */}
              <div className="text-gray-400 text-sm">{userData.display_name}</div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <Button variant="primary" onClick={handleSaveProfile}>
                保存
              </Button>
            </div>
          </Card>

          {/* 中: メールアドレス */}
          <Card>
            <div className="space-y-2">
              <label className="block font-medium">メールアドレス</label>
              {/* 現在の設定を薄く表示 */}
              <div className="text-gray-400 text-sm">{userData.email}</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <Button variant="primary" onClick={handleUpdateEmail}>
                メールを更新
              </Button>
            </div>
          </Card>



          {/* 右: パスワード */}
          <Card>
            <div className="space-y-2">
              <label className="block font-medium">新しいパスワード</label>
              <input
                type="password"
                value={password}
                placeholder="変更する場合のみ入力"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border rounded px-3 py-2 bg-white dark:bg-slate-800"
              />

              <label className="block font-medium">確認用パスワード</label>
              <input
                type="password"
                value={passwordConfirm}
                placeholder="もう一度入力"
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                className="w-full border rounded px-3 py-2 bg-white dark:bg-slate-800"
              />

              <Button variant="primary" onClick={handleUpdatePassword}>
                パスワードを更新
              </Button>
            </div>
          </Card>

        </div>

        {/* ===== 下段: 収納場所 ===== */}
        <Card>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">収納場所</h2>

            <ul className="space-y-1">
              {storages.map((s) => (
                <li key={s.storage_id} className="flex items-center border px-3 py-2 rounded">
                  <span className="flex-8">{s.storage_location}</span>
                  <Button
                    variant="danger"
                    className="basis-1/10 ml-2"
                    onClick={() => openDeleteModal(s.storage_id)}
                  >
                    削除
                  </Button>

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
              <Button
                variant="primary"
                className="basis-2/10"
                onClick={handleAddStorage}
              >
                追加
              </Button>
            </div>
          </div>
        </Card>

      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title="収納場所を削除しますか？"
        description="この操作は元に戻せません。"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setTargetStorageId(null);
        }}
      />

    </>
  );
}
