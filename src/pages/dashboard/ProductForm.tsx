
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserProducts, saveUserProducts, categories, Product } from "@/services/mockData";
import { toast } from "sonner";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Sample images for selection
  const sampleImages = [
    "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop",
  ];

  useEffect(() => {
    if (user?.id && isEditing) {
      const products = getUserProducts(user.id);
      const product = products.find((p) => p.id === id);
      
      if (product) {
        setName(product.name);
        setCategory(product.category);
        setDescription(product.description);
        setPrice(product.price.toString());
        setImage(product.image);
      } else {
        // Product not found, redirect to products list
        toast.error("Produto não encontrado");
        navigate("/dashboard/products");
      }
    }
    
    setInitialLoading(false);
  }, [user, id, isEditing, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !price) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const products = getUserProducts(user.id);
      const numericPrice = parseFloat(price.replace(",", "."));
      
      if (isEditing) {
        // Update existing product
        const updatedProducts = products.map((p) => {
          if (p.id === id) {
            return {
              ...p,
              name,
              category,
              description,
              price: numericPrice,
              image: image || sampleImages[0],
            };
          }
          return p;
        });
        
        saveUserProducts(user.id, updatedProducts);
        toast.success("Produto atualizado com sucesso");
      } else {
        // Create new product
        const newProduct: Product = {
          id: crypto.randomUUID(),
          name,
          category,
          description,
          price: numericPrice,
          image: image || sampleImages[0],
          createdAt: new Date().toISOString(),
          userId: user.id,
        };
        
        saveUserProducts(user.id, [...products, newProduct]);
        toast.success("Produto criado com sucesso");
      }
      
      navigate("/dashboard/products");
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao salvar o produto");
    } finally {
      setIsLoading(false);
    }
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
          onClick={() => navigate("/dashboard/products")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Atualize as informações do produto" : "Adicione um novo produto ao catálogo"}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Image */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Imagem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-48 object-cover rounded-md border border-border"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-muted rounded-md border border-dashed border-border">
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {sampleImages.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`p-0.5 rounded-md ${
                        img === image ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-muted"
                      }`}
                      onClick={() => setImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Sample ${index + 1}`}
                        className="w-full h-12 object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  Selecione uma imagem entre as opções acima
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Right column - Product details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informações do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Nome do produto"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria <span className="text-destructive">*</span></Label>
                  <Select 
                    value={category} 
                    onValueChange={setCategory}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva seu produto ou serviço"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) <span className="text-destructive">*</span></Label>
                  <Input
                    id="price"
                    placeholder="0,00"
                    value={price}
                    onChange={(e) => {
                      // Allow only numbers and decimal separator
                      const value = e.target.value.replace(/[^0-9.,]/g, "");
                      setPrice(value);
                    }}
                    required
                  />
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={() => navigate("/dashboard/products")}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        {isEditing ? "Salvando..." : "Criando..."}
                      </span>
                    ) : (
                      isEditing ? "Salvar Alterações" : "Criar Produto"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
