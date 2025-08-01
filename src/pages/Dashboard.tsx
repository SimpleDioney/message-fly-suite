import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  Send,
  BarChart3,
  Activity,
  Users,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface PlanStatus {
  plan_name: string;
  message_limit: number;
  messages_sent: number;
  messages_remaining: string | number;
  reset_date: string;
}

const Dashboard = () => {
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlanStatus();
  }, []);

  const fetchPlanStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/plan/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlanStatus(data);
      } else {
        toast({
          title: "Erro",
          description: "Erro ao carregar informações do plano.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUsagePercentage = () => {
    if (!planStatus || planStatus.message_limit === -1) return 0;
    return (planStatus.messages_sent / planStatus.message_limit) * 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'grátis': return 'bg-muted text-muted-foreground';
      case 'start': return 'bg-blue-500/10 text-blue-500';
      case 'pro': return 'bg-primary/10 text-primary';
      case 'master': return 'bg-purple-500/10 text-purple-500';
      case 'enterprise': return 'bg-gradient-primary text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está um resumo da sua conta.</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="card-floating animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
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
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está um resumo da sua conta.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-floating border-border/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plano Atual
            </CardTitle>
            <Badge className={getPlanColor(planStatus?.plan_name || '')}>
              {planStatus?.plan_name}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {planStatus?.plan_name}
            </div>
            <p className="text-xs text-muted-foreground">
              Renovação em {planStatus && formatDate(planStatus.reset_date)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-floating border-border/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mensagens Enviadas
            </CardTitle>
            <Send className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {planStatus?.messages_sent || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card className="card-floating border-border/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mensagens Restantes
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {planStatus?.messages_remaining}
            </div>
            <p className="text-xs text-muted-foreground">
              {planStatus?.message_limit === -1 ? "Ilimitado" : "Disponível"}
            </p>
          </CardContent>
        </Card>

        <Card className="card-floating border-border/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Sucesso
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">98.5%</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Plan Status Card */}
        <Card className="card-floating border-border/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Status do Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uso de Mensagens</span>
                <span className="text-foreground">
                  {planStatus?.messages_sent} / {planStatus?.message_limit === -1 ? '∞' : planStatus?.message_limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage()} 
                className="h-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Plano</p>
                <p className="text-lg font-semibold text-foreground">{planStatus?.plan_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Renovação</p>
                <p className="text-lg font-semibold text-foreground">
                  {planStatus && formatDate(planStatus.reset_date)}
                </p>
              </div>
            </div>

            {getUsagePercentage() > 80 && planStatus?.message_limit !== -1 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Atenção: Você está próximo do limite do seu plano
                </p>
                <p className="text-xs text-destructive/80 mt-1">
                  Considere fazer upgrade para não interromper seus envios
                </p>
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <Link to="/billing" className="flex-1">
                <Button variant="outline" className="w-full border-border/50 hover:border-primary/50">
                  Gerenciar Plano
                </Button>
              </Link>
              <Link to="/sender" className="flex-1">
                <Button className="w-full btn-primary">
                  Enviar Mensagem
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-floating border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/sender">
              <Button className="w-full justify-start btn-primary">
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </Button>
            </Link>
            
            <Link to="/history">
              <Button variant="outline" className="w-full justify-start border-border/50 hover:border-primary/50">
                <MessageSquare className="h-4 w-4 mr-2" />
                Ver Histórico
              </Button>
            </Link>
            
            <Link to="/billing">
              <Button variant="outline" className="w-full justify-start border-border/50 hover:border-primary/50">
                <Users className="h-4 w-4 mr-2" />
                Upgrade do Plano
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="card-floating border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Mensagem enviada", target: "+55 11 98765-4321", status: "sucesso", time: "2 min atrás" },
              { action: "Lote processado", target: "25 contatos", status: "sucesso", time: "15 min atrás" },
              { action: "Mensagem enviada", target: "+55 21 91234-5678", status: "sucesso", time: "1 hora atrás" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.target}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                    {activity.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;