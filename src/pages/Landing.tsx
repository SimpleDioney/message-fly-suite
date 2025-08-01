import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Zap, Shield, BarChart3, CheckCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    id: 1,
    name: "Grátis",
    price: "R$ 0",
    period: "/mês",
    messageLimit: "5 mensagens",
    features: ["Testes básicos", "Suporte por email", "1 número"],
    isPopular: false,
    buttonText: "Começar Grátis"
  },
  {
    id: 2,
    name: "Start",
    price: "R$ 19",
    period: ",90/mês",
    messageLimit: "100 mensagens",
    features: ["Suporte por email", "Relatórios básicos", "1 número"],
    isPopular: false,
    buttonText: "Assinar Start"
  },
  {
    id: 3,
    name: "Pro",
    price: "R$ 39",
    period: ",90/mês",
    messageLimit: "500 mensagens",
    features: ["Suporte prioritário", "1 número fixo", "Relatórios avançados", "API"],
    isPopular: true,
    buttonText: "Assinar Pro"
  },
  {
    id: 4,
    name: "Master",
    price: "R$ 89",
    period: ",90/mês",
    messageLimit: "2.000 mensagens",
    features: ["Suporte prioritário", "Múltiplos números", "Analytics", "Webhooks"],
    isPopular: false,
    buttonText: "Assinar Master"
  },
  {
    id: 5,
    name: "Enterprise",
    price: "R$ 199",
    period: ",90/mês",
    messageLimit: "Ilimitado",
    features: ["Suporte 24h", "Números ilimitados", "Custom API", "White Label"],
    isPopular: false,
    buttonText: "Falar com Vendas"
  }
];

const features = [
  {
    icon: MessageSquare,
    title: "Automação Inteligente",
    description: "Envie mensagens automatizadas via WhatsApp com alta taxa de entrega"
  },
  {
    icon: Zap,
    title: "Velocidade Garantida",
    description: "Processamento rápido de milhares de mensagens simultaneamente"
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Seus dados protegidos com criptografia de ponta a ponta"
  },
  {
    icon: BarChart3,
    title: "Analytics Avançado",
    description: "Relatórios detalhados sobre entrega e performance das mensagens"
  }
];

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold text-foreground">Notifly</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#funcionalidades" className="text-muted-foreground hover:text-foreground link-hover">
                Funcionalidades
              </a>
              <a href="#planos" className="text-muted-foreground hover:text-foreground link-hover">
                Planos
              </a>
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="btn-primary">
                  Comece Agora
                </Button>
              </Link>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-muted-foreground"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#funcionalidades" className="block px-3 py-2 text-muted-foreground hover:text-foreground">
                Funcionalidades
              </a>
              <a href="#planos" className="block px-3 py-2 text-muted-foreground hover:text-foreground">
                Planos
              </a>
              <Link to="/login" className="block px-3 py-2 text-muted-foreground hover:text-foreground">
                Login
              </Link>
              <Link to="/register" className="block px-3 py-2">
                <Button className="btn-primary w-full">Comece Agora</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Automatize suas
              <span className="text-primary bg-gradient-primary bg-clip-text text-transparent"> notificações </span>
              via WhatsApp
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              A plataforma SaaS mais avançada para envio automatizado de mensagens WhatsApp. 
              Alcance seus clientes com eficiência e profissionalismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="btn-primary text-lg px-8 py-3">
                  Começar Gratuitamente
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-border/50 hover:border-primary/50">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Funcionalidades Poderosas
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para automatizar e otimizar sua comunicação via WhatsApp
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-floating animate-fade-in border-border/30">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Planos que Crescem com Você
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano perfeito para suas necessidades. Upgrade ou downgrade a qualquer momento.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`card-floating relative animate-fade-in border-border/30 ${
                  plan.isPopular ? 'ring-2 ring-primary/50 scale-105' : ''
                }`}
              >
                {plan.isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Mais Popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.messageLimit}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/register">
                    <Button 
                      className={`w-full ${
                        plan.isPopular ? 'btn-primary' : 'border-border/50 hover:border-primary/50'
                      }`}
                      variant={plan.isPopular ? 'default' : 'outline'}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para Revolucionar sua Comunicação?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se a milhares de empresas que já automatizaram suas notificações
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-primary-green hover:bg-white/90 text-lg px-8 py-3">
              Começar Agora Gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <MessageSquare className="h-6 w-6 text-primary mr-2" />
              <span className="text-lg font-bold text-foreground">Notifly</span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2024 Notifly. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;