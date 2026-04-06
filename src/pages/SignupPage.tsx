import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Users, Mail, RefreshCw, Copy } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { tempEmailService } from "@/services/emailService";

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [searchParams] = useSearchParams();
  
  const urlRole = searchParams.get('role') as UserRole;
  const initialRole = urlRole === 'prestataire' ? 'prestataire' : 'client'; // admin non autorisé via URL
  
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState("");
  const [useTempEmail, setUseTempEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);

  const generateTempEmail = () => {
    const newTempEmail = tempEmailService.generateTempEmail();
    setTempEmail(newTempEmail);
    toast({
      title: "Email temporaire généré",
      description: "Vous pouvez l'utiliser pour votre inscription",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié!",
      description: "L'email temporaire a été copié",
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalEmail = useTempEmail ? tempEmail : email;

    if (!finalEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer ou générer un email",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 8 caractères", variant: "destructive" });
      return;
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins une majuscule et un chiffre", variant: "destructive" });
      return;
    }

    if (!fullName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom complet est requis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await signUp(finalEmail, password, role, fullName, organization);
      toast({
        title: "Compte créé avec succès !",
        description: "Vous pouvez maintenant vous connecter avec vos identifiants.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
    {
      value: 'prestataire',
      label: 'Prestataire',
      description: 'Fournisseur de services',
      icon: <Stethoscope className="w-5 h-5" />,
    },
    {
      value: 'client',
      label: 'Client',
      description: 'Assuré',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#E8F4F8' }}>
      <Card className="w-full max-w-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo1.png" alt="Logo" className="w-16 h-16 object-contain mb-4" />
          <h1 className="text-3xl font-bold">Créer un compte</h1>
          <p className="text-gray-600 mt-2">Rejoignez Papy Services Assurances</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* Role Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Sélectionnez votre rôle</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 justify-center mx-auto max-w-md">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    role === r.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={role === r.value ? 'text-blue-600' : 'text-gray-600'}>
                      {r.icon}
                    </span>
                    <span className="font-semibold text-sm">{r.label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{r.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jean Dupont"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          {/* Organization (for prestataires and admins) */}
          {(role === 'prestataire' || role === 'admin') && (
            <div>
              <Label htmlFor="organization">Organisation/Clinique</Label>
              <Input
                id="organization"
                type="text"
                placeholder="Nom de votre organisation"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="mt-2"
              />
            </div>
          )}

          {/* Email (Permanent or Temporary) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Email</Label>
              <button
                type="button"
                onClick={() => {
                  setUseTempEmail(!useTempEmail);
                  if (!useTempEmail && !tempEmail) {
                    generateTempEmail();
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {useTempEmail ? "Utiliser un vrai email" : "Email temporaire?"}
              </button>
            </div>

            {!useTempEmail ? (
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="mt-2"
              />
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg bg-blue-50 border-blue-200">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <input
                    type="text"
                    value={tempEmail}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-blue-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(tempEmail)}
                    className="p-1.5 hover:bg-blue-200 rounded transition-colors"
                    title="Copier"
                  >
                    <Copy className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generateTempEmail}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  title="Générer un nouveau temporaire"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-xs text-gray-500">
              {useTempEmail ? (
                <>📧 Email temporaire - À remplacer par votre vrai email après vérification</>
              ) : (
                <>📧 Vous recevrez un email de confirmation</>
              )}
            </p>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">Au moins 8 caractères</p>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all"
            disabled={loading}
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Vous avez déjà un compte?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-semibold"
            >
              Connectez-vous
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SignupPage;
