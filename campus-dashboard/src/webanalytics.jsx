import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* -------------------------------------------------------------------------- */
/*  MOCK DATASET — 30 anonymous campus survey responses                       */
/*  Row format: [hoursBucket, belonging(1-5), wellbeing(1-5), barrier, features]
/*  Feature codes: C = Unified Campus Calendar, B = Event Buddy System,       */
/*                 P = Personalized Recommendations, T = Timetable Sync       */
/* -------------------------------------------------------------------------- */
const HOUR_BUCKETS = ["0 hrs", "1-3 hrs", "4-6 hrs", "7+ hrs"];

const BARRIERS = [
  "Lack of Awareness",
  "Schedule Conflicts",
  "Fear of Going Alone",
  "Academic Workload",
];

const FEATURE_CODES = {
  C: "Unified Campus Calendar",
  B: "Event Buddy System",
  P: "Personalized Recommendations",
  T: "Timetable Sync",
};

const RAW = [
  // 0 hrs (8)
  [0, 2, 3, "Lack of Awareness", "CB"],
  [0, 2, 2, "Lack of Awareness", "CP"],
  [0, 3, 3, "Lack of Awareness", "C"],
  [0, 2, 3, "Fear of Going Alone", "BP"],
  [0, 3, 3, "Lack of Awareness", "CT"],
  [0, 2, 2, "Schedule Conflicts", "TC"],
  [0, 2, 3, "Fear of Going Alone", "B"],
  [0, 3, 3, "Lack of Awareness", "CP"],
  // 1-3 hrs (9)
  [1, 3, 3, "Lack of Awareness", "C"],
  [1, 3, 3, "Lack of Awareness", "CB"],
  [1, 4, 4, "Schedule Conflicts", "T"],
  [1, 3, 3, "Lack of Awareness", "CP"],
  [1, 3, 4, "Lack of Awareness", "C"],
  [1, 4, 3, "Fear of Going Alone", "B"],
  [1, 3, 3, "Schedule Conflicts", "TC"],
  [1, 3, 4, "Lack of Awareness", "CPB"],
  [1, 4, 3, "Academic Workload", "T"],
  // 4-6 hrs (8)
  [2, 4, 4, "Lack of Awareness", "CP"],
  [2, 4, 4, "Schedule Conflicts", "T"],
  [2, 3, 4, "Lack of Awareness", "CB"],
  [2, 4, 3, "Academic Workload", "PT"],
  [2, 5, 4, "Lack of Awareness", "C"],
  [2, 4, 4, "Lack of Awareness", "CP"],
  [2, 4, 4, "Academic Workload", "TB"],
  [2, 3, 4, "Schedule Conflicts", "C"],
  // 7+ hrs (5)
  [3, 5, 4, "Lack of Awareness", "CP"],
  [3, 4, 5, "Academic Workload", "T"],
  [3, 5, 4, "Schedule Conflicts", "B"],
  [3, 4, 4, "Lack of Awareness", "CB"],
  [3, 5, 5, "Lack of Awareness", "C"],
].map(([h, belonging, wellbeing, barrier, feats], i) => ({
  id: i + 1,
  hours: HOUR_BUCKETS[h],
  belonging,
  wellbeing,
  barrier,
  features: feats.split("").map((c) => FEATURE_CODES[c]),
}));

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
const avg = (arr, key) =>
  arr.length ? arr.reduce((s, r) => s + r[key], 0) / arr.length : 0;
const round1 = (n) => Math.round(n * 10) / 10;

const PIE_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#ec4899"];
const BAR_COLORS = { belonging: "#6366f1", wellbeing: "#22d3ee" };

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "0.75rem",
  color: "#e2e8f0",
  fontSize: 12,
};

/* -------------------------------------------------------------------------- */
/*  Small UI pieces                                                           */
/* -------------------------------------------------------------------------- */
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/60 p-5 shadow-lg">
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-2xl ${accent}`}
      />
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, className = "", children }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg ${className}`}
    >
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {subtitle && <p className="mb-4 text-xs text-slate-400">{subtitle}</p>}
      <div className="h-72 w-full">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */
