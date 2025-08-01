import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  planId: number;
  onPaymentSuccess: () => void;
  userEmail: string;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const MERCADO_PAGO_PUBLIC_KEY = "APP_USR-5141244c-30ce-4351-bc4d-bf936b1f1951";

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  planName, 
  planPrice, 
  planId,
  onPaymentSuccess,
  userEmail 
}: PaymentModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const brickControllerRef = useRef<any>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      console.log('PaymentModal opened, initializing MercadoPago...');
      console.log('Container exists:', !!containerRef.current);
      console.log('Plan details:', { planName, planPrice, planId });
      
      // Add a small delay to ensure the modal is fully rendered
      setTimeout(() => {
        if (containerRef.current) {
          initializeMercadoPago();
        } else {
          console.error('Container still not available after delay');
        }
      }, 100);
    }

    return () => {
      if (brickControllerRef.current) {
        console.log('Unmounting brick controller');
        brickControllerRef.current.unmount();
        brickControllerRef.current = null;
      }
    };
  }, [isOpen, planPrice, planId]);

  const initializeMercadoPago = async () => {
    try {
      console.log('Starting MercadoPago initialization...');
      
      if (!containerRef.current) {
        console.error('Container ref is null');
        return;
      }

      // Load MercadoPago script if not already loaded
      if (!window.MercadoPago) {
        console.log('Loading MercadoPago script...');
        await loadMercadoPagoScript();
        console.log('MercadoPago script loaded successfully');
      } else {
        console.log('MercadoPago script already loaded');
      }

      // Clear any existing brick
      if (brickControllerRef.current) {
        console.log('Unmounting existing brick...');
        brickControllerRef.current.unmount();
        brickControllerRef.current = null;
      }

      // Clear container content
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      console.log('Creating MercadoPago instance with public key:', MERCADO_PAGO_PUBLIC_KEY);
      const mp = new window.MercadoPago(MERCADO_PAGO_PUBLIC_KEY);

      const settings = {
        initialization: {
          amount: planPrice,
          payer: {
            email: userEmail
          }
        },
        customization: {
          visual: {
            style: {
              theme: 'default'
            }
          },
          paymentMethods: {
            maxInstallments: 1
          }
        },
        callbacks: {
          onReady: () => {
            console.log('Payment brick ready');
          },
          onError: (error: any) => {
            console.error('Payment brick error:', error);
            if (errorRef.current) {
              errorRef.current.textContent = 'Erro nos dados do cartão.';
            }
          },
          onSubmit: async (formData: any) => {
            console.log('Form submitted with data:', formData);
            const cardToken = formData?.token;
            if (!cardToken) {
              console.error('No card token received');
              if (errorRef.current) {
                errorRef.current.textContent = 'Não foi possível gerar o token do cartão.';
              }
              return;
            }

            const submitButton = containerRef.current?.querySelector('[type="submit"]') as HTMLButtonElement;
            if (submitButton) {
              submitButton.disabled = true;
              submitButton.innerHTML = 'Processando...';
            }

            try {
              const token = localStorage.getItem('token');
              console.log('Sending upgrade request to API...');
              const response = await fetch('http://localhost:3000/plan/upgrade', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  new_plan_id: planId,
                  card_token_id: cardToken
                })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro no pagamento');
              }

              console.log('Payment successful');
              onPaymentSuccess();
              onClose();
            } catch (error: any) {
              console.error('Payment error:', error);
              if (errorRef.current) {
                errorRef.current.textContent = error.message || 'Erro no pagamento';
              }
              if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = `Assinar por R$ ${planPrice.toFixed(2).replace('.', ',')}`;
              }
            }
          }
        }
      };

      console.log('Creating brick with settings:', settings);
      brickControllerRef.current = await mp.bricks().create('cardPayment', containerRef.current, settings);
      console.log('Brick created successfully');
    } catch (error) {
      console.error('Error initializing MercadoPago:', error);
      if (errorRef.current) {
        errorRef.current.textContent = 'Erro ao carregar sistema de pagamento.';
      }
    }
  };

  const loadMercadoPagoScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.MercadoPago) {
        resolve();
        return;
      }

      console.log('Creating script element for MercadoPago...');
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => {
        console.log('MercadoPago script loaded via onload event');
        // Wait a bit for the script to be fully available
        setTimeout(() => resolve(), 100);
      };
      script.onerror = (error) => {
        console.error('Failed to load MercadoPago script:', error);
        reject(new Error('Failed to load MercadoPago script'));
      };
      document.head.appendChild(script);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-foreground">
            Pagamento da Assinatura
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Preencha os dados do seu cartão para assinar o plano <strong>{planName}</strong>.
          </p>
          
          <div ref={containerRef} className="min-h-[300px]" />
          
          <div ref={errorRef} className="text-destructive text-sm min-h-[20px]" />
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;