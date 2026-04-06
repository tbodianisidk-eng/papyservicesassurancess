import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Shield, FileText, Banknote,
  TrendingUp, TrendingDown, Activity, Clock, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import AppLayout from '@/components/AppLayout';
import { mockChartData, mockRecentActivity } from '@/data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalAssures: number;
  totalPolices: number;
  totalSinistres: number;
  totalPrestataires: number;
  totalConsultations: number;
  totalPrescriptions: number;
  sinistresEnAttente: number;
  sinistresApprouves: number;
  sinistresPaies: number;
  montantRembourse: number;
  recentActivity: Array<{ id: number; action: string; detail: string; type: string; date: string | null; time?: string }>;
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

const FALLBACK: DashboardStats = {
  totalAssures: 2847,
  totalPolices: 1234,
  totalSinistres: 156,
  totalPrestataires: 48,
  totalConsultations: 320,
  totalPrescriptions: 210,
  sinistresEnAttente: 42,
  sinistresApprouves: 89,
  sinistresPaies: 25,
  montantRembourse: 45200000,
  recentActivity: mockRecentActivity.map(a => ({
    id: a.id, action: a.action, detail: a.detail, type: a.type, date: null, time: a.time,
  })),
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PIE_COLORS = ['#F59E0B', '#8B5CF6', '#10B981'];

const ACTIVITY_STYLES: Record<string, string> = {
  creation:   'bg-blue-100 text-blue-600',
  validation: 'bg-yellow-100 text-yellow-600',
  payment:    'bg-green-100 text-green-600',
  medical:    'bg-purple-100 text-purple-600',
  en_attente: 'bg-orange-100 text-orange-600',
  paye:       'bg-green-100 text-green-600',
  default:    'bg-gray-100 text-gray-600',
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  creation:   <Shield size={14} />,
  validation: <FileText size={14} />,
  payment:    <Banknote size={14} />,
  medical:    <Activity size={14} />,
  default:    <Activity size={14} />,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(FALLBACK);
  const [chartData] = useState(mockChartData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084/api';
    fetch(`${apiUrl}/dashboard/stats`, {
      signal: AbortSignal.timeout(4000),
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(json => setStats(json.data || json))
      .catch(() => setStats(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout title="Tableau de bord">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-muted-foreground">Chargement...</span>
        </div>
      </AppLayout>
    );
  }

  const statCards = [
    { title: 'Assurés actifs',       value: stats.totalAssures.toLocaleString('fr-FR'),                          icon: <Users size={22} />,    trend: 'up'   as const, change: '+12%' },
    { title: 'Polices en cours',     value: stats.totalPolices.toLocaleString('fr-FR'),                          icon: <Shield size={22} />,   trend: 'up'   as const, change: '+8%'  },
    { title: 'Sinistres en attente', value: stats.sinistresEnAttente.toLocaleString('fr-FR'),                    icon: <FileText size={22} />, trend: 'down' as const, change: '-5%'  },
    { title: 'Montant remboursé',    value: `${(stats.montantRembourse / 1_000_000).toFixed(1)}M FCFA`,          icon: <Banknote size={22} />, trend: 'up'   as const, change: '+15%' },
  ];

  const pieData = [
    { name: 'En attente', value: stats.sinistresEnAttente, color: PIE_COLORS[0] },
    { name: 'Approuvés',  value: stats.sinistresApprouves, color: PIE_COLORS[1] },
    { name: 'Payés',      value: stats.sinistresPaies,     color: PIE_COLORS[2] },
  ].filter(d => d.value > 0);

  const barData = [
    { mois: 'Assurés',       value: stats.totalAssures },
    { mois: 'Polices',       value: stats.totalPolices },
    { mois: 'Sinistres',     value: stats.totalSinistres },
    { mois: 'Prestataires',  value: stats.totalPrestataires },
    { mois: 'Consultations', value: stats.totalConsultations },
  ];

  return (
    <AppLayout title="Tableau de bord">
      <div className="space-y-6 max-w-7xl">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-display font-bold mt-1">{card.value}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {card.icon}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                {card.trend === 'up'
                  ? <TrendingUp size={14} className="text-success" />
                  : <TrendingDown size={14} className="text-destructive" />
                }
                <span className={`text-xs font-medium ${card.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                  {card.change}
                </span>
                <span className="text-xs text-muted-foreground">vs mois dernier</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border"
          >
            <h3 className="font-display font-semibold text-sm mb-4">Sinistres & Remboursements</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 46%)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(214, 20%, 90%)', fontSize: '12px' }} />
                <Bar dataKey="sinistres"      fill="#3B82F6" radius={[4, 4, 0, 0]} name="Sinistres" />
                <Bar dataKey="remboursements" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Remboursements" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border"
          >
            <h3 className="font-display font-semibold text-sm mb-4">Répartition des sinistres</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {pieData.map(entry => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name} ({entry.value})
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                Aucun sinistre enregistré
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border"
        >
          <h3 className="font-display font-semibold text-sm mb-4">Activité récente</h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? stats.recentActivity.map(item => {
              const key = item.type?.toLowerCase() || 'default';
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ACTIVITY_STYLES[key] || ACTIVITY_STYLES.default}`}>
                    {ACTIVITY_ICONS[key] || ACTIVITY_ICONS.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock size={12} />
                    {item.time || (item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '—')}
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-muted-foreground text-sm py-4">Aucune activité récente</p>
            )}
          </div>
        </motion.div>

      </div>
    </AppLayout>
  );
}
