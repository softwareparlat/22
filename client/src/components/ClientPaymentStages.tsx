
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  ExternalLink,
  Calendar,
  AlertCircle,
  Wallet,
  Play,
  Settings
} from "lucide-react";

interface PaymentStage {
  id: number;
  projectId: number;
  stageName: string;
  stagePercentage: number;
  amount: string;
  requiredProgress: number;
  status: string;
  paymentLink?: string;
  mercadoPagoId?: string;
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
}

interface ClientPaymentStagesProps {
  projectId: number;
  projectProgress: number;
  projectPrice: number;
}

export default function ClientPaymentStages({ 
  projectId, 
  projectProgress = 0,
  projectPrice = 0 
}: ClientPaymentStagesProps) {
  const { toast } = useToast();

  const { data: stages, isLoading, error } = useQuery({
    queryKey: ["payment-stages", projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/projects/${projectId}/payment-stages`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching payment stages:", error);
        throw error;
      }
    },
    enabled: !!projectId,
    retry: 2,
    staleTime: 30000,
  });

  const getStatusInfo = (status: string, stage: PaymentStage) => {
    const configs = {
      pending: { 
        label: "Pendiente", 
        variant: "secondary" as const, 
        icon: Clock,
        color: "text-gray-500",
        bgColor: "bg-gray-50 border-gray-200",
        description: `Se activará cuando el proyecto tenga ${stage.requiredProgress}% de progreso`
      },
      available: { 
        label: "¡Disponible para Pagar!", 
        variant: "default" as const, 
        icon: Wallet,
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-300",
        description: "Esta etapa está lista para ser pagada"
      },
      paid: { 
        label: "✅ Pagado", 
        variant: "default" as const, 
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        description: stage.paidDate ? `Pagado el ${new Date(stage.paidDate).toLocaleDateString()}` : "Completado"
      },
      overdue: { 
        label: "Vencido", 
        variant: "destructive" as const, 
        icon: AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        description: "Esta etapa necesita ser pagada"
      },
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getTotalPaid = () => {
    if (!stages) return 0;
    return stages
      .filter((stage: PaymentStage) => stage.status === 'paid')
      .reduce((total: number, stage: PaymentStage) => total + parseFloat(stage.amount), 0);
  };

  const getNextPaymentStage = () => {
    return stages?.find((stage: PaymentStage) => stage.status === 'available');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-32 bg-muted rounded-lg"></div>
        <div className="animate-pulse h-96 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    console.error("Payment stages error details:", error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error al cargar las etapas de pago
          </h3>
          <p className="text-red-700 mb-4">
            No se pudieron cargar las etapas de pago. Por favor, intenta recargar.
          </p>
          <div className="text-xs text-red-600 mb-4 bg-white p-2 rounded border">
            Error: {error instanceof Error ? error.message : 'Error desconocido'}
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Recargar Página
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Debug logging
  console.log("ClientPaymentStages - Project ID:", projectId);
  console.log("ClientPaymentStages - Stages data:", stages);
  console.log("ClientPaymentStages - Is loading:", isLoading);
  console.log("ClientPaymentStages - Error:", error);

  if (!stages || stages.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6 text-center">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-amber-600" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            Etapas de Pago Pendientes
          </h3>
          <p className="text-amber-700 mb-4">
            Las etapas de pago serán configuradas una vez que el proyecto sea aprobado por nuestro equipo.
          </p>
          <div className="bg-white p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-600">
              💡 Una vez configuradas, podrás pagar en 4 etapas del 25% cada una
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const nextPayment = getNextPaymentStage();

  return (
    <div className="space-y-6" data-payment-stages>
      {/* Header with Summary */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <DollarSign className="h-6 w-6" />
            Sistema de Pagos por Etapas - SoftwarePar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Explicación del Sistema */}
          <div className="bg-white p-4 rounded-lg border border-blue-200 mb-6">
            <h4 className="font-semibold text-blue-800 mb-3 text-lg">🚀 ¿Cómo funciona nuestro sistema?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-700 mb-2">📋 Proceso de Pago:</h5>
                <ul className="space-y-1 text-blue-600">
                  <li>• <strong>4 etapas del 25% cada una</strong></li>
                  <li>• Solo pagas cuando hay progreso real</li>
                  <li>• Te avisamos cuando puedes pagar</li>
                  <li>• Cada pago desbloquea la siguiente fase</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-700 mb-2">💡 Ventajas para ti:</h5>
                <ul className="space-y-1 text-blue-600">
                  <li>• <strong>Pago seguro y gradual</strong></li>
                  <li>• Control total del progreso</li>
                  <li>• Sin sorpresas ni pagos adelantados</li>
                  <li>• Garantía de avance constante</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">${projectPrice.toFixed(2)}</div>
              <div className="text-sm text-blue-600">Total del Proyecto</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${getTotalPaid().toFixed(2)}</div>
              <div className="text-sm text-green-600">Ya Pagado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{projectProgress}%</div>
              <div className="text-sm text-purple-600">Progreso Actual</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progreso del Proyecto:</span>
              <span className="font-medium">{projectProgress}%</span>
            </div>
            <Progress value={projectProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Next Payment Alert */}
      {nextPayment && (
        <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-green-800 text-xl">
                    🎉 ¡Tu Pago Está Listo!
                  </h3>
                  <Badge className="bg-green-500 text-white">DISPONIBLE</Badge>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">📋 Detalles del Pago:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-green-600">Etapa:</span>
                      <div className="font-medium text-green-800">{nextPayment.stageName}</div>
                    </div>
                    <div>
                      <span className="text-green-600">Monto:</span>
                      <div className="font-bold text-lg text-green-800">${parseFloat(nextPayment.amount).toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>🔄 ¿Qué pasa después del pago?</strong><br />
                    Una vez confirmado tu pago, nuestro equipo comenzará inmediatamente a trabajar en esta etapa. 
                    Recibirás actualizaciones regulares del progreso.
                  </p>
                </div>

                {nextPayment.paymentLink ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => window.open(nextPayment.paymentLink, "_blank")}
                      className="bg-green-600 hover:bg-green-700 text-white text-lg py-3 px-6 shadow-lg"
                      size="lg"
                    >
                      <Wallet className="h-5 w-5 mr-2" />
                      Pagar ${parseFloat(nextPayment.amount).toFixed(2)} - Iniciar Trabajo
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.open(nextPayment.paymentLink, "_blank")}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Link de Pago
                    </Button>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <h4 className="font-medium text-amber-800">Link de Pago en Preparación</h4>
                    </div>
                    <p className="text-sm text-amber-700">
                      💳 Nuestro equipo está generando tu link de pago seguro. 
                      Te notificaremos por email cuando esté listo (generalmente en menos de 1 hora).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Stages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Etapas de Pago ({stages.length}/4)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage: PaymentStage, index: number) => {
              const statusInfo = getStatusInfo(stage.status, stage);
              const Icon = statusInfo.icon;
              
              return (
                <div
                  key={stage.id}
                  className={`p-4 rounded-lg border transition-all ${statusInfo.bgColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          stage.status === 'paid' ? 'bg-green-500 text-white' :
                          stage.status === 'available' ? 'bg-blue-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {stage.status === 'paid' ? '✓' : index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{stage.stageName}</h4>
                          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                          <div>
                            <span className="text-muted-foreground">Porcentaje:</span>
                            <div className="font-medium">{stage.stagePercentage}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Monto:</span>
                            <div className="font-bold text-lg">${parseFloat(stage.amount).toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Progreso Requerido:</span>
                            <div className="font-medium">{stage.requiredProgress}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Estado:</span>
                            <div className={`font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {statusInfo.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {stage.status === 'available' && stage.paymentLink && (
                        <Button 
                          onClick={() => window.open(stage.paymentLink, "_blank")}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <Wallet className="h-4 w-4 mr-1" />
                          Pagar
                        </Button>
                      )}
                      
                      {stage.status === 'available' && !stage.paymentLink && (
                        <div className="text-xs text-center text-blue-600 bg-white p-2 rounded border">
                          Link de pago<br />en preparación
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-purple-800 text-xl">🎯 Metodología SoftwarePar - Desarrollo por Etapas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Metodología */}
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3">🏗️ Nuestra Metodología de Trabajo:</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold">1</span>
                  </div>
                  <h5 className="font-medium text-purple-700">Anticipo (25%)</h5>
                  <p className="text-purple-600">Iniciamos desarrollo inmediatamente</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <h5 className="font-medium text-purple-700">50% Progreso (25%)</h5>
                  <p className="text-purple-600">Funcionalidades core desarrolladas</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h5 className="font-medium text-purple-700">Pre-entrega (25%)</h5>
                  <p className="text-purple-600">90% completo, revisiones finales</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold">4</span>
                  </div>
                  <h5 className="font-medium text-purple-700">Entrega (25%)</h5>
                  <p className="text-purple-600">Proyecto 100% terminado</p>
                </div>
              </div>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Beneficios para Ti:
                </h4>
                <ul className="space-y-1 text-green-700">
                  <li>• <strong>Pago gradual:</strong> Solo pagas por progreso real</li>
                  <li>• <strong>Control total:</strong> Ves el avance antes de cada pago</li>
                  <li>• <strong>Sin riesgo:</strong> No hay pagos adelantados grandes</li>
                  <li>• <strong>Transparencia:</strong> Comunicación constante del progreso</li>
                  <li>• <strong>Calidad:</strong> Cada etapa es revisada antes del siguiente pago</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Garantías SoftwarePar:
                </h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• <strong>Inicio inmediato:</strong> Trabajamos desde el primer pago</li>
                  <li>• <strong>Actualizaciones frecuentes:</strong> Te mantenemos informado</li>
                  <li>• <strong>Calidad garantizada:</strong> Revisiones en cada etapa</li>
                  <li>• <strong>Comunicación directa:</strong> Canal de comunicación 24/7</li>
                  <li>• <strong>Entrega puntual:</strong> Cumplimos fechas establecidas</li>
                </ul>
              </div>
            </div>

            {/* Nota importante */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">💡 Importante:</h4>
                  <p className="text-sm text-yellow-700">
                    Este sistema nos permite mantener la mejor calidad en cada proyecto, ya que trabajamos con 
                    recursos asegurados y tu tienes control total del progreso. Es una metodología win-win 
                    que hemos perfeccionado en años de experiencia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
