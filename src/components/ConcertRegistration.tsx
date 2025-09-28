import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Music, MapPin, Calendar, Clock, Star, Download, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TicketGenerator from "@/components/TicketGenerator";

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

      setRegistrationData(newRegistration);
      
      toast({ 
        title: "¡Registro exitoso!", 
        description: "Te has registrado correctamente para el concierto de JAHAZIEL BAND.",
      });
      
      setRegistered(true);
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

  const downloadTicket = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `ticket-jahaziel-${registrationData?.nombre?.replace(/\s+/g, '-')}-${registrationData?.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const newRegistration = () => {
    setRegistered(false);
    setRegistrationData(null);
    setFormData({
      nombre: "",
      telefono: "",
      direccion: "",
      iglesia: "",
      pastor: "",
      confirmado: false,
    });
  };

  if (registered && registrationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <div className="mx-auto w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">¡Registro Exitoso!</h1>
            <p className="text-muted-foreground mb-6">
              Te has registrado correctamente para el concierto de JAHAZIEL BAND
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ticket Preview */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center">Tu Ticket</h2>
              <TicketGenerator 
                registrationData={registrationData}
                onDownload={downloadTicket}
              />
            </div>

            {/* Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">¿Qué sigue?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 gradient-card rounded-lg">
                    <h3 className="font-semibold mb-2">Información importante:</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Descarga tu ticket y guárdalo</li>
                      <li>• Presenta tu ticket y documento de identidad</li>
                      <li>• Llega 30 minutos antes del evento</li>
                      <li>• El ticket es intransferible</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={downloadTicket}
                      className="w-full gradient-hero text-white hover:opacity-90"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Ticket
                    </Button>
                    
                    <Button 
                      onClick={newRegistration}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Nuevo Registro
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Detalles del Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 gradient-card rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="font-medium">Domingo 28 de Septiembre, 2024</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 gradient-card rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="font-medium">5:00 PM</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 gradient-card rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="font-medium">Hotel Crowne Plaza, Managua</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 gradient-card rounded-lg">
                      <Star className="w-5 h-5 text-primary" />
                      <span className="font-medium">Invitado Especial: Alex Chang</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
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