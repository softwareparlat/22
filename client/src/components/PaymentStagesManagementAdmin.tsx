
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  Plus,
  AlertCircle,
  ExternalLink,
  Calendar,
  TrendingUp
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

interface PaymentStagesManagementAdminProps {
  projectId: number;
  projectProgress: number;
  projectPrice: number;
}

export default function PaymentStagesManagementAdmin({ 
  projectId, 
  projectProgress,
  projectPrice 
}: PaymentStagesManagementAdminProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showCreateStages, setShowCreateStages] = useState(false);

  const { data: stages, isLoading } = useQuery({
    queryKey: ["/api/projects", projectId, "payment-stages"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/projects/${projectId}/payment-stages`);
      return await response.json();
    },
  });

  const createStagesMutation = useMutation({
    mutationFn: async () => {
      console.log("🚀 Iniciando creación de etapas para proyecto:", projectId);
      const defaultStages = [
        { name: "Anticipo - Inicio del Proyecto", percentage: 25, requiredProgress: 0 },
        { name: "Avance 50% - Desarrollo", percentage: 25, requiredProgress: 50 },
        { name: "Pre-entrega - 90% Completado", percentage: 25, requiredProgress: 90 },
        { name: "Entrega Final", percentage: 25, requiredProgress: 100 }
      ];

      console.log("📋 Etapas a crear:", defaultStages);
      const response = await apiRequest("POST", `/api/projects/${projectId}/payment-stages`, {
        stages: defaultStages
      });
      
      const result = await response.json();
      console.log("✅ Respuesta del servidor:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "payment-stages"] });
      toast({
        title: "✅ Sistema de Pagos Activado",
        description: "4 etapas creadas automáticamente + Timeline generado. La primera etapa ya está disponible para el cliente.",
      });
      setShowCreateStages(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear etapas",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generatePaymentLinkMutation = useMutation({
    mutationFn: async (stageId: number) => {
      const response = await apiRequest("POST", `/api/payment-stages/${stageId}/generate-link`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "payment-stages"] });
      toast({
        title: "Link generado",
        description: "El link de pago ha sido generado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al generar link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (stageId: number) => {
      const response = await apiRequest("POST", `/api/payment-stages/${stageId}/complete`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "payment-stages"] });
      toast({
        title: "Marcado como pagado",
        description: "La etapa ha sido marcada como pagada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al marcar como pagado",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "secondary" as const, icon: Clock },
      available: { label: "Disponible", variant: "default" as const, icon: CreditCard },
      paid: { label: "Pagado", variant: "default" as const, icon: CheckCircle },
      overdue: { label: "Vencido", variant: "destructive" as const, icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
      icon: Clock
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTotalPaid = () => {
    if (!stages) return 0;
    return stages
      .filter((stage: PaymentStage) => stage.status === 'paid')
      .reduce((total: number, stage: PaymentStage) => total + parseFloat(stage.amount), 0);
  };

  const getTotalPending = () => {
    if (!stages) return 0;
    return stages
      .filter((stage: PaymentStage) => stage.status !== 'paid')
      .reduce((total: number, stage: PaymentStage) => total + parseFloat(stage.amount), 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Proyecto</p>
                <p className="text-xl font-bold">${projectPrice.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cobrado</p>
                <p className="text-xl font-bold text-green-600">${getTotalPaid().toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendiente</p>
                <p className="text-xl font-bold text-orange-600">${getTotalPending().toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progreso</p>
                <p className="text-xl font-bold">{projectProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso del Proyecto</span>
              <span>{projectProgress}%</span>
            </div>
            <Progress value={projectProgress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Payment Stages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Etapas de Pago
            </CardTitle>
            {(!stages || stages.length === 0) && (
              <Button
                onClick={() => createStagesMutation.mutate()}
                disabled={createStagesMutation.isPending}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Etapas
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!stages || stages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No hay etapas de pago configuradas</p>
              <p className="text-sm mb-4">
                Crea las etapas de pago automáticamente para este proyecto
              </p>
              <Button
                onClick={() => createStagesMutation.mutate()}
                disabled={createStagesMutation.isPending}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {createStagesMutation.isPending ? "Creando..." : "Crear Etapas Automáticamente"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stages.map((stage: PaymentStage, index: number) => (
                <div
                  key={stage.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    stage.status === 'available' ? 'border-blue-200 bg-blue-50' : 
                    stage.status === 'paid' ? 'border-green-200 bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        stage.status === 'paid' ? 'bg-green-500 text-white' :
                        stage.status === 'available' ? 'bg-blue-500 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{stage.stageName}</h4>
                        {getStatusBadge(stage.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{stage.stagePercentage}%</span> • 
                        <span className="font-medium ml-1">${parseFloat(stage.amount).toFixed(2)}</span> • 
                        <span className="ml-1">Requerido: {stage.requiredProgress}% progreso</span>
                      </div>
                      {stage.paidDate && (
                        <div className="text-xs text-green-600 mt-1">
                          Pagado: {new Date(stage.paidDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {stage.status === "available" && !stage.paymentLink && (
                      <Button
                        size="sm"
                        onClick={() => generatePaymentLinkMutation.mutate(stage.id)}
                        disabled={generatePaymentLinkMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Generar Link
                      </Button>
                    )}

                    {stage.paymentLink && stage.status === "available" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(stage.paymentLink, "_blank")}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver Link
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => markAsPaidMutation.mutate(stage.id)}
                          disabled={markAsPaidMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Marcar Pagado
                        </Button>
                      </div>
                    )}

                    {stage.status === "pending" && (
                      <div className="text-xs text-muted-foreground text-right">
                        <div>Esperando progreso</div>
                        <div>{stage.requiredProgress}%</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      {stages && stages.some((s: PaymentStage) => s.status === 'available') && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Instrucciones para Cobros
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>1. <strong>Generar Link:</strong> Crea el link de pago para la etapa disponible</p>
                  <p>2. <strong>Enviar al Cliente:</strong> Comparte el link con el cliente</p>
                  <p>3. <strong>Confirmar Pago:</strong> Marca como pagado una vez confirmado</p>
                  <p>4. <strong>Actualizar Progreso:</strong> Las siguientes etapas se activarán automáticamente</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
