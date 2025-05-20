
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getUserProducts, getUserOrders, Product, Order } from "@/services/mockData";
import { ArrowRight, Package, ShoppingCart, TrendingUp, Clock } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const userProducts = getUserProducts(user.id);
      const userOrders = getUserOrders(user.id);
      setProducts(userProducts);
      setOrders(userOrders);
      setIsLoading(false);
    }
  }, [user]);

  const getRecentOrders = () => {
    return orders.slice(0, 5).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getTotalRevenue = () => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const getOrdersByStatus = (status: "new" | "processing" | "completed") => {
    return orders.filter(order => order.status === status).length;
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
      {/* Welcome section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Olá, {user?.businessName || "Parceiro"}!</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao seu painel administrativo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/products/new">
              Novo Produto
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/orders/new">
              Novo Pedido
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-shadow-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <Button asChild variant="ghost" size="sm" className="px-0 text-sm text-muted-foreground hover:text-foreground">
                <Link to="/dashboard/products" className="flex items-center gap-1">
                  Ver todos
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{orders.length}</div>
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <Button asChild variant="ghost" size="sm" className="px-0 text-sm text-muted-foreground hover:text-foreground">
                <Link to="/dashboard/orders" className="flex items-center gap-1">
                  Ver todos
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                R$ {getTotalRevenue().toFixed(2)}
              </div>
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                {orders.length} pedidos em total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {getOrdersByStatus("new")}
              </div>
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                {getOrdersByStatus("processing")} pedidos em andamento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="card-shadow-hover">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Pedidos Recentes</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/orders">Ver todos</Link>
            </Button>
          </div>
          <CardDescription>Últimos pedidos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getRecentOrders().length > 0 ? (
              getRecentOrders().map(order => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex flex-col">
                    <div className="font-medium">{order.customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.products.length} item(s)
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">R$ {order.total.toFixed(2)}</div>
                    <div>
                      <Badge status={order.status} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum pedido recente
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Badge component for order status
const Badge = ({ status }: { status: "new" | "processing" | "completed" }) => {
  let bgColor = "bg-blue-100 text-blue-800";
  let label = "Novo";
  
  if (status === "processing") {
    bgColor = "bg-yellow-100 text-yellow-800";
    label = "Em andamento";
  } else if (status === "completed") {
    bgColor = "bg-green-100 text-green-800";
    label = "Finalizado";
  }
  
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${bgColor}`}>
      {label}
    </span>
  );
};

export default Dashboard;
