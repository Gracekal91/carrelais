"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Eye, MessageSquare, TrendingUp, BarChart3, LineChart } from "lucide-react";

interface DailyPerformanceStat {
  date: string;
  views: number;
  contacts: number;
}

interface DashboardPerformanceChartProps {
  stats: DailyPerformanceStat[];
}

const chartConfig = {
  views: {
    label: "Vues",
    color: "#2563eb", // blue-600
    icon: Eye,
  },
  contacts: {
    label: "Contacts",
    color: "#10b981", // emerald-500
    icon: MessageSquare,
  },
} satisfies ChartConfig;

export default function DashboardPerformanceChart({ stats = [] }: DashboardPerformanceChartProps) {
  const [metric, setMetric] = React.useState<"both" | "views" | "contacts">("both");
  const [chartType, setChartType] = React.useState<"area" | "bar">("area");

  // Summary statistics
  const { totalViews, totalContacts, avgDailyViews, peakViews, conversionRate } = React.useMemo(() => {
    if (!stats.length) {
      return { totalViews: 0, totalContacts: 0, avgDailyViews: 0, peakViews: 0, conversionRate: "0.0" };
    }
    const tViews = stats.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const tContacts = stats.reduce((acc, curr) => acc + (curr.contacts || 0), 0);
    const pViews = Math.max(...stats.map((s) => s.views || 0));
    const avgViews = Math.round(tViews / stats.length);
    const rate = tViews > 0 ? ((tContacts / tViews) * 100).toFixed(1) : "0.0";

    return {
      totalViews: tViews,
      totalContacts: tContacts,
      avgDailyViews: avgViews,
      peakViews: pViews,
      conversionRate: rate,
    };
  }, [stats]);

  // Format short date for X-Axis (e.g. "16 Sep")
  const formatDateTick = (value: string) => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      return date.toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return value;
    }
  };

  // Format tooltip header date (e.g. "Lundi 16 Septembre")
  const formatTooltipDate = (value: any) => {
    try {
      const date = new Date(String(value));
      if (isNaN(date.getTime())) return String(value);
      return date.toLocaleDateString("fr-FR", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(value);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Chart Header */}
      <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Performance (7 derniers jours)
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Évolution quotidienne des vues et contacts pour l&apos;ensemble de votre parc
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Metric Selector */}
          <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMetric("both")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                metric === "both"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setMetric("views")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                metric === "views"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Vues
            </button>
            <button
              type="button"
              onClick={() => setMetric("contacts")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                metric === "contacts"
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Contacts
            </button>
          </div>

          {/* Type Toggle */}
          <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setChartType("area")}
              title="Courbe / Aire"
              className={`p-1.5 rounded-md transition-all ${
                chartType === "area"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("bar")}
              title="Barres"
              className={`p-1.5 rounded-md transition-all ${
                chartType === "bar"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 pb-2">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Total vues (7j)</span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{totalViews.toLocaleString()}</span>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Moyenne quotidienne</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{avgDailyViews.toLocaleString()} / jour</span>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Total contacts</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalContacts.toLocaleString()}</span>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Taux de conversion</span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{conversionRate}%</span>
        </div>
      </div>

      {/* Shadcn UI Chart Container */}
      <div className="p-6 pt-2">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          {chartType === "area" ? (
            <AreaChart
              data={stats}
              margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fillContacts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={formatDateTick}
                className="text-[11px] fill-zinc-500 font-medium"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-[11px] fill-zinc-400 font-mono"
              />
              <ChartTooltip
                cursor={{ stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "3 3" }}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatTooltipDate}
                    indicator="dot"
                  />
                }
              />
              {(metric === "both" || metric === "views") && (
                <Area
                  type="monotone"
                  dataKey="views"
                  name="views"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#fillViews)"
                />
              )}
              {(metric === "both" || metric === "contacts") && (
                <Area
                  type="monotone"
                  dataKey="contacts"
                  name="contacts"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#fillContacts)"
                />
              )}
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          ) : (
            <BarChart
              data={stats}
              margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={formatDateTick}
                className="text-[11px] fill-zinc-500 font-medium"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-[11px] fill-zinc-400 font-mono"
              />
              <ChartTooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatTooltipDate}
                    indicator="dot"
                  />
                }
              />
              {(metric === "both" || metric === "views") && (
                <Bar
                  dataKey="views"
                  name="views"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              )}
              {(metric === "both" || metric === "contacts") && (
                <Bar
                  dataKey="contacts"
                  name="contacts"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              )}
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
