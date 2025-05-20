
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Building, UtensilsCrossed, Briefcase, Save, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { categories } from "@/services/mockData";

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [businessType, setBusinessType] = useState<"franchise" | "restaurant" | "autonomous" | null>(
    user?.businessType || null
  );
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    user?.businessCategories || []
  );
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    if (!businessName.trim()) {
      toast.error("Por favor, informe o nome do negócio");
      return;
    }
    
    if (!businessType) {
      toast.error("Por favor, selecione o tipo de negócio");
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      updateUser({
        businessName,
        businessType,
        businessCategories: selectedCategories,
      });
      
      toast.success("Perfil atualizado com sucesso");
      setIsLoading(false);
    }, 1000);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !selectedCategories.includes(newCategory.trim())) {
      setSelectedCategories([...selectedCategories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== category));
  };

  const getBusinessIcon = () => {
    switch (businessType) {
      case "franchise":
        return <Building className="w-6 h-6" />;
      case "restaurant":
        return <UtensilsCrossed className="w-6 h-6" />;
      case "autonomous":
        return <Briefcase className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil do Negócio</h1>
        <p className="text-muted-foreground mt-1">
          Personalize as informações do seu negócio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Nome do Negócio</Label>
                <Input
                  id="business-name"
                  placeholder="Nome do seu negócio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de Negócio</Label>
                <div className="grid grid-cols-3 gap-4">
                  <BusinessTypeCard
                    type="franchise"
                    name="Franquia"
                    icon={<Building className="w-5 h-5" />}
                    selected={businessType === "franchise"}
                    onClick={() => setBusinessType("franchise")}
                  />
                  <BusinessTypeCard
                    type="restaurant"
                    name="Restaurante"
                    icon={<UtensilsCrossed className="w-5 h-5" />}
                    selected={businessType === "restaurant"}
                    onClick={() => setBusinessType("restaurant")}
                  />
                  <BusinessTypeCard
                    type="autonomous"
                    name="Autônomo"
                    icon={<Briefcase className="w-5 h-5" />}
                    selected={businessType === "autonomous"}
                    onClick={() => setBusinessType("autonomous")}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva seu negócio"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  placeholder="Endereço completo"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories and Settings */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Selected Categories */}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="py-1 px-3">
                      {category}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCategory(category)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Add New Category */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nova categoria"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddCategory}>
                  +
                </Button>
              </div>
              
              {/* Common Categories */}
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Categorias comuns</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        selectedCategories.includes(category)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-muted-foreground/30 hover:border-muted-foreground"
                      }`}
                      onClick={() => {
                        if (selectedCategories.includes(category)) {
                          handleRemoveCategory(category);
                        } else {
                          setSelectedCategories([...selectedCategories, category]);
                        }
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
          {isLoading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

interface BusinessTypeCardProps {
  type: "franchise" | "restaurant" | "autonomous";
  name: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

const BusinessTypeCard = ({ type, name, icon, selected, onClick }: BusinessTypeCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-colors ${
        selected
          ? "border-primary bg-primary/5 text-primary"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
        selected
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      }`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{name}</span>
    </button>
  );
};

export default Profile;
