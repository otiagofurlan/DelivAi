
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="max-w-md w-full mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Sistema de Pedidos</h1>
          <p className="mt-3 text-lg text-gray-600">
            Gerencie seus produtos e pedidos de forma simples e eficiente
          </p>
        </div>
        
        <div className="bg-white shadow-md rounded-xl p-8 card-shadow card-shadow-hover">
          <div className="space-y-6">
            <div className="text-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/login")}
                className="w-full mb-4"
              >
                Entrar
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate("/register")}
                className="w-full"
              >
                Criar Conta
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          Gerencie seu negócio com uma plataforma moderna e intuitiva
        </div>
      </div>
    </div>
  );
};

export default Index;
