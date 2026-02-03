// frontend/src/pages/CoordinationEditPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getCoordination } from "../api/coordinations";

import CoordinationEditor from "../components/CoordinationEditor";
import Header from "../components/Header";

import type { Coordination } from "../types";

export default function CoordinationEditPage() {
  const { id } = useParams<{ id: string }>();
  const [coordination, setCoordination] = useState<Coordination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await getCoordination(Number(id));
        setCoordination(res?.data ?? null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <p>読み込み中...</p>;
  if (!coordination) return <p>コーディネートが見つかりません</p>;

  return (
    <>
      <Header />
      <div className="min-h-screen p-6 text-slate-800 dark:text-slate-100">
        <h1 className="text-2xl font-bold mb-4">コーディネート編集</h1>
        <CoordinationEditor coordination={coordination} />
      </div>
    </>
  );
}
