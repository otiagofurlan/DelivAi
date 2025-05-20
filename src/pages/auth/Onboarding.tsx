import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, Building, UtensilsCrossed, Briefcase, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { initializeUserData } from "@/services/mockData";
import { cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  { id: "franchise", name: "Franquia", icon: Building },
  { id: "restaurant", name: "Restaurante", icon: UtensilsCrossed },
  { id: "autonomous", name: "Autônomo", icon: Briefcase },
];

const CATEGORIES = [
  "Comida",
  "Bebidas",
  "Produtos físicos",
  "Serviços",
  "Digital",
  "Outro",
];

const Onboarding = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [businessType, setBusinessType] = useState<"franchise" | "restaurant" | "autonomous" | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [otherCategory, setOtherCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBusinessTypeSelect = (type: "franchise" | "restaurant" | "autonomous") => {
    setBusinessType(type);
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleRemoveCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== category));
  };

  const addOtherCategory = () => {
    if (otherCategory.trim() && !selectedCategories.includes(otherCategory.trim())) {
      setSelectedCategories([...selectedCategories, otherCategory.trim()]);
      setOtherCategory("");
    }
  };

  const goToNextStep = () => {
    if (currentStep === 1 && !businessType) {
      toast.error("Por favor, selecione um tipo de negócio");
      return;
    }

    if (currentStep === 2 && !businessName.trim()) {
      toast.error("Por favor, informe o nome do seu negócio");
      return;
    }

    if (currentStep === 3 && selectedCategories.length === 0) {
      toast.error("Por favor, selecione pelo menos uma categoria");
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding({
        businessType,
        businessName,
        businessCategories: selectedCategories,
      });

      setIsLoading(true);
      
      // Initialize user data with mock data
      if (user) {
        initializeUserData(user);
      }
      
      setTimeout(() => {
        toast.success("Perfil configurado com sucesso!");
        navigate("/dashboard");
      }, 1500);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Configurar Perfil</h1>
          <p className="mt-2 text-muted-foreground">
            Precisamos de algumas informações para personalizar sua experiência
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 card-shadow">
          {/* Step progress */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className="flex flex-col items-center"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep === step
                    ? "bg-primary text-white"
                    : currentStep > step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                )}>
                  {step}
                </div>
                <span className="text-xs mt-2 text-muted-foreground">
                  {step === 1 ? "Tipo" : step === 2 ? "Nome" : "Categoria"}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Business Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium">Qual o tipo do seu negócio?</h2>
              <div className="grid grid-cols-1 gap-4">
                {BUSINESS_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleBusinessTypeSelect(type.id as any)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all",
                        businessType === type.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-md flex items-center justify-center",
                        businessType === type.id
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{type.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {type.id === "franchise" && "Para empresas com múltiplas unidades"}
                          {type.id === "restaurant" && "Para bares, restaurantes e lanchonetes"}
                          {type.id === "autonomous" && "Para profissionais e serviços"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Business Name */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium">Como se chama seu negócio?</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Nome do negócio</Label>
                  <Input
                    id="business-name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Digite o nome do seu negócio"
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Business Categories */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium">O que você vende?</h2>
              
              {/* Selected categories */}
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
              
              {/* Predefined categories */}
              <div className="space-y-3">
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label htmlFor={category} className="cursor-pointer">{category}</Label>
                  </div>
                ))}
              </div>
              
              {/* Other category */}
              <div className="flex items-center gap-2 mt-4">
                <Input
                  placeholder="Outra categoria"
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addOtherCategory();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={addOtherCategory}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 1 || isLoading}
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={goToNextStep}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Finalizando...
                </>
              ) : (
                <>
                  {currentStep === 3 ? "Finalizar" : "Próximo"}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
