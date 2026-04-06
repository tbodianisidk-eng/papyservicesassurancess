import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { UserMenu } from "./UserMenu";
import { Bell, Search, User, Building2, Stethoscope } from "lucide-react";
import { NotificationSystem } from "@/components/NotificationSystem";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataService } from "@/services/dataService";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [assures, setAssures] = useState<any[]>([]);
  const [prestataires, setPrestataires] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedAssures = await DataService.getAssures();
        setAssures(fetchedAssures);
      } catch (error) {
        console.error('AppLayout: impossible de charger les assurés', error);
      }

      try {
        const fetchedPrestataires = await DataService.getPrestataires();
        setPrestataires(fetchedPrestataires);
      } catch (error) {
        console.error('AppLayout: impossible de charger les prestataires', error);
      }
    };
    loadData();
  }, []);

  const allSearchItems = [
    ...assures.map(a => ({
      type: "Assuré" as const,
      label: `${a.prenom} ${a.nom}`,
      subtitle: a.numero,
      path: `/assures/${a.id}`,
      icon: <User size={16} />
    })),
    ...prestataires.map(p => ({
      type: "Prestataire" as const,
      label: p.nom,
      subtitle: p.specialite,
      path: `/prestataires`,
      icon: <Stethoscope size={16} />
    }))
  ];

  const filteredItems = searchQuery
    ? allSearchItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelect = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery("");
  };
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 pl-12 lg:pl-0">
            <img src="/logo1.png" alt="Logo" className="w-8 h-8 object-contain" />
            {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <Search size={16} />
              <span>Rechercher...</span>
            </button>
            <NotificationSystem />
            <UserMenu />
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rechercher un assuré ou prestataire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Tapez un nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="max-h-96 overflow-y-auto space-y-1">
              {searchQuery && filteredItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                >
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.type} • {item.subtitle}</p>
                  </div>
                </button>
              ))}
              {searchQuery && filteredItems.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Aucun résultat trouvé</p>
              )}
              {!searchQuery && (
                <p className="text-center text-muted-foreground py-8">Commencez à taper pour rechercher...</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
