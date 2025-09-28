import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Music, MapPin, Calendar, Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TicketGenerator } from "./TicketGenerator";

interface FormData {
  nombre: string;
  telefono: string;
  direccion: string;
  iglesia: string;
  pastor: string;
  confirmado: boolean;
}

export default function ConcertRegistration() {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    telefono: "",
    direccion: "",
    iglesia: "",
    pastor: "",
    confirmado: false,
  });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" });
      return false;
    }
    if (!formData.telefono.trim()) {
      toast({ title: "Error", description: "El teléfono es obligatorio", variant: "destructive" });
      return false;
    }
    if (!formData.direccion.trim()) {
      toast({ title: "Error", description: "La dirección es obligatoria", variant: "destructive" });
      return false;
    }
    if (!formData.confirmado) {
      toast({ title: "Error", description: "Debe confirmar su asistencia", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Check registration count
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });

      if (count && count >= 1500) {
        toast({ 
          title: "Cupos completos", 
          description: "Lo sentimos, hemos alcanzado el límite de 1500 registros.",
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      // Check for duplicate phone
      const { data: existingRegistration } = await supabase
        .from('registrations')
        .select('telefono')
        .eq('telefono', formData.telefono)
        .single();

      if (existingRegistration) {
        toast({ 
          title: "Teléfono ya registrado", 
          description: "Este número de teléfono ya está registrado para el evento.",
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      // Insert registration
      const { data: newRegistration, error } = await supabase
        .from('registrations')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      toast({ 
        title: "¡Registro exitoso!", 
        description: "Te has registrado correctamente para el concierto de JAHAZIEL BAND.",
      });
      
      setRegistrationData(newRegistration);
      setRegistered(true);
      setShowTicket(true);
    } catch (error) {
      console.error('Registration error:', error);
      toast({ 
        title: "Error en el registro", 
        description: "Hubo un problema al procesar tu registro. Inténtalo de nuevo.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-concert transition-smooth">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gradient">¡Registro Exitoso!</CardTitle>
            <CardDescription>
              Te has registrado correctamente para el concierto de JAHAZIEL BAND
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 gradient-card rounded-lg">
              <p className="text-sm text-muted-foreground">
                Pronto recibirás más detalles sobre el evento. ¡Te esperamos!
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setShowTicket(true)} 
                className="flex-1 gradient-hero text-white"
              >
                Ver Ticket
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="flex-1"
              >
                Nuevo Registro
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Show Ticket Modal */}
        {showTicket && registrationData && (
          <TicketGenerator 
            registration={registrationData}
            onClose={() => setShowTicket(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-4">
            JAHAZIEL BAND
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6">
            Concierto en Vivo
          </p>
          
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center justify-center space-x-2 p-3 gradient-card rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Domingo 28 Sept</span>
            </div>
            <div className="flex items-center justify-center space-x-2 p-3 gradient-card rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">5:00 PM</span>
            </div>
            <div className="flex items-center justify-center space-x-2 p-3 gradient-card rounded-lg">
              <Star className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Alex Chang</span>
            </div>
            <div className="flex items-center justify-center space-x-2 p-3 gradient-card rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Hotel Crowne Plaza</span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="max-w-2xl mx-auto shadow-concert">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Registro Gratuito</CardTitle>
            <CardDescription className="text-center">
              Centro de Convenciones, Hotel Crowne Plaza, Managua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="Tu número de teléfono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección *</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Tu dirección completa"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iglesia">Iglesia (opcional)</Label>
                  <Input
                    id="iglesia"
                    value={formData.iglesia}
                    onChange={(e) => handleInputChange('iglesia', e.target.value)}
                    placeholder="Nombre de tu iglesia"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pastor">Pastor (opcional)</Label>
                  <Input
                    id="pastor"
                    value={formData.pastor}
                    onChange={(e) => handleInputChange('pastor', e.target.value)}
                    placeholder="Nombre del pastor"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 gradient-card rounded-lg">
                <Checkbox
                  id="confirmado"
                  checked={formData.confirmado}
                  onCheckedChange={(checked) => handleInputChange('confirmado', !!checked)}
                />
                <Label htmlFor="confirmado" className="text-sm">
                  Confirmo mi asistencia y entiendo que este ticket es intransferible *
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-hero text-white hover:opacity-90 transition-smooth"
                disabled={loading}
                size="lg"
              >
                {loading ? "Registrando..." : "Registrarme Gratis"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Entrada gratuita con previo registro • Cupos limitados a 1,500 personas</p>
        </div>
      </div>
    </div>
  );
}