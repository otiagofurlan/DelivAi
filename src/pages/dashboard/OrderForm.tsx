
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Trash, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserProducts,
  getUserOrders,
  saveUserOrders,
  mockCustomers,
  Product,
  Order,
  Customer,
} from "@/services/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type OrderProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const OrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [step, setStep] = useState(1);
  const [customerId, setCustomerId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);
  const [status, setStatus] = useState<"new" | "processing" | "completed">("new");
  
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const products = getUserProducts(user.id);
      setAvailableProducts(products);
      setFilteredProducts(products);

      if (isEditing) {
        const orders = getUserOrders(user.id);
        const order = orders.find((o) => o.id === id);

        if (order) {
          setCustomerId(order.customer.id);
          setSelectedProducts(order.products);
          setStatus(order.status);
          setStep(3); // Go directly to review step in edit mode
        } else {
          // Order not found, redirect to orders list
          toast.error("Pedido não encontrado");
          navigate("/dashboard/orders");
        }
      }
      
      setInitialLoading(false);
    }
  }, [user, id, isEditing, navigate]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(availableProducts);
    } else {
      const filtered = availableProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, availableProducts]);

  const selectedCustomer = mockCustomers.find((c) => c.id === customerId);

  const handleAddProduct = (product: Product) => {
    const existingProduct = selectedProducts.find((p) => p.id === product.id);
    
    if (existingProduct) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.id === productId ? { ...p, quantity } : p
      )
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  const handleSubmit = () => {
    if (!customerId) {
      toast.error("Por favor, selecione um cliente");
      return;
    }
    
    if (selectedProducts.length === 0) {
      toast.error("Por favor, adicione pelo menos um produto");
      return;
    }
    
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const orders = getUserOrders(user.id);
      const customer = mockCustomers.find((c) => c.id === customerId);
      
      if (!customer) {
        throw new Error("Cliente não encontrado");
      }
      
      if (isEditing) {
        // Update existing order
        const updatedOrders = orders.map((o) => {
          if (o.id === id) {
            return {
              ...o,
              customer,
              products: selectedProducts,
              status,
              total: calculateTotal(),
            };
          }
          return o;
        });
        
        saveUserOrders(user.id, updatedOrders);
        toast.success("Pedido atualizado com sucesso");
      } else {
        // Create new order
        const newOrder: Order = {
          id: crypto.randomUUID(),
          customer,
          products: selectedProducts,
          status,
          total: calculateTotal(),
          createdAt: new Date().toISOString(),
          userId: user.id,
        };
        
        saveUserOrders(user.id, [...orders, newOrder]);
        toast.success("Pedido criado com sucesso");
      }
      
      navigate("/dashboard/orders");
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao salvar o pedido");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !customerId) {
      toast.error("Por favor, selecione um cliente");
      return;
    }
    
    if (step === 2 && selectedProducts.length === 0) {
      toast.error("Por favor, adicione pelo menos um produto");
      return;
    }
    
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/dashboard/orders")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Editar Pedido" : "Novo Pedido"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Atualize as informações do pedido" : "Crie um novo pedido em poucos passos"}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      {!isEditing && (
        <div className="flex items-center justify-between max-w-md mx-auto mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className="flex flex-col items-center"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step === stepNumber
                  ? "bg-primary text-white"
                  : step > stepNumber
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              )}>
                {stepNumber}
              </div>
              <span className="text-xs mt-2 text-muted-foreground">
                {stepNumber === 1 ? "Cliente" : stepNumber === 2 ? "Produtos" : "Revisão"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Select Customer */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Selecione o Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select 
                value={customerId} 
                onValueChange={setCustomerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {customerId && (
                <div className="mt-6 p-4 border rounded-md bg-muted/30">
                  <div className="font-medium text-lg mb-2">
                    {selectedCustomer?.name}
                  </div>
                  <div className="text-muted-foreground">
                    <p>Email: {selectedCustomer?.email}</p>
                    <p>Telefone: {selectedCustomer?.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!customerId}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Products */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Adicione Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="border rounded-md overflow-hidden mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleUpdateQuantity(product.id, product.quantity - 1)}
                                disabled={product.quantity <= 1}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{product.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>R$ {(product.price * product.quantity).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveProduct(product.id)}
                            >
                              <Trash className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">
                          Total
                        </TableCell>
                        <TableCell className="font-bold">
                          R$ {calculateTotal().toFixed(2)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Product Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Available Products */}
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleAddProduct(product)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Adicionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          Nenhum produto encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={selectedProducts.length === 0}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Order Summary */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisão do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium mb-2">Cliente</h3>
                <div className="p-4 border rounded-md bg-muted/30">
                  <div className="font-medium">{selectedCustomer?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    <p>Email: {selectedCustomer?.email}</p>
                    <p>Telefone: {selectedCustomer?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Product Summary */}
              <div>
                <h3 className="text-sm font-medium mb-2">Produtos</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>R$ {(product.price * product.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">
                          Total
                        </TableCell>
                        <TableCell className="font-bold">
                          R$ {calculateTotal().toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Order Status */}
              <div>
                <h3 className="text-sm font-medium mb-2">Status do Pedido</h3>
                <Select value={status} onValueChange={(value) => setStatus(value as "new" | "processing" | "completed")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="processing">Em andamento</SelectItem>
                    <SelectItem value="completed">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between mt-6">
                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    Voltar
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/orders")}
                  className="ml-auto mr-2"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      {isEditing ? "Salvando..." : "Finalizando..."}
                    </span>
                  ) : (
                    isEditing ? "Salvar Alterações" : "Finalizar Pedido"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderForm;
