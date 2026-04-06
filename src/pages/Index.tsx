import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Users, FileText, Activity, ArrowRight, CheckCircle2, Sparkles, Menu, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Star, TrendingUp, Clock, Award, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FeatureSection } from "@/components/FeatureSection";
import { AIChatbot } from "@/components/AIChatbot";

const Index = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const slides = [
    {
      title: "Gérez vos assurances en toute simplicité",
      subtitle: "Une plateforme complète pour tous vos besoins d'assurance santé",
      gradient: "from-blue-600 via-purple-600 to-pink-600",
      image: "/images/slide1.jpg"
    },
    {
      title: "Suivi en temps réel de vos sinistres",
      subtitle: "Traitez les demandes de remboursement rapidement et efficacement",
      gradient: "from-emerald-600 via-teal-600 to-cyan-600",
      image: "/images/slide2.jpg"
    },
    {
      title: "Sécurité et conformité garanties",
      subtitle: "Vos données protégées selon les normes les plus strictes",
      gradient: "from-orange-600 via-red-600 to-pink-600",
      image: "/images/slide3.jpg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { 
      icon: Users, 
      title: "Gestion des Assurés", 
      desc: "Gérez vos clients et bénéficiaires en toute simplicité. Centralisez toutes les informations, suivez l'historique médical, gérez les ayants-droit et accédez instantanément aux dossiers complets. Interface intuitive pour une gestion optimale de votre portefeuille clients.", 
      color: "from-blue-500 to-cyan-500" 
    },
    { 
      icon: FileText, 
      title: "Polices d'Assurance", 
      desc: "Créez et suivez vos contrats d'assurance santé. Générez automatiquement les polices, gérez les renouvellements, suivez les garanties et plafonds en temps réel. Personnalisez les couvertures selon les besoins spécifiques de chaque client.", 
      color: "from-purple-500 to-pink-500" 
    },
    { 
      icon: Activity, 
      title: "Suivi des Sinistres", 
      desc: "Traitez les demandes de remboursement efficacement. Workflow automatisé de validation, calcul intelligent des remboursements selon les garanties, notifications en temps réel et historique complet. Réduisez les délais de traitement de 70%.", 
      color: "from-orange-500 to-red-500" 
    },
    { 
      icon: Shield, 
      title: "Sécurité Optimale", 
      desc: "Vos données protégées selon les normes les plus strictes. Conformité RGPD, chiffrement de bout en bout, sauvegardes automatiques quotidiennes, authentification multi-facteurs et traçabilité complète de toutes les opérations.", 
      color: "from-emerald-500 to-teal-500" 
    }
  ];

  const testimonials = [
    { name: "Marie Dubois", role: "Directrice RH", text: "Une solution exceptionnelle qui a transformé notre gestion d'assurance.", rating: 5 },
    { name: "Jean Martin", role: "Gérant d'entreprise", text: "Interface intuitive et support client réactif. Je recommande vivement!", rating: 5 },
    { name: "Sophie Laurent", role: "Responsable Santé", text: "Gain de temps considérable dans le traitement des dossiers.", rating: 5 }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E8F4F8' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-lg shadow-md z-[100] border-b border-blue-100 rounded-b-3xl">
        <div className="px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo1.png" alt="Logo" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Papy Services</span>
                <p className="text-xs text-gray-500 -mt-1">Assurances</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">Fonctionnalités</a>
              <a href="#testimonials" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">Témoignages</a>
              <a href="#contact" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">Contact</a>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <Button onClick={() => navigate('/login')} variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium btn-ripple">Connexion</Button>
              <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all ml-2 btn-ripple">Commencer</Button>
            </div>

            <button className="md:hidden p-2 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-blue-100">
              <a href="#features" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors font-medium">Fonctionnalités</a>
              <a href="#testimonials" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors font-medium">Témoignages</a>
              <a href="#contact" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors font-medium">Contact</a>
              <div className="border-t border-blue-100 my-2"></div>
              <Button onClick={() => navigate('/login')} variant="outline" className="w-full btn-ripple">Connexion</Button>
              <Button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 btn-ripple">Commencer</Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Slider */}
      <div className="relative h-[600px] overflow-hidden pt-20">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="relative h-full">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-85`}></div>
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="container mx-auto px-4 text-center">
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in drop-shadow-lg">{slide.title}</h1>
                  <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">{slide.subtitle}</p>
                  <div className="flex gap-4 justify-center">
                    <Button size="lg" onClick={() => navigate('/login')} className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 btn-ripple">
                      Démarrer maintenant <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10 bg-transparent">
        <div className="container mx-auto px-4 -mt-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 rounded-3xl shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold mb-1">10K+</div>
              <div className="text-blue-100">Assurés actifs</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold mb-1">24/7</div>
              <div className="text-blue-100">Support disponible</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold mb-1">99.9%</div>
              <div className="text-blue-100">Satisfaction client</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold mb-1">100%</div>
              <div className="text-blue-100">Sécurisé</div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Sticky Images */}
      <section id="features" className="relative z-20">
        <FeatureSection
          icon={<Users className="w-4 h-4" />}
          badge="Gestion"
          badgeColor="bg-blue-100 text-blue-700"
          title="Gestion des Assurés"
          description="Gérez vos clients et bénéficiaires en toute simplicité. Centralisez toutes les informations, suivez l'historique médical, gérez les ayants-droit et accédez instantanément aux dossiers complets. Interface intuitive pour une gestion optimale de votre portefeuille clients."
          image="/images/feature1.jpg"
          imagePosition="right"
          bgColor="#F0F8FB"
        />
        
        <FeatureSection
          icon={<FileText className="w-4 h-4" />}
          badge="Contrats"
          badgeColor="bg-purple-100 text-purple-700"
          title="Polices d'Assurance"
          description="Créez et suivez vos contrats d'assurance santé. Générez automatiquement les polices, gérez les renouvellements, suivez les garanties et plafonds en temps réel. Personnalisez les couvertures selon les besoins spécifiques de chaque client."
          image="/images/feature2.jpg"
          imagePosition="left"
          bgColor="#E8F4F8"
        />
        
        <FeatureSection
          icon={<Activity className="w-4 h-4" />}
          badge="Sinistres"
          badgeColor="bg-orange-100 text-orange-700"
          title="Suivi des Sinistres"
          description="Traitez les demandes de remboursement efficacement. Workflow automatisé de validation, calcul intelligent des remboursements selon les garanties, notifications en temps réel et historique complet. Réduisez les délais de traitement de 70%."
          image="/images/feature3.jpg"
          imagePosition="right"
          bgColor="#F0F8FB"
        />
        
        <FeatureSection
          icon={<Shield className="w-4 h-4" />}
          badge="Sécurité"
          badgeColor="bg-emerald-100 text-emerald-700"
          title="Sécurité Optimale"
          description="Vos données protégées selon les normes les plus strictes. Conformité RGPD, chiffrement de bout en bout, sauvegardes automatiques quotidiennes, authentification multi-facteurs et traçabilité complète de toutes les opérations."
          image="/images/feature4.jpg"
          imagePosition="left"
          bgColor="#E8F4F8"
        />
      </section>

      {/* Benefits Section */}
      <section className="py-20 -mt-10 relative z-30 rounded-t-[50px]" style={{ backgroundColor: '#E8F4F8' }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Pourquoi choisir notre plateforme ?</h2>
              <div className="space-y-4">
                {[
                  "Interface intuitive et moderne",
                  "Gestion complète des polices et sinistres",
                  "Suivi en temps réel des remboursements",
                  "Cartes d'assurance avec QR Code",
                  "Rapports et analyses détaillés",
                  "Support client réactif 24/7"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <img src="/logo1.png" alt="Logo" className="w-32 h-32 object-contain mx-auto mb-4" />
                  <p className="text-2xl font-bold text-gray-800">Sécurité & Fiabilité</p>
                  <p className="text-gray-600 mt-2">Certifié et conforme</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 -mt-10 relative z-40 rounded-t-[50px]" style={{ backgroundColor: '#F0F8FB' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ce que disent nos clients</h2>
            <p className="text-xl text-gray-600">Des milliers d'entreprises nous font confiance</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-8 border-none shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration CTA Section */}
      <section className="py-20 -mt-10 relative z-50 rounded-t-[50px]" style={{ backgroundColor: '#E8F4F8' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Rejoignez notre plateforme</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Créez votre compte en tant qu'administrateur, prestataire ou client</p>
          </div>

          {/* Registration Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Admin Card */}
            <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full opacity-50"></div>
              <div className="relative p-8">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Administrateur</h3>
                <p className="text-gray-600 mb-6">Gérez la plateforme complète, superviser les utilisateurs et contrôler tous les modules.</p>
                <ul className="space-y-2 mb-8 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Accès complet au dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Gestion des utilisateurs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Rapports avancés</span>
                  </li>
                </ul>
                <Button onClick={() => navigate('/signup?role=admin')} className="w-full bg-blue-600 hover:bg-blue-700">
                  Créer un compte admin
                </Button>
              </div>
            </Card>

            {/* Prestataire Card */}
            <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-500 md:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-full opacity-50"></div>
              <div className="relative p-8">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">POPULAIRE</div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Prestataire</h3>
                <p className="text-gray-600 mb-6">Fournissez vos services de santé et gériez vos consultations, prescriptions et remboursements.</p>
                <ul className="space-y-2 mb-8 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Gestion des consultations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Prescriptions simplifiées</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Suivi des remboursements</span>
                  </li>
                </ul>
                <Button onClick={() => navigate('/signup?role=prestataire')} className="w-full bg-purple-600 hover:bg-purple-700">
                  Créer un compte prestataire
                </Button>
              </div>
            </Card>

            {/* Client Card */}
            <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-full opacity-50"></div>
              <div className="relative p-8">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Client</h3>
                <p className="text-gray-600 mb-6">Accédez à vos assurances, consultez vos sinistres et gérez vos remboursements facilement.</p>
                <ul className="space-y-2 mb-8 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Suivi des assurances</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Gestion des sinistres</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Accès aux cartes</span>
                  </li>
                </ul>
                <Button onClick={() => navigate('/signup?role=client')} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Créer un compte client
                </Button>
              </div>
            </Card>
          </div>

          {/* Already have account */}
          <div className="text-center">
            <p className="text-gray-600 text-lg">Vous avez déjà un compte?</p>
            <Button variant="link" onClick={() => navigate('/login')} className="mt-2 text-blue-600 text-lg">
              Se connecter maintenant
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-16 relative z-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo1.png" alt="Logo" className="w-10 h-10 object-contain flex-shrink-0" />
                <span className="text-lg font-bold text-white leading-tight">Papy Services<br/>Assurances</span>
              </div>
              <p className="text-gray-400">La solution complète pour gérer vos assurances santé avec efficacité.</p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Témoignages</a></li>
                <li><button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">Dashboard</button></li>
                <li><button onClick={() => navigate('/polices')} className="hover:text-white transition-colors">Polices</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+221 77 527 97 27</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>bassniang7@yahoo.fr</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Rufisque Ouest, Cité Poste, Lot N°67</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Suivez-nous</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Papy Services Assurances. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default Index;
