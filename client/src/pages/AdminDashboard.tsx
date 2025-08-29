import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import { apiRequest } from "@/lib/api";
import type { User } from "@shared/schema";
import {
  Users,
  Handshake,
  FolderOpen,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Settings,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import TwilioConfigModal from "@/components/TwilioConfigModal";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { stats: adminStats, users, isLoading } = useAdmin();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreatePartnerDialog, setShowCreatePartnerDialog] = useState(false);
  const [showMercadoPagoDialog, setShowMercadoPagoDialog] = useState(false);
  // const [isTwilioModalOpen, setIsTwilioModalOpen] = useState(false);
  // const [twilioConfig, setTwilioConfig] = useState({
  //   account_sid: '',
  //   auth_token: '',
  //   whatsapp_number: '',
  //   is_production: false
  // });
  // const [twilioLoading, setTwilioLoading] = useState(false);

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: number; updates: Partial<User> }) => {
      const response = await apiRequest("PUT", `/api/users/${userId}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados exitosamente.",
      });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    },
  });

  const createPartnerMutation = useMutation({
    mutationFn: async ({ userId, commissionRate }: { userId: number; commissionRate: string }) => {
      const response = await apiRequest("POST", "/api/partners", { userId, commissionRate });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast({
        title: "Partner creado",
        description: "El usuario ha sido convertido en partner exitosamente.",
      });
      setShowCreatePartnerDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear partner",
        description: error.message || "No se pudo crear el partner",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (selectedUser) {
      updateUserMutation.mutate({ userId: selectedUser.id, updates });
    }
  };

  // const handleSaveTwilioConfig = async (config: any) => {
  //   try {
  //     const response = await fetch('/api/twilio/config', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(config),
  //     });

  //     if (response.ok) {
  //       setTwilioConfig(config);
  //       toast({
  //         title: "Configuración guardada",
  //         description: "La configuración de Twilio se guardó exitosamente.",
  //       });
  //     } else {
  //       throw new Error('Error al guardar configuración');
  //     }
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "No se pudo guardar la configuración de Twilio.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const statsCards = [
    {
      title: "Total Usuarios",
      value: adminStats?.totalUsers || 0,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Partners Activos",
      value: adminStats?.activePartners || 0,
      icon: Handshake,
      color: "bg-chart-2/10 text-chart-2",
    },
    {
      title: "Proyectos Activos",
      value: adminStats?.activeProjects || 0,
      icon: FolderOpen,
      color: "bg-chart-1/10 text-chart-1",
    },
    {
      title: "Ingresos del Mes",
      value: adminStats?.monthlyRevenue || "$0",
      icon: DollarSign,
      color: "bg-chart-4/10 text-chart-4",
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Panel de Administración">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-96 bg-muted rounded"></div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Panel de Administración">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => window.location.href = "/admin/portfolio"} variant="outline" data-testid="button-manage-portfolio">
            <FolderOpen className="h-4 w-4 mr-2" />
            Gestionar Portfolio
          </Button>

          <Dialog open={showCreatePartnerDialog} onOpenChange={setShowCreatePartnerDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-partner">
                <Plus className="h-4 w-4 mr-2" />
                Crear Partner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Partner</DialogTitle>
              </DialogHeader>
              <CreatePartnerForm
                users={users?.filter(u => u.role === 'client') || []}
                onSubmit={(userId, commissionRate) =>
                  createPartnerMutation.mutate({ userId, commissionRate })
                }
                isLoading={createPartnerMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showMercadoPagoDialog} onOpenChange={setShowMercadoPagoDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Configurar MercadoPago</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configuración de MercadoPago</DialogTitle>
              </DialogHeader>
              <MercadoPagoConfig onClose={() => setShowMercadoPagoDialog(false)} />
            </DialogContent>
          </Dialog>

          {/* Twilio Config Modal - Temporalmente deshabilitado */}
          {/* <TwilioConfigModal
            open={showTwilioConfig}
            onOpenChange={setShowTwilioConfig}
          /> */}

          {/* Temporalmente deshabilitado el botón de Twilio */}
          {/* <Button
            variant="outline"
            onClick={() => setShowTwilioConfig(true)}
            disabled={twilioLoading}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {twilioLoading ? 'Cargando...' : 'Configurar WhatsApp'}
          </Button> */}
        </div>

        {/* Users Management Table */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'partner' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'destructive'}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <EditUserForm
                user={selectedUser}
                onSubmit={handleUpdateUser}
                isLoading={updateUserMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Twilio Config Modal - Temporalmente deshabilitado */}
        {/* <TwilioConfigModal 
          open={showTwilioConfig}
          onOpenChange={setShowTwilioConfig}
        /> */}
      </div>
    </DashboardLayout>
  );
}

interface CreatePartnerFormProps {
  users: User[];
  onSubmit: (userId: number, commissionRate: string) => void;
  isLoading: boolean;
}

function CreatePartnerForm({ users, onSubmit, isLoading }: CreatePartnerFormProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [commissionRate, setCommissionRate] = useState("25.00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      onSubmit(selectedUserId, commissionRate);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="userId">Seleccionar Usuario</Label>
        <Select onValueChange={(value) => setSelectedUserId(parseInt(value))}>
          <SelectTrigger data-testid="select-user-partner">
            <SelectValue placeholder="Selecciona un usuario" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.fullName} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="commissionRate">Tasa de Comisión (%)</Label>
        <Input
          id="commissionRate"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={commissionRate}
          onChange={(e) => setCommissionRate(e.target.value)}
          data-testid="input-commission-rate"
        />
      </div>

      <Button type="submit" disabled={!selectedUserId || isLoading} data-testid="button-submit-partner">
        {isLoading ? "Creando..." : "Crear Partner"}
      </Button>
    </form>
  );
}

interface EditUserFormProps {
  user: User;
  onSubmit: (updates: Partial<User>) => void;
  isLoading: boolean;
}

function EditUserForm({ user, onSubmit, isLoading }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Nombre Completo</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          data-testid="input-edit-fullname"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          data-testid="input-edit-email"
        />
      </div>

      <div>
        <Label htmlFor="role">Rol</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
          <SelectTrigger data-testid="select-edit-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Cliente</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          data-testid="checkbox-edit-active"
        />
        <Label htmlFor="isActive">Usuario Activo</Label>
      </div>

      <Button type="submit" disabled={isLoading} data-testid="button-submit-edit-user">
        {isLoading ? "Actualizando..." : "Actualizar Usuario"}
      </Button>
    </form>
  );
}

function MercadoPagoConfig({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState({
    accessToken: "",
    publicKey: "",
    clientId: "",
    clientSecret: "",
    webhookSecret: "",
    isProduction: false,
  });

  // Cargar configuración actual al montar el componente
  const { data: currentConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["admin", "mercadopago"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/mercadopago");
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error loading MercadoPago config:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de MercadoPago.",
          variant: "destructive",
        });
        return null; // Return null on error to handle it in the component
      }
    },
  });

  // Actualizar el estado cuando se carga la configuración
  React.useEffect(() => {
    if (currentConfig) {
      setConfig({
        accessToken: "", // No mostrar access token por seguridad
        publicKey: currentConfig.publicKey || "",
        clientId: currentConfig.clientId || "",
        clientSecret: "", // No mostrar client secret por seguridad
        webhookSecret: "", // No mostrar webhook secret por seguridad
        isProduction: currentConfig.isProduction || false,
      });
    }
  }, [currentConfig]);

  const updateConfigMutation = useMutation({
    mutationFn: async (configData: typeof config) => {
      try {
        // Solo enviar campos que no estén vacíos o que sean booleanos
        const filteredConfig = Object.fromEntries(
          Object.entries(configData).filter(([key, value]) => {
            if (typeof value === 'boolean') return true;
            return value !== null && value !== undefined && value !== '';
          })
        );

        console.log("Sending MercadoPago config:", filteredConfig);

        const response = await apiRequest("PUT", "/api/admin/mercadopago", filteredConfig);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error updating MercadoPago config:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("MercadoPago config saved successfully:", data);
      toast({
        title: "Configuración guardada",
        description: "La configuración de MercadoPago se ha guardado exitosamente.",
      });
      // Recargar la configuración actual
      queryClient.invalidateQueries({ queryKey: ["admin", "mercadopago"] });
      // Cerrar el modal después de guardar
      onClose();
    },
    onError: (error: any) => {
      console.error("MercadoPago config update error:", error);
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar la configuración de MercadoPago",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación mejorada: Si no hay configuración previa, requiere al menos Access Token o Public Key
    // Si ya hay configuración, permite actualizar campos individuales
    if (!currentConfig?.hasAccessToken && !currentConfig?.hasPublicKey && !config.accessToken && !config.publicKey) {
      toast({
        title: "Error de validación",
        description: "Debe proporcionar al menos un Access Token o Public Key para la configuración inicial.",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting MercadoPago config:", config);
    updateConfigMutation.mutate(config);
  };

  if (isLoadingConfig) {
    return <p>Cargando configuración...</p>; // Show loading indicator
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="accessToken">Access Token</Label>
        <Input
          id="accessToken"
          type="password"
          value={config.accessToken}
          onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
          placeholder={currentConfig?.hasAccessToken ? "••••••••••••••••••••••••••••••" : "APP_USR-..."}
          data-testid="input-mp-access-token"
          className={currentConfig?.hasAccessToken ? "border-green-500 bg-green-50" : config.accessToken ? "border-green-500" : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {currentConfig?.hasAccessToken ? "✅ Token configurado - Dejar vacío para mantener actual" : "❌ Token no configurado"}
        </p>
      </div>

      <div>
        <Label htmlFor="publicKey">Public Key</Label>
        <Input
          id="publicKey"
          value={config.publicKey}
          onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
          placeholder="APP_USR-..."
          data-testid="input-mp-public-key"
          className={config.publicKey ? "border-green-500" : ""} // Highlight if value is present
        />
      </div>

      <div>
        <Label htmlFor="clientId">Client ID</Label>
        <Input
          id="clientId"
          value={config.clientId}
          onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
          placeholder="7411083613982451"
          data-testid="input-mp-client-id"
        />
      </div>

      <div>
        <Label htmlFor="clientSecret">Client Secret</Label>
        <Input
          id="clientSecret"
          type="password"
          value={config.clientSecret}
          onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
          placeholder={currentConfig?.hasClientSecret ? "••••••••••••••••••••••••••••••" : "E4vFGfTb2SC..."}
          data-testid="input-mp-client-secret"
          className={currentConfig?.hasClientSecret ? "border-green-500 bg-green-50" : config.clientSecret ? "border-green-500" : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {currentConfig?.hasClientSecret ? "✅ Client Secret configurado - Dejar vacío para mantener actual" : "❌ Client Secret no configurado"}
        </p>
      </div>

      <div>
        <Label htmlFor="webhookSecret">Webhook Secret</Label>
        <Input
          id="webhookSecret"
          type="password"
          value={config.webhookSecret}
          onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
          placeholder={currentConfig?.hasWebhookSecret ? "••••••••••••••••••••••••••••••" : "softwarepar_webhook_2025"}
          data-testid="input-mp-webhook-secret"
          className={currentConfig?.hasWebhookSecret ? "border-green-500 bg-green-50" : config.webhookSecret ? "border-green-500" : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {currentConfig?.hasWebhookSecret ? "✅ Webhook Secret configurado - Dejar vacío para mantener actual" : "❌ Webhook Secret no configurado"}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isProduction"
          checked={config.isProduction}
          onChange={(e) => setConfig({ ...config, isProduction: e.target.checked })}
          data-testid="checkbox-mp-production"
        />
        <Label htmlFor="isProduction">Modo Producción</Label>
        {config.isProduction && (
          <Badge variant="destructive" className="ml-2">PRODUCCIÓN</Badge>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={updateConfigMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={updateConfigMutation.isPending}
          data-testid="button-submit-mp-config"
        >
          {updateConfigMutation.isPending ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>
    </form>
  );
}