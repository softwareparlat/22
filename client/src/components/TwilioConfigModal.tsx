
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Info, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";

interface TwilioConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TwilioConfigModal({ open, onOpenChange }: TwilioConfigModalProps) {
  const [config, setConfig] = useState({
    accountSid: "",
    authToken: "",
    whatsappNumber: "",
    isProduction: false,
  });
  const [status, setStatus] = useState({
    hasAccountSid: false,
    hasAuthToken: false,
    hasWhatsappNumber: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("GET", "/api/admin/twilio");
      if (response.ok) {
        const data = await response.json();
        setConfig({
          accountSid: data.accountSid || "",
          authToken: "", // Never load sensitive data
          whatsappNumber: data.whatsappNumber || "",
          isProduction: data.isProduction || false,
        });
        setStatus({
          hasAccountSid: data.hasAccountSid,
          hasAuthToken: data.hasAuthToken,
          hasWhatsappNumber: data.hasWhatsappNumber,
        });
      }
    } catch (error) {
      console.error("Error loading Twilio config:", error);
      toast({
        title: "Error",
        description: "Error al cargar la configuración de Twilio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiRequest("PUT", "/api/admin/twilio", config);
      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Configuración de Twilio actualizada correctamente",
        });
        await loadConfig(); // Reload to get updated status
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Error al actualizar la configuración",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving Twilio config:", error);
      toast({
        title: "Error",
        description: "Error interno del servidor",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isConfigured = status.hasAccountSid && status.hasAuthToken && status.hasWhatsappNumber;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Configuración de Twilio WhatsApp</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Estado de la Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {isConfigured ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 font-medium">Completamente configurado</span>
                    <Badge variant="default">Activo</Badge>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="text-orange-600 font-medium">Configuración incompleta</span>
                    <Badge variant="secondary">Inactivo</Badge>
                  </>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Account SID:</span>
                  <Badge variant={status.hasAccountSid ? "default" : "outline"}>
                    {status.hasAccountSid ? "Configurado" : "Pendiente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Auth Token:</span>
                  <Badge variant={status.hasAuthToken ? "default" : "outline"}>
                    {status.hasAuthToken ? "Configurado" : "Pendiente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Número WhatsApp:</span>
                  <Badge variant={status.hasWhatsappNumber ? "default" : "outline"}>
                    {status.hasWhatsappNumber ? "Configurado" : "Pendiente"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="accountSid">Account SID *</Label>
                <Input
                  id="accountSid"
                  type="text"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={config.accountSid}
                  onChange={(e) => setConfig(prev => ({ ...prev, accountSid: e.target.value }))}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tu Account SID de Twilio (inicia con AC)
                </p>
              </div>

              <div>
                <Label htmlFor="authToken">Auth Token *</Label>
                <Input
                  id="authToken"
                  type="password"
                  placeholder="Tu Auth Token de Twilio"
                  value={config.authToken}
                  onChange={(e) => setConfig(prev => ({ ...prev, authToken: e.target.value }))}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Token de autenticación (se guarda encriptado)
                </p>
              </div>

              <div>
                <Label htmlFor="whatsappNumber">Número de WhatsApp de Twilio *</Label>
                <Input
                  id="whatsappNumber"
                  type="text"
                  placeholder="+14155238886"
                  value={config.whatsappNumber}
                  onChange={(e) => setConfig(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Número de WhatsApp asignado por Twilio (incluir código de país)
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="isProduction">Modo Producción</Label>
                  <p className="text-xs text-muted-foreground">
                    {config.isProduction ? "Enviará mensajes reales" : "Modo sandbox para pruebas"}
                  </p>
                </div>
                <Switch
                  id="isProduction"
                  checked={config.isProduction}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isProduction: checked }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>¿Cómo obtener estas credenciales?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p><strong>Paso 1:</strong> Crear cuenta en Twilio</p>
                <div className="flex items-center space-x-2">
                  <span>Ir a:</span>
                  <a 
                    href="https://www.twilio.com/console" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <span>Twilio Console</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              
              <div className="text-sm space-y-2">
                <p><strong>Paso 2:</strong> Obtener credenciales</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Account SID: Panel principal de Twilio</li>
                  <li>Auth Token: Clic en "Show" al lado del Auth Token</li>
                </ul>
              </div>
              
              <div className="text-sm space-y-2">
                <p><strong>Paso 3:</strong> Configurar WhatsApp</p>
                <div className="flex items-center space-x-2">
                  <span>Seguir:</span>
                  <a 
                    href="https://www.twilio.com/docs/whatsapp/quickstart" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <span>WhatsApp Quickstart</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
