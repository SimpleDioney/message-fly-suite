import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Send, Upload, Download, MessageSquare, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  to: string;
  message: string;
  media_url?: string;
}

const MessageSender = () => {
  // Individual Message State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Batch Message State
  const [csvData, setCsvData] = useState("");
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState<any[]>([]);

  const { toast } = useToast();

  const validatePhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Brazilian phone number should have 10-13 digits
    return cleaned.length >= 10 && cleaned.length <= 13;
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // URL is optional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSingleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !message) {
      toast({
        title: "Erro",
        description: "Número de telefone e mensagem são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Erro",
        description: "Número de telefone inválido. Use o formato: +5511999999999",
        variant: "destructive",
      });
      return;
    }

    if (mediaUrl && !validateUrl(mediaUrl)) {
      toast({
        title: "Erro",
        description: "URL da mídia inválida.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: phoneNumber.replace(/\D/g, ''),
          message,
          media_url: mediaUrl || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Mensagem enviada com sucesso.",
        });
        
        // Clear form
        setPhoneNumber("");
        setMessage("");
        setMediaUrl("");
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao enviar mensagem.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole os dados CSV.",
        variant: "destructive",
      });
      return;
    }

    setIsBatchLoading(true);
    setBatchResults([]);

    try {
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const contacts: Contact[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [to, message, media_url] = line.split(',').map(col => col.trim().replace(/['"]/g, ''));
        
        if (to && message) {
          contacts.push({ to: to.replace(/\D/g, ''), message, media_url });
        }
      }

      if (contacts.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum contato válido encontrado no CSV.",
          variant: "destructive",
        });
        return;
      }

      if (contacts.length > 100) {
        toast({
          title: "Erro",
          description: "Máximo de 100 contatos por lote.",
          variant: "destructive",
        });
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/messages/send-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ contacts }),
      });

      const data = await response.json();

      if (response.status === 207) { // Multi-status response
        setBatchResults(data.report);
        toast({
          title: "Lote Processado",
          description: `Processamento concluído. Verifique os resultados abaixo.`,
        });
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao processar lote.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsBatchLoading(false);
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = "numero,mensagem,url_midia\n+5511999999999,Olá! Esta é uma mensagem de teste.,\n+5521888888888,Mensagem com mídia,https://exemplo.com/imagem.jpg";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_envio_lote.csv';
    link.click();
  };

  return (
    <div className="flex-1 space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Enviar Mensagens</h1>
        <p className="text-muted-foreground">
          Envie mensagens individuais ou em lote via WhatsApp.
        </p>
      </div>

      <Tabs defaultValue="individual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-muted/30">
          <TabsTrigger value="individual" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Envio Individual
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Envio em Lote
          </TabsTrigger>
        </TabsList>

        {/* Individual Send */}
        <TabsContent value="individual">
          <Card className="card-floating border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Envio Individual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleSend} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                      Número de Telefone *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+5511999999999"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-input border-border/50 focus:border-primary"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Formato: +55 11 99999-9999 (com código do país)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="media" className="text-foreground">
                      URL da Mídia (opcional)
                    </Label>
                    <Input
                      id="media"
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="bg-input border-border/50 focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL de imagem ou vídeo para anexar
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">
                    Mensagem *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Digite sua mensagem aqui..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-input border-border/50 focus:border-primary min-h-[120px]"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {message.length}/1000 caracteres
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Send */}
        <TabsContent value="batch">
          <div className="space-y-6">
            <Card className="card-floating border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Envio em Lote
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadCSVTemplate}
                    className="border-border/50 hover:border-primary/50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Modelo CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBatchSend} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="csvData" className="text-foreground">
                      Dados CSV *
                    </Label>
                    <Textarea
                      id="csvData"
                      placeholder="Cole aqui os dados no formato CSV:&#10;numero,mensagem,url_midia&#10;+5511999999999,Olá! Esta é uma mensagem.,&#10;+5521888888888,Mensagem com mídia,https://exemplo.com/imagem.jpg"
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      className="bg-input border-border/50 focus:border-primary min-h-[200px] font-mono text-sm"
                      required
                    />
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      <span>Formato: numero,mensagem,url_midia (máximo 100 contatos)</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-primary"
                    disabled={isBatchLoading}
                  >
                    {isBatchLoading ? (
                      "Processando..."
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Processar Lote
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Batch Results */}
            {batchResults.length > 0 && (
              <Card className="card-floating border-border/30">
                <CardHeader>
                  <CardTitle className="text-foreground">Resultados do Lote</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {batchResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/20"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {result.to.substring(0, 8)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {result.details}
                          </p>
                        </div>
                        <Badge
                          variant={result.status === 'sent' ? 'default' : 'destructive'}
                          className={result.status === 'sent' ? 'bg-primary/10 text-primary' : ''}
                        >
                          {result.status === 'sent' ? 'Enviado' : 'Falhou'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-lg font-bold text-primary">
                        {batchResults.filter(r => r.status === 'sent').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Enviados</p>
                    </div>
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="text-lg font-bold text-destructive">
                        {batchResults.filter(r => r.status === 'failed').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Falharam</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessageSender;