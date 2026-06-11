"use client";

import { useState } from "react";

interface UserEntry {
  name: string;
  email: string;
  registeredAt: string;
  typeName: string;
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

function downloadCsv(users: UserEntry[]) {
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
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<UserEntry[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.status === 401) {
        setError("パスワードが違います");
        return;
      }
      if (!res.ok) {
        setError("データの取得に失敗しました");
        return;
      }
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1e3a5f] py-5 px-6">
        <h1 className="text-white text-xl font-bold">管理者ページ</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-600 text-sm">
            登録者数：<span className="font-bold text-[#1e3a5f]">{users.length}</span> 件
          </p>
          <button
            onClick={() => downloadCsv(users)}
            disabled={users.length === 0}
            className="bg-[#d4a017] hover:bg-[#c49010] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            CSVダウンロード
          </button>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(u.registeredAt)}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-50 text-[#1e3a5f] text-xs font-medium px-2.5 py-1 rounded-full">
                          {u.typeName}
                        </span>
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
