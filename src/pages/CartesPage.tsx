import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Download, QrCode, CreditCard, User } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataService } from "@/services/dataService";

export default function CartesPage() {
  const [search, setSearch] = useState("");
  const [assures, setAssures] = useState<any[]>([]);

  useEffect(() => {
    const loadAssures = async () => {
      try {
        const list = await DataService.getAssures();
        setAssures(list);
      } catch (error) {
        console.error('CartesPage: impossible de charger les assurés', error);
      }
    };
    loadAssures();
  }, []);

  const filtered = assures.filter(
    (a) =>
      a.nom.toLowerCase().includes(search.toLowerCase()) ||
      a.prenom.toLowerCase().includes(search.toLowerCase()) ||
      a.numero.toLowerCase().includes(search.toLowerCase())
  );

  const generateQRCode = (numero: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${numero}`;
  };

  const downloadCard = (assure: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Fond dégradé moderne
    const gradient = ctx.createLinearGradient(0, 0, 1000, 630);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(0.3, '#3b82f6');
    gradient.addColorStop(0.7, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 630);

    // Motif de fond (cercles décoratifs)
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(850, 100, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(150, 500, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Bordure arrondie blanche
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(20, 20, 960, 590, 30);
    ctx.stroke();

    // Logo et titre
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('RÉPUBLIQUE DU SÉNÉGAL', 60, 80);
    ctx.font = '16px Arial';
    ctx.globalAlpha = 0.9;
    ctx.fillText('Ministère de la Santé et de l\'Action Sociale', 60, 105);
    ctx.globalAlpha = 1;

    // Titre principal
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Papy Services Assurances', 60, 170);
    ctx.font = '22px Arial';
    ctx.globalAlpha = 0.9;
    ctx.fillText('CARTE D\'ASSURANCE SANTÉ', 60, 200);
    ctx.globalAlpha = 1;

    // Ligne séparatrice
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 230);
    ctx.lineTo(940, 230);
    ctx.stroke();

    // Informations de l'assuré
    ctx.font = '18px Arial';
    ctx.globalAlpha = 0.8;
    ctx.fillText('TITULAIRE DE LA CARTE', 60, 280);
    ctx.globalAlpha = 1;
    
    ctx.font = 'bold 42px Arial';
    ctx.fillText(`${assure.nom.toUpperCase()} ${assure.prenom}`, 60, 330);
    
    // Numéro d'assuré avec style
    ctx.font = '16px Arial';
    ctx.globalAlpha = 0.8;
    ctx.fillText('N° D\'ASSURÉ', 60, 380);
    ctx.globalAlpha = 1;
    ctx.font = 'bold 32px monospace';
    ctx.fillText(assure.numero, 60, 415);

    // Informations supplémentaires
    ctx.font = '18px Arial';
    ctx.fillText(`Type de contrat: ${assure.type.toUpperCase()}`, 60, 470);
    ctx.fillText(`Statut: ${assure.statut}`, 60, 505);
    ctx.fillText(`Tél: ${assure.telephone}`, 60, 540);

    // Date de validité
    ctx.font = '16px Arial';
    ctx.globalAlpha = 0.8;
    ctx.fillText('Valide jusqu\'au: 31/12/2025', 60, 580);
    ctx.globalAlpha = 1;

    // QR Code avec cadre blanc élégant
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = () => {
      // Fond blanc pour QR
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.roundRect(750, 250, 200, 200, 15);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // QR Code
      ctx.drawImage(qrImg, 765, 265, 170, 170);
      
      // Texte sous QR
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SCANNEZ-MOI', 850, 480);
      ctx.textAlign = 'left';

      // Logo médical (croix)
      ctx.fillStyle = 'white';
      ctx.fillRect(880, 60, 40, 15);
      ctx.fillRect(887, 53, 26, 29);

      // Télécharger
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `carte-assurance-${assure.numero}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };
    qrImg.src = generateQRCode(assure.numero);
  };

  return (
    <AppLayout title="Cartes d'assurance">
      <div className="space-y-4 max-w-7xl">
        <div className="flex items-center gap-2 max-w-md">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-input bg-card text-sm">
            <Search size={16} className="text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un assuré..."
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((assure, i) => (
            <motion.div
              key={assure.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                {/* Carte d'assurance */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs opacity-80">ASSURANCE SANTÉ</p>
                      <p className="text-lg font-bold mt-1">Papy Services</p>
                    </div>
                    <CreditCard className="w-8 h-8 opacity-80" />
                  </div>
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xs opacity-80 mb-1">Assuré</p>
                    <p className="text-xl font-bold">{assure.nom} {assure.prenom}</p>
                    <p className="text-sm font-mono mt-2 opacity-90">{assure.numero}</p>
                  </div>

                  <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-lg p-1">
                    <img 
                      src={generateQRCode(assure.numero)} 
                      alt="QR Code"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Informations */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{assure.type}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <QrCode className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Statut:</span>
                    <span className={`font-medium ${assure.statut === 'Actif' ? 'text-green-600' : 'text-red-600'}`}>
                      {assure.statut}
                    </span>
                  </div>

                  <div className="pt-3 border-t flex gap-2">
                    <Button 
                      onClick={() => downloadCard(assure)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(generateQRCode(assure.numero), '_blank')}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
