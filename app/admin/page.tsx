"use client";

import { useState, useEffect } from "react";

interface UserEntry {
  name: string;
  email: string;
  registeredAt: string;
  typeName: string;
  downloaded?: boolean;
  _index: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${min}`;
}

function generateCsv(users: UserEntry[]): string {
  const today = new Date();
  const dateStr =
    String(today.getFullYear()) +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");
  const filename = `ユーザー登録用_入力CSV_ひとりビジネス適性診断_${dateStr}.csv`;

  const header = "姓,メールアドレス,登録日,ラベル\n";
  const rows = users.map((u) => {
    const date = new Date(u.registeredAt);
    const dateOnly = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
    const name = `"${u.name.replace(/"/g, '""')}"`;
    const email = `"${u.email.replace(/"/g, '""')}"`;
    return `${name},${email},${dateOnly},`;
  });

  const bom = "﻿";
  const csv = bom + header + rows.join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  return filename;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<UserEntry[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const authHeader = { Authorization: `Bearer ${password}` };

  // ページロード時にsessionStorageから認証済みパスワードを復元して自動フェッチ
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_password");
    if (!saved) return;
    setPassword(saved);
    setLoading(true);
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${saved}` } })
      .then((res) => {
        if (!res.ok) { sessionStorage.removeItem("admin_password"); return null; }
        return res.json();
      })
      .then((data) => { if (data) setUsers(data.users ?? []); })
      .catch(() => sessionStorage.removeItem("admin_password"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { headers: authHeader });
      if (res.status === 401) { setError("パスワードが違います"); return; }
      if (!res.ok) { setError("データの取得に失敗しました"); return; }
      const data = await res.json();
      sessionStorage.setItem("admin_password", password);
      setUsers(data.users ?? []);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // 新規のみダウンロード → CSV出力 → downloaded=true に更新 → ローカルstate更新
  const handleNewDownload = async () => {
    if (!users) return;
    const newUsers = users.filter((u) => !u.downloaded);
    if (newUsers.length === 0) return;

    generateCsv(newUsers);

    setMarking(true);
    try {
      const indices = newUsers.map((u) => u._index);
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ indices }),
      });
      // ローカルstateのdownloadedフラグを更新
      setUsers((prev) =>
        prev
          ? prev.map((u) =>
              indices.includes(u._index) ? { ...u, downloaded: true } : u
            )
          : prev
      );
    } catch {
      // フラグ更新失敗はサイレントに（CSVは既にダウンロード済み）
    } finally {
      setMarking(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("この登録者を削除しますか？")) return;
    setDeleting(index);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      if (!res.ok) { alert("削除に失敗しました"); return; }
      // 削除後は一覧を再フェッチして_indexを再構築
      const data = await fetch("/api/admin/users", { headers: authHeader }).then((r) => r.json());
      setUsers(data.users ?? []);
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setDeleting(null);
    }
  };

  // 全件ダウンロード（フラグ変更なし）
  const handleAllDownload = () => {
    if (!users || users.length === 0) return;
    generateCsv(users);
  };

  if (users === null && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1e3a5f]/30 border-t-[#1e3a5f] rounded-full animate-spin" />
      </div>
    );
  }

  if (users === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
          <h1 className="text-[#1e3a5f] text-lg font-bold mb-6 text-center">管理者ログイン</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
            />
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? "認証中..." : "ログイン"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const newCount = users.filter((u) => !u.downloaded).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1e3a5f] py-5 px-6">
        <h1 className="text-white text-xl font-bold">管理者ページ</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-gray-600 text-sm">
            登録者数：<span className="font-bold text-[#1e3a5f]">{users.length}</span> 件
            　未ダウンロード：<span className="font-bold text-orange-600">{newCount}</span> 件
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleNewDownload}
              disabled={newCount === 0 || marking}
              className="bg-[#1e3a5f] hover:bg-[#2d5a8e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              {marking ? "更新中..." : `新規のみダウンロード（${newCount}件）`}
            </button>
            <button
              onClick={handleAllDownload}
              disabled={users.length === 0}
              className="bg-[#d4a017] hover:bg-[#c49010] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              全件ダウンロード
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          {users.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">登録者はまだいません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#1e3a5f] text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">姓</th>
                    <th className="text-left px-4 py-3 font-semibold">メールアドレス</th>
                    <th className="text-left px-4 py-3 font-semibold">登録日時</th>
                    <th className="text-left px-4 py-3 font-semibold">診断タイプ</th>
                    <th className="text-center px-4 py-3 font-semibold">DL済</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u._index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(u.registeredAt)}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-50 text-[#1e3a5f] text-xs font-medium px-2.5 py-1 rounded-full">
                          {u.typeName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.downloaded ? (
                          <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full">済</span>
                        ) : (
                          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">未</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(u._index)}
                          disabled={deleting === u._index}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold px-2.5 py-1 rounded-lg transition-colors"
                        >
                          {deleting === u._index ? "削除中" : "削除"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