export default function CampusDashboard() {
  const stats = useMemo(() => {
    const total = RAW.length;

    // Active vs non-active
    const active = RAW.filter((r) => r.hours !== "0 hrs");
    const inactive = RAW.filter((r) => r.hours === "0 hrs");
    const activeBelong = round1(avg(active, "belonging"));
    const inactiveBelong = round1(avg(inactive, "belonging"));

    // Chart 1 — by hours bucket
    const byHours = HOUR_BUCKETS.map((bucket) => {
      const rows = RAW.filter((r) => r.hours === bucket);
      return {
        hours: bucket,
        n: rows.length,
        Belonging: round1(avg(rows, "belonging")),
        "Well-Being": round1(avg(rows, "wellbeing")),
      };
    });

    // Chart 2 — barriers
    const barrierData = BARRIERS.map((name) => {
      const count = RAW.filter((r) => r.barrier === name).length;
      return { name, value: count, pct: Math.round((count / total) * 100) };
    }).sort((a, b) => b.value - a.value);

    // Chart 3 — feature votes
    const featureCounts = {};
    RAW.forEach((r) =>
      r.features.forEach((f) => (featureCounts[f] = (featureCounts[f] || 0) + 1))
    );
    const featureData = Object.entries(featureCounts)
      .map(([name, votes]) => ({ name, votes }))
      .sort((a, b) => b.votes - a.votes);

    // Insight — 4+ hrs vs <4 hrs
    const high = RAW.filter((r) => r.hours === "4-6 hrs" || r.hours === "7+ hrs");
    const low = RAW.filter((r) => r.hours === "0 hrs" || r.hours === "1-3 hrs");
    const lift = Math.round((avg(high, "belonging") / avg(low, "belonging") - 1) * 100);

    return {
      total,
      activeBelong,
      inactiveBelong,
      byHours,
      barrierData,
      featureData,
      lift,
      topBarrier: barrierData[0],
      topFeature: featureData[0],
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40 px-4 py-8 text-slate-200 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            Primary Survey · n = {stats.total} · Anonymous
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Campus Participation &amp; Belonging
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            How extracurricular involvement relates to students' sense of
            belonging and mental well-being, and what holds them back.
          </p>
        </header>

        {/* Key metric cards */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Respondents"
            value={stats.total}
            sub="Anonymous campus students"
            accent="bg-indigo-500"
          />
          <StatCard
            label="Avg. Belonging (1–5)"
            value={
              <span>
                <span className="text-emerald-400">{stats.activeBelong}</span>
                <span className="mx-2 text-sm font-normal text-slate-500">vs</span>
                <span className="text-rose-400">{stats.inactiveBelong}</span>
              </span>
            }
            sub="Active (1+ hrs) vs Non-Active (0 hrs)"
            accent="bg-emerald-500"
          />
          <StatCard
            label="Top Reported Barrier"
            value={stats.topBarrier.name}
            sub={`${stats.topBarrier.pct}% of respondents`}
            accent="bg-amber-500"
          />
          <StatCard
            label="Top Requested Feature"
            value={stats.topFeature.name}
            sub={`${stats.topFeature.votes} votes`}
            accent="bg-cyan-500"
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Chart 1 */}
          <ChartCard
            title="Extracurricular Hours vs. Belonging & Well-Being"
            subtitle="Average self-reported score (1–5) by weekly hours"
            className="md:col-span-2 lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byHours} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hours" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1e293b66" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Belonging" fill={BAR_COLORS.belonging} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Well-Being" fill={BAR_COLORS.wellbeing} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 2 */}
          <ChartCard
            title="Primary Barriers to Participation"
            subtitle="Share of respondents by main barrier"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.barrierData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={3}
                  stroke="none"
                  label={({ pct }) => `${pct}%`}
                  labelLine={false}
                >
                  {stats.barrierData.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v, n, p) => [`${v} students (${p.payload.pct}%)`, n]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 3 */}
          <ChartCard
            title="Most Wanted Tech Features"
            subtitle="Votes (multi-select)"
            className="md:col-span-2 lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.featureData}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 24, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={170}
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1e293b66" }} />
                <Bar dataKey="votes" name="Votes" radius={[0, 6, 6, 0]}>
                  {stats.featureData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Insights */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-slate-900 p-5 shadow-lg">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-lg">
                💡
              </span>
              <h2 className="text-base font-semibold text-white">Key Data Insight</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Students spending <strong className="text-white">4+ hours/week</strong> in
              extracurriculars report a{" "}
              <strong className="text-emerald-400">{stats.lift}% higher</strong> sense of
              campus belonging, yet{" "}
              <strong className="text-amber-400">{stats.topBarrier.pct}%</strong> of all
              students cite <em>{stats.topBarrier.name.toLowerCase()}</em> as their primary
              barrier.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Implication: a <strong className="text-slate-200">{stats.topFeature.name}</strong>{" "}
              (the most requested feature, {stats.topFeature.votes} votes) directly targets
              the biggest gap between students and the activities that help them belong.
            </p>
          </div>
        </section>

        <footer className="mt-8 text-center text-xs text-slate-500">
          Mock dataset of {stats.total} anonymous responses · Built with React, Tailwind CSS &amp; Recharts
        </footer>
      </div>
    </div>
  );
}