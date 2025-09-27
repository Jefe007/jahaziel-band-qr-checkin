import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({ 
        title: "Error", 
        description: "Por favor completa todos los campos",
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({ 
          title: "Cuenta creada", 
          description: "Cuenta de administrador creada exitosamente. Ahora puedes iniciar sesión.",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: adminRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();

          if (!adminRole) {
            // If it's the first admin login, create admin role
            await supabase
              .from('user_roles')
              .insert([{ user_id: user.id, role: 'admin' }]);
          }
        }
        
        toast({ 
          title: "Bienvenido", 
          description: "Has iniciado sesión como administrador",
        });
        onLogin();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({ 
        title: "Error de autenticación", 
        description: error.message || "Error al procesar la solicitud",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-accent/20 to-background">
      <Card className="w-full max-w-md shadow-concert">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gradient">
            {isSignUp ? "Crear Cuenta Admin" : "Panel de Administración"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Crea tu cuenta de administrador para gestionar el evento"
              : "Inicia sesión para gestionar las inscripciones del concierto"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full gradient-hero text-white hover:opacity-90 transition-smooth"
              disabled={loading}
            >
              {loading 
                ? (isSignUp ? "Creando cuenta..." : "Iniciando sesión...") 
                : (isSignUp ? "Crear Cuenta" : "Iniciar Sesión")
              }
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {isSignUp 
                ? "¿Ya tienes cuenta? Inicia sesión" 
                : "¿Primera vez? Crear cuenta de administrador"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}