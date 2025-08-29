import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import ProfileSettingsModal from "@/components/ProfileSettingsModal";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  BellRing,
} from "lucide-react";

export default function UserMenu() {
  const { user } = useAuth();
  const { toast } = useToast();
  const logoutMutation = useLogout();
  const { isConnected, lastMessage, notifications, clearNotifications } = useWebSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  // Log WebSocket status for debugging
  console.log('🔔 UserMenu WebSocket Status:', { 
    isConnected, 
    notificationsCount: notifications.length,
    lastMessage: lastMessage?.type 
  });


  const handleLogout = async () => {
    try {
      toast({
        title: "Cerrando sesión...",
        description: "Redirigiendo al inicio",
      });
      await logoutMutation.mutateAsync();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "partner":
        return "Partner";
      case "client":
        return "Cliente";
      default:
        return role;
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-4">
      {/* Notifications */}
      <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {notifications.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Notificaciones</h4>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar todo
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-xs text-muted-foreground">
                {isConnected ? "Conectado" : "Desconectado"}
              </p>
            </div>
          </div>

          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <DropdownMenuItem key={index} className="p-4 border-b last:border-b-0">
                <div className="flex items-start space-x-3 w-full">
                  <BellRing className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt || Date.now()).toLocaleTimeString()}
                    </p>
                  </div>
                  {notification.type && (
                    <Badge 
                      variant={notification.type === 'error' ? 'destructive' : notification.type === 'success' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {notification.type}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No hay notificaciones</p>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {getInitials(user.fullName)}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-2 border-b">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-1">
              {getRoleText(user.role)}
            </Badge>
          </div>

          <DropdownMenuItem data-testid="menu-item-profile">
            <User className="h-4 w-4 mr-2" />
            Mi Perfil
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => setShowProfileSettings(true)}
            data-testid="menu-item-settings"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="menu-item-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {logoutMutation.isPending ? "Cerrando..." : "Cerrar Sesión"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de Configuración de Perfil */}
      <ProfileSettingsModal
        open={showProfileSettings}
        onOpenChange={setShowProfileSettings}
      />
    </div>
  );
}