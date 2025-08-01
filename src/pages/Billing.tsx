import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  CheckCircle, 
  Star,
  Calendar,
  TrendingUp,
  AlertCircle,
  Crown,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentModal from "@/components/PaymentModal";

interface Plan {
  id: number;
  name: string;
  message_limit: number;
  price: number;
  features: string;
}

interface PlanStatus {
  plan_name: string;
  message_limit: number;
  messages_sent: number;
  messages_remaining: string | number;
  reset_date: string;
}

const Billing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<PlanStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchPlans(), fetchCurrentPlan(), fetchUserEmail()]);
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:3000/plan/available');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar planos disponíveis.",
        variant: "destructive",
      });
    }
  };

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/plan/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar informações do plano atual.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserEmail(userData.email || 'user@example.com');
        console.log('User email fetched:', userData.email);
      } else {
        console.log('Profile endpoint not available, using fallback email');
        setUserEmail('user@example.com');
      }
    } catch (error) {
      console.log('Error fetching user email, using fallback:', error);
      setUserEmail('user@example.com');
    }
  };

  const handleUpgrade = async (planId: number) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // For free plans, upgrade immediately
    if (plan.price === 0) {
      setUpgradeLoading(planId);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/plan/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            new_plan_id: planId
          })
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar plano');
        }

        toast({
          title: "Sucesso!",
          description: `Plano ${plan.name} ativado com sucesso!`,
        });

        fetchCurrentPlan();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar plano. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setUpgradeLoading(null);
      }
      return;
    }

    // For paid plans, open payment modal
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    toast({
      title: "Pagamento Aprovado!",
      description: `Plano ${selectedPlan?.name} ativado com sucesso!`,
    });
    
    // Refresh current plan status
    await fetchCurrentPlan();
    setSelectedPlan(null);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'grátis': return CheckCircle;
      case 'start': return Zap;
      case 'pro': return Star;
      case 'master': return TrendingUp;
      case 'enterprise': return Crown;
      default: return CheckCircle;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'grátis': return 'bg-muted text-muted-foreground';
      case 'start': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pro': return 'bg-primary/10 text-primary border-primary/20';
      case 'master': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'enterprise': return 'bg-gradient-primary text-white border-none';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isCurrentPlan = (planName: string) => {
    return currentPlan?.plan_name.toLowerCase() === planName.toLowerCase();
  };

  const getUsagePercentage = () => {
    if (!currentPlan || currentPlan.message_limit === -1) return 0;
    return (currentPlan.messages_sent / currentPlan.message_limit) * 100;
  };

  const parseFeatures = (featuresString: string) => {
    return featuresString.split(',').map(f => f.trim());
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Planos e Assinatura</h1>
          <p className="text-muted-foreground">Gerencie seu plano e acompanhe o uso.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="card-floating animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Planos e Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie seu plano atual e explore opções de upgrade.
        </p>
      </div>

      {/* Current Plan Status */}
      <Card className="card-floating border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <CreditCard className="h-5 w-5 mr-2 text-primary" />
            Plano Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Badge className={getPlanColor(currentPlan?.plan_name || '')}>
                  {currentPlan?.plan_name}
                </Badge>
                <span className="text-lg font-semibold text-foreground">
                  Plano {currentPlan?.plan_name}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uso de Mensagens</span>
                  <span className="text-foreground">
                    {currentPlan?.messages_sent} / {currentPlan?.message_limit === -1 ? '∞' : currentPlan?.message_limit}
                  </span>
                </div>
                <Progress value={getUsagePercentage()} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mensagens Restantes</p>
                  <p className="text-lg font-semibold text-foreground">
                    {currentPlan?.messages_remaining}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Renovação</p>
                  <p className="text-lg font-semibold text-foreground">
                    {currentPlan && formatDate(currentPlan.reset_date)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-10 w-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Status da Assinatura
                </p>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Ativo
                </Badge>
              </div>
            </div>
          </div>

          {getUsagePercentage() > 80 && currentPlan?.message_limit !== -1 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Atenção: Limite Próximo do Esgotamento
                  </p>
                  <p className="text-xs text-destructive/80 mt-1">
                    Você está usando {Math.round(getUsagePercentage())}% do seu limite mensal. 
                    Considere fazer upgrade para não interromper seus envios.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Todos os Planos</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const isPopular = plan.name.toLowerCase() === 'pro';
            const isCurrent = isCurrentPlan(plan.name);
            
            return (
              <Card 
                key={plan.id} 
                className={`card-floating relative border-border/30 ${
                  isPopular ? 'ring-2 ring-primary/50 scale-105' : ''
                } ${isCurrent ? 'ring-2 ring-accent/50' : ''}`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Mais Popular
                  </Badge>
                )}
                
                {isCurrent && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
                    Seu Plano Atual
                  </Badge>
                )}

                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="text-lg font-bold text-foreground mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-2xl font-bold text-foreground">
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-muted-foreground ml-1">/mês</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.message_limit === -1 ? 'Mensagens ilimitadas' : `${plan.message_limit} mensagens`}
                    </p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {parseFeatures(plan.features).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-3 w-3 text-primary mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      isCurrent 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isPopular 
                          ? 'btn-primary' 
                          : 'border-border/50 hover:border-primary/50'
                    }`}
                    variant={isCurrent ? 'outline' : isPopular ? 'default' : 'outline'}
                    disabled={isCurrent || upgradeLoading === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {upgradeLoading === plan.id ? (
                      "Processando..."
                    ) : isCurrent ? (
                      "Plano Atual"
                    ) : plan.price > 0 ? (
                      "Fazer Upgrade"
                    ) : (
                      "Selecionar"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Billing Info */}
      <Card className="card-floating border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Informações de Cobrança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Próxima Cobrança</p>
              <p className="text-lg font-semibold text-foreground">
                {currentPlan && formatDate(currentPlan.reset_date)}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Método de Pagamento</p>
              <p className="text-lg font-semibold text-foreground">
                {currentPlan?.plan_name === 'Grátis' ? 'Não aplicável' : 'Cartão •••• 1234'}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Ativo
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          planId={selectedPlan.id}
          onPaymentSuccess={handlePaymentSuccess}
          userEmail={userEmail}
        />
      )}
    </div>
  );
};

export default Billing;