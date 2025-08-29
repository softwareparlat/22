
import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import {
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  FileText,
  Receipt,
} from "lucide-react";

interface Invoice {
  id: number;
  invoiceNumber: string;
  projectName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  downloadUrl?: string;
}

interface PaymentMethod {
  id: number;
  type: 'card' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryDate?: string;
  bankName?: string;
  accountNumber?: string;
  isDefault: boolean;
}

interface Transaction {
  id: number;
  type: 'payment' | 'refund' | 'fee';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  invoiceId?: number;
  paymentMethodId?: number;
}

export default function BillingDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddPaymentMethodDialog, setShowAddPaymentMethodDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: billingData, isLoading: billingLoading } = useQuery({
    queryKey: ["/api/client/billing"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/client/billing");
      return await response.json();
    },
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/client/invoices"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/client/invoices");
      return await response.json();
    },
  });

  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["/api/client/payment-methods"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/client/payment-methods");
      return await response.json();
    },
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: async (methodData: {
      type: string;
      cardNumber?: string;
      expiryDate?: string;
      cvv?: string;
      holderName?: string;
    }) => {
      const response = await apiRequest("POST", "/api/client/payment-methods", methodData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/payment-methods"] });
      toast({
        title: "Método de pago agregado",
        description: "Tu nuevo método de pago ha sido agregado exitosamente.",
      });
      setShowAddPaymentMethodDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al agregar método de pago",
        description: error.message || "No se pudo agregar el método de pago",
        variant: "destructive",
      });
    },
  });

  const payInvoiceMutation = useMutation({
    mutationFn: async ({ invoiceId, paymentMethodId }: { invoiceId: number; paymentMethodId: number }) => {
      const response = await apiRequest("POST", `/api/client/invoices/${invoiceId}/pay`, { paymentMethodId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/client/billing"] });
      toast({
        title: "Pago procesado",
        description: "Tu pago ha sido procesado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al procesar pago",
        description: error.message || "No se pudo procesar el pago",
        variant: "destructive",
      });
    },
  });

  const downloadInvoice = async (invoiceId: number) => {
    try {
      const response = await apiRequest("GET", `/api/client/invoices/${invoiceId}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura_${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar la factura",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencido';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Completado';
      case 'failed':
        return 'Fallido';
      default:
        return status;
    }
  };

  // Mock data for development
  const mockBillingData = {
    currentBalance: 0,
    totalPaid: 15750,
    pendingPayments: 2500,
    nextPaymentDue: '2024-02-15',
  };

  const mockInvoices: Invoice[] = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      projectName: 'Desarrollo App Mobile',
      amount: 5000,
      status: 'paid',
      dueDate: '2024-01-15',
      paidDate: '2024-01-14',
      createdAt: '2024-01-01',
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      projectName: 'Sistema de Gestión',
      amount: 2500,
      status: 'pending',
      dueDate: '2024-02-15',
      createdAt: '2024-01-15',
    },
  ];

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: 1,
      type: 'card',
      last4: '4532',
      brand: 'Visa',
      expiryDate: '12/26',
      isDefault: true,
    },
    {
      id: 2,
      type: 'bank_transfer',
      bankName: 'Banco Santander',
      accountNumber: '****5678',
      isDefault: false,
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 1,
      type: 'payment',
      amount: 5000,
      description: 'Pago de factura INV-2024-001',
      status: 'completed',
      date: '2024-01-14',
      invoiceId: 1,
      paymentMethodId: 1,
    },
    {
      id: 2,
      type: 'fee',
      amount: 150,
      description: 'Comisión MercadoPago',
      status: 'completed',
      date: '2024-01-14',
    },
  ];

  const data = {
    billing: billingData || mockBillingData,
    invoices: invoices || mockInvoices,
    paymentMethods: paymentMethods || mockPaymentMethods,
    transactions: mockTransactions,
  };

  if (billingLoading || invoicesLoading || paymentMethodsLoading) {
    return (
      <DashboardLayout title="Facturación">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Facturación y Pagos">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Facturación y Pagos</h1>
          <p className="text-muted-foreground">
            Gestiona tus facturas, métodos de pago y historial de transacciones
          </p>
        </div>

        {/* Billing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Balance Actual</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${data.billing.currentBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-chart-2" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Pagado</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${data.billing.totalPaid.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-chart-1" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Pagos Pendientes</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${data.billing.pendingPayments.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-chart-4" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Próximo Vencimiento</p>
                    <p className="text-2xl font-bold text-foreground">
                      {data.billing.nextPaymentDue 
                        ? new Date(data.billing.nextPaymentDue).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="invoices">Facturas</TabsTrigger>
            <TabsTrigger value="payments">Métodos de Pago</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
            <TabsTrigger value="statements">Estados de Cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mis Facturas</span>
                  <Badge variant="outline">
                    {data.invoices.filter(inv => inv.status === 'pending').length} pendientes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Proyecto</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.invoices.map((invoice: Invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>{invoice.projectName}</TableCell>
                          <TableCell className="font-bold">
                            ${invoice.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(invoice.status)}>
                              {getStatusText(invoice.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedInvoice(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => downloadInvoice(invoice.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {invoice.status === 'pending' && (
                                <PayInvoiceDialog 
                                  invoice={invoice}
                                  paymentMethods={data.paymentMethods}
                                  onPay={(paymentMethodId) => 
                                    payInvoiceMutation.mutate({ 
                                      invoiceId: invoice.id, 
                                      paymentMethodId 
                                    })
                                  }
                                  isLoading={payInvoiceMutation.isPending}
                                />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Métodos de Pago</span>
                  <Dialog open={showAddPaymentMethodDialog} onOpenChange={setShowAddPaymentMethodDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Método
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Agregar Método de Pago</DialogTitle>
                      </DialogHeader>
                      <AddPaymentMethodForm
                        onSubmit={(data) => addPaymentMethodMutation.mutate(data)}
                        isLoading={addPaymentMethodMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.paymentMethods.map((method: PaymentMethod) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          {method.type === 'card' ? (
                            <div>
                              <p className="font-medium">
                                {method.brand} terminada en {method.last4}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Vence: {method.expiryDate}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">{method.bankName}</p>
                              <p className="text-sm text-muted-foreground">
                                Cuenta: {method.accountNumber}
                              </p>
                            </div>
                          )}
                        </div>
                        {method.isDefault && (
                          <Badge variant="default">Por defecto</Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm">
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Transacciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.transactions.map((transaction: Transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {transaction.type === 'payment' ? 'Pago' :
                               transaction.type === 'refund' ? 'Reembolso' : 'Comisión'}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className={`font-bold ${
                            transaction.type === 'payment' || transaction.type === 'refund' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'fee' ? '-' : '+'}
                            ${transaction.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(transaction.status)}>
                              {getStatusText(transaction.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estados de Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Estados de Cuenta Mensuales</h3>
                  <p className="text-muted-foreground mb-4">
                    Descarga tus estados de cuenta mensuales
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Enero 2024
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Diciembre 2023
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Invoice Detail Modal */}
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de Factura</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <InvoiceDetailView invoice={selectedInvoice} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function AddPaymentMethodForm({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    type: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    holderName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Tipo de Método</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="card">Tarjeta de Crédito/Débito</SelectItem>
            <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'card' && (
        <>
          <div>
            <Label htmlFor="holderName">Nombre del Titular</Label>
            <Input
              id="holderName"
              value={formData.holderName}
              onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
              placeholder="Juan Pérez"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cardNumber">Número de Tarjeta</Label>
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
              <Input
                id="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                placeholder="MM/AA"
                required
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                placeholder="123"
                required
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Agregando..." : "Agregar Método"}
        </Button>
      </div>
    </form>
  );
}

function PayInvoiceDialog({ 
  invoice, 
  paymentMethods, 
  onPay, 
  isLoading 
}: {
  invoice: Invoice;
  paymentMethods: PaymentMethod[];
  onPay: (paymentMethodId: number) => void;
  isLoading: boolean;
}) {
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <CreditCard className="h-4 w-4 mr-2" />
          Pagar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagar Factura {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="font-medium">Monto a Pagar</p>
            <p className="text-2xl font-bold text-primary">
              ${invoice.amount.toLocaleString()}
            </p>
          </div>

          <div>
            <Label>Seleccionar Método de Pago</Label>
            <div className="space-y-2 mt-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedMethod === method.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                    />
                    <div>
                      {method.type === 'card' ? (
                        <p>{method.brand} terminada en {method.last4}</p>
                      ) : (
                        <p>{method.bankName} - {method.accountNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => selectedMethod && onPay(selectedMethod)}
              disabled={!selectedMethod || isLoading}
            >
              {isLoading ? "Procesando..." : "Pagar Ahora"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceDetailView({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Número de Factura</Label>
          <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Estado</Label>
          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
            {invoice.status === 'paid' ? 'Pagado' : 'Pendiente'}
          </Badge>
        </div>
        <div>
          <Label className="text-sm font-medium">Proyecto</Label>
          <p>{invoice.projectName}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Monto</Label>
          <p className="text-lg font-bold">${invoice.amount.toLocaleString()}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Fecha de Creación</Label>
          <p>{new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Fecha de Vencimiento</Label>
          <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
        {invoice.paidDate && (
          <div>
            <Label className="text-sm font-medium">Fecha de Pago</Label>
            <p>{new Date(invoice.paidDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Descargar PDF
        </Button>
        <Button variant="outline" className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Ver Detalles
        </Button>
      </div>
    </div>
  );
}
