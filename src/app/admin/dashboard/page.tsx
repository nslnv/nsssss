"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

/**
 * Демоданные. При необходимости подставишь реальные из API/БД.
 */
type KV = { name: string; value: number; color?: string };

const statusData: KV[] = [
  { name: "Новая", value: 12, color: "#C9A97E" },
  { name: "В работе", value: 8, color: "#9E7A4B" },
  { name: "Оплачено", value: 5, color: "#7B8F60" },
  { name: "Отказ", value: 3, color: "#B15C5C" },
];

const sourceData: KV[] = [
  { name: "Сайт", value: 14, color: "#C9A97E" },
  { name: "Реклама", value: 9, color: "#9E7A4B" },
  { name: "Реферал", value: 3, color: "#7B8F60" },
  { name: "Другое", value: 2, color: "#B15C5C" },
];

const weeklyData = [
  { week: "Нед 1", leads: 5, paid: 2 },
  { week: "Нед 2", leads: 8, paid: 3 },
  { week: "Нед 3", leads: 10, paid: 4 },
  { week: "Нед 4", leads: 12, paid: 6 },
];

export default function AdminDashboardPage() {
  const totalLeads = React.useMemo(
    () => statusData.reduce((s, d) => s + (d.value ?? 0), 0),
    []
  );
  const paidCount = React.useMemo(
    () => statusData.find((d) => d.name.toLowerCase().includes("оплач"))?.value ?? 0,
    []
  );
  const inProgress = React.useMemo(
    () => statusData.find((d) => d.name.toLowerCase().includes("работ"))?.value ?? 0,
    []
  );

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <section className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "Playfair Display, serif" }}>
          Панель администратора
        </h1>
        <p className="text-sm text-[var(--color-muted)]">Сводка по лидам и статусам</p>
      </section>

      {/* Карточки-метрики */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-[16px] border border-[var(--color-line)] bg-[var(--color-card)] p-4 shadow">
          <div className="text-sm text-[var(--color-muted)]">Всего лидов</div>
          <div className="mt-2 text-3xl font-semibold">{totalLeads}</div>
        </div>
        <div className="rounded-[16px] border border-[var(--color-line)] bg-[var(--color-card)] p-4 shadow">
          <div className="text-sm text-[var(--color-muted)]">В работе</div>
          <div className="mt-2 text-3xl font-semibold">{inProgress}</div>
        </div>
        <div className="rounded-[16px] border border-[var(--color-line)] bg-[var(--color-card)] p-4 shadow">
          <div className="text-sm text-[var(--color-muted)]">Оплачено</div>
          <div className="mt-2 text-3xl font-semibold">{paidCount}</div>
        </div>
      </section>

      {/* Графики */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Круговая диаграмма статусов */}
        <div className="rounded-[16px] border border-[var(--color-line)] bg-[var(--color-card)] p-4 shadow lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Статусы заявок</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  // ВАЖНО: percent может быть undefined — обрабатываем !
                  label={(props: any) => {
                    const name = props?.name ?? "";
                    const percent = Number(props?.percent ?? 0);
                    return `${name} ${Math.round(percent * 100)}%`;
                  }}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`status-cell-${index}`}
                      fill={entry.color ?? "#C9A97E"}
                      stroke="#fff"
                      strokeOpacity={0.6}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [String(value), String(name)]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Столбчатая диаграмма источников */}
        <div className="rounded-[16px] border border-[var(--color-line)] bg-[var(--color-card)] p-4 shadow lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Источники обращений</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {sourceData.map((entry, index) => (
                    <Cell key={`src-cell-${index}`} fill={entry.color ?? "#9E7A4B"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Линейный график по неделям */}
        <div className="rounded-[16px] border border-[var(--color-line)] bg-[var(--color-card)] p-4 shadow lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Динамика по неделям</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leads" stroke="#C9A97E" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="paid" stroke="#7B8F60" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Таблица последних лидов (заглушка) */}
      <section className="mt-8 rounded-[16px] border border-[var(--color-line)] bg-[var(--color-card)] p-4 shadow">
        <h2 className="text-lg font-semibold mb-4">Последние заявки</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-[var(--color-line)]">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Имя</th>
                <th className="py-2 pr-4">Статус</th>
                <th className="py-2 pr-4">Источник</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "L-1024", name: "Иван", status: "Новая", source: "Сайт" },
                { id: "L-1025", name: "Мария", status: "В работе", source: "Реклама" },
                { id: "L-1026", name: "Олег", status: "Оплачено", source: "Реферал" },
              ].map((row) => (
                <tr key={row.id} className="border-b border-[var(--color-line)]/70">
                  <td className="py-2 pr-4 font-mono">{row.id}</td>
                  <td className="py-2 pr-4">{row.name}</td>
                  <td className="py-2 pr-4">{row.status}</td>
                  <td className="py-2 pr-4">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
