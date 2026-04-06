import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Stethoscope, Search, Mail, Building2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { DataService } from "@/services/dataService";

const allUsers = [
  { id: "1", full_name: "Administrateur", email: "admin@assurance.com", role: "admin", organization: "Papy Services Assurances", created_at: "2024-01-01" },
  { id: "2", full_name: "Prestataire Demo", email: "prestataire@assurance.com", role: "prestataire", organization: "Clinique Demo", created_at: "2024-01-05" },
  { id: "3", full_name: "Client Demo", email: "client@assurance.com", role: "client", organization: "", created_at: "2024-01-10" },
];

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  admin: { label: "Administrateur", color: "bg-blue-100 text-blue-800", icon: <Users className="w-4 h-4" /> },
  prestataire: { label: "Prestataire", color: "bg-purple-100 text-purple-800", icon: <Stethoscope className="w-4 h-4" /> },
  client: { label: "Client", color: "bg-emerald-100 text-emerald-800", icon: <Users className="w-4 h-4" /> },
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "prestataire" | "client">("all");
  const [users, setUsers] = useState<any[]>(allUsers);

  useEffect(() => {
    DataService.getUsers().then((savedUsers) => {
      if (Array.isArray(savedUsers) && savedUsers.length > 0) {
        setUsers(savedUsers);
      }
    }).catch((err) => {
      console.error('Erreur chargement users:', err);
    });
  }, []);

  const filtered = users.filter((u) => {
    const matchRole = filter === "all" || u.role === filter;
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    prestataires: users.filter((u) => u.role === "prestataire").length,
    clients: users.filter((u) => u.role === "client").length,
  };

  return (
    <AppLayout title="Gestion des utilisateurs">
      <div className="space-y-6 max-w-5xl">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg"><Stethoscope className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold">{counts.prestataires}</p>
              <p className="text-sm text-gray-500">Prestataires</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg"><Users className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold">{counts.clients}</p>
              <p className="text-sm text-gray-500">Clients</p>
            </div>
          </Card>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "prestataire", "client"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f === "all" ? "Tous" : f === "prestataire" ? "Prestataires" : "Clients"}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="p-12 text-center text-gray-500">Aucun utilisateur trouvé</Card>
          ) : (
            filtered.map((u) => {
              const config = roleConfig[u.role];
              return (
                <Card key={u.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {u.full_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{u.full_name}</p>
                      <Badge className={config.color}>{config.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>
                      {u.organization && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{u.organization}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(u.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
