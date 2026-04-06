import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }
    // Vérifier si bloqué
    if (blockedUntil && Date.now() < blockedUntil) {
      const remaining = Math.ceil((blockedUntil - Date.now()) / 60000);
      toast({ title: "Compte temporairement bloqué", description: `Trop de tentatives. Réessayez dans ${remaining} minute(s).`, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      setFailedAttempts(0);
      setBlockedUntil(null);
      navigate('/dashboard');
    } catch (error: any) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        const blockTime = Date.now() + 5 * 60 * 1000;
        setBlockedUntil(blockTime);
        toast({ title: "Compte bloqué", description: "5 tentatives échouées. Compte bloqué pendant 5 minutes.", variant: "destructive" });
      } else {
        toast({ title: "Erreur de connexion", description: `${error.message || "Email ou mot de passe incorrect"} (${5 - newAttempts} tentative(s) restante(s))`, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: "Erreur", description: "Veuillez entrer votre email", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères", variant: "destructive" });
      return;
    }

    // Vérifier si l'email existe dans les comptes enregistrés
    const savedUsers: any[] = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const userIndex = savedUsers.findIndex((u: any) => u.email === resetEmail);

    if (userIndex === -1) {
      toast({ title: "Erreur", description: "Aucun compte trouvé avec cet email", variant: "destructive" });
      return;
    }

    // Mettre à jour le mot de passe
    savedUsers[userIndex].password = newPassword;
    localStorage.setItem('registered_users', JSON.stringify(savedUsers));

    toast({ title: "Succès", description: "Mot de passe modifié avec succès ! Vous pouvez vous connecter." });
    setShowReset(false);
    setEmail(resetEmail);
    setPassword("");
    setResetEmail("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#E8F4F8' }}>
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo1.png" alt="Logo" className="w-16 h-16 object-contain mb-4" />
          <h1 className="text-3xl font-bold">{showReset ? "Réinitialiser" : "Connexion"}</h1>
          <p className="text-gray-600 mt-2">{showReset ? "Modifiez votre mot de passe" : "Accédez à votre espace"}</p>
        </div>

        {!showReset ? (
          <>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2"
                  disabled={loading}
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{" "}
                <button type="button" onClick={() => navigate('/signup')} className="text-blue-600 hover:underline font-semibold">
                  S'inscrire
                </button>
              </p>
              <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-blue-600">
                Retour à l'accueil
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <Label htmlFor="resetEmail">Email de votre compte</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="votre@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Modifier le mot de passe
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Retour à la connexion
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
