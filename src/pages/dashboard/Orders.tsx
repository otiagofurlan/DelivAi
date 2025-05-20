
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders, saveUserOrders, Order } from "@/services/mockData";
import { Plus, Search, MoreHorizontal, Pencil, Trash, Filter, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type OrderStatus = "new" | "processing" | "completed";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  useEffect(() => {
    if (user?.id) {
      const userOrders = getUserOrders(user.id);
      setOrders(userOrders);
      setFilteredOrders(userOrders);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let filtered = orders;
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (order) =>
          order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.products.some((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }
    
    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
  };

  const confirmDelete = () => {
    if (orderToDelete && user?.id) {
      const updatedOrders = orders.filter((o) => o.id !== orderToDelete.id);
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      saveUserOrders(user.id, updatedOrders);
      toast.success("Pedido removido com sucesso");
      setOrderToDelete(null);
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    if (user?.id) {
      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          return { ...order, status };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      saveUserOrders(user.id, updatedOrders);
      toast.success("Status do pedido atualizado");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus pedidos e acompanhe o status
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/dashboard/orders/new" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pedidos..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="new">Novos</SelectItem>
                <SelectItem value="processing">Em andamento</SelectItem>
                <SelectItem value="completed">Finalizados</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" 
                  ? "Tente modificar os filtros de busca" 
                  : "Comece adicionando seu primeiro pedido"}
              </p>
              <Button asChild>
                <Link to="/dashboard/orders/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Pedido
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produtos</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.products.length === 1 
                            ? order.products[0].name 
                            : `${order.products[0].name} e mais ${order.products.length - 1}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.products.reduce((sum, p) => sum + p.quantity, 0)} item(s)
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} onChange={(status) => updateOrderStatus(order.id, status)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/orders/${order.id}`} className="flex items-center cursor-pointer">
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => handleDeleteOrder(order)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pedido de {orderToDelete?.customer.name}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const StatusBadge = ({ 
  status, 
  onChange 
}: { 
  status: OrderStatus;
  onChange: (status: OrderStatus) => void;
}) => {
  const statusConfig = {
    new: { 
      label: "Novo", 
      color: "bg-blue-100 text-blue-800 border-blue-200",
      hoverColor: "hover:bg-blue-200" 
    },
    processing: { 
      label: "Em andamento", 
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      hoverColor: "hover:bg-yellow-200" 
    },
    completed: { 
      label: "Finalizado", 
      color: "bg-green-100 text-green-800 border-green-200",
      hoverColor: "hover:bg-green-200" 
    },
  };
  
  const config = statusConfig[status];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${config.color} ${config.hoverColor} cursor-pointer transition-colors`}
        >
          {config.label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className="text-blue-800 focus:text-blue-800 cursor-pointer"
          onClick={() => onChange("new")}
        >
          Novo
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-yellow-800 focus:text-yellow-800 cursor-pointer"
          onClick={() => onChange("processing")}
        >
          Em andamento
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-green-800 focus:text-green-800 cursor-pointer"
          onClick={() => onChange("completed")}
        >
          Finalizado
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Orders;
