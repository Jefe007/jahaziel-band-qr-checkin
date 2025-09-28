import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  Settings, 
  Download, 
  Edit, 
  Trash2, 
  QrCode, 
  LogOut,
  UserCheck,
  UserX
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TicketGenerator } from "./TicketGenerator";
import { QRScanner } from "./QRScanner";

interface Registration {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
  iglesia: string | null;
  pastor: string | null;
  confirmado: boolean;
  checked_in: boolean;
  created_at: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [maxCapacity] = useState(1500);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchRegistrations();
    fetchSettings();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({ 
        title: "Error", 
        description: "No se pudieron cargar las inscripciones",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('event_settings')
        .select('*')
        .eq('key', 'registration_enabled')
        .single();

      if (error) throw error;
      setRegistrationEnabled(data?.value === 'true');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const toggleRegistration = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('event_settings')
        .update({ value: enabled.toString() })
        .eq('key', 'registration_enabled');

      if (error) throw error;
      
      setRegistrationEnabled(enabled);
      toast({ 
        title: "Configuración actualizada", 
        description: `Registro ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente`,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({ 
        title: "Error", 
        description: "No se pudo actualizar la configuración",
        variant: "destructive" 
      });
    }
  };

  const deleteRegistration = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta inscripción?')) return;

    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchRegistrations();
      toast({ 
        title: "Inscripción eliminada", 
        description: "La inscripción ha sido eliminada exitosamente",
      });
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast({ 
        title: "Error", 
        description: "No se pudo eliminar la inscripción",
        variant: "destructive" 
      });
    }
  };

  const toggleCheckIn = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ checked_in: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      await fetchRegistrations();
      toast({ 
        title: "Check-in actualizado", 
        description: `Usuario ${!currentStatus ? 'registrado' : 'des-registrado'} exitosamente`,
      });
    } catch (error) {
      console.error('Error updating check-in:', error);
      toast({ 
        title: "Error", 
        description: "No se pudo actualizar el check-in",
        variant: "destructive" 
      });
    }
  };

  const generateQRData = (registration: Registration) => {
    return `${registration.id}-${registration.telefono}`;
  };

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Nombre', 'Teléfono', 'Dirección', 'Iglesia', 'Pastor', 'Check-in', 'Fecha Registro'].join(','),
      ...registrations.map(reg => [
        reg.id,
        `"${reg.nombre}"`,
        reg.telefono,
        `"${reg.direccion}"`,
        `"${reg.iglesia || ''}"`,
        `"${reg.pastor || ''}"`,
        reg.checked_in ? 'Sí' : 'No',
        new Date(reg.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations-jahaziel-band.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  const registrationCount = registrations.length;
  const checkedInCount = registrations.filter(r => r.checked_in).length;
  const availableSpots = maxCapacity - registrationCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Panel de Administración</h1>
            <p className="text-muted-foreground">Concierto JAHAZIEL BAND</p>
          </div>
          <Button 
            onClick={onLogout}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrationCount}</div>
              <p className="text-xs text-muted-foreground">
                de {maxCapacity} cupos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkedInCount}</div>
              <p className="text-xs text-muted-foreground">
                han llegado al evento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cupos Disponibles</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableSpots}</div>
              <p className="text-xs text-muted-foreground">
                espacios restantes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado Registro</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={registrationEnabled}
                  onCheckedChange={toggleRegistration}
                />
                <span className="text-sm">
                  {registrationEnabled ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button onClick={exportToCSV} variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </Button>
          <Button onClick={() => setShowScanner(true)} className="flex items-center space-x-2">
            <QrCode className="w-4 h-4" />
            <span>Escanear QR</span>
          </Button>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inscripciones</CardTitle>
            <CardDescription>
              Lista completa de personas registradas para el concierto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Iglesia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">{registration.nombre}</TableCell>
                      <TableCell>{registration.telefono}</TableCell>
                      <TableCell>{registration.iglesia || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={registration.checked_in ? "default" : "secondary"}>
                          {registration.checked_in ? 'Check-in' : 'Registrado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(registration.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleCheckIn(registration.id, registration.checked_in)}
                          >
                            {registration.checked_in ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedRegistration(registration);
                              setShowTicket(true);
                            }}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteRegistration(registration.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Generator Modal */}
      {showTicket && selectedRegistration && (
        <TicketGenerator
          registration={selectedRegistration}
          onClose={() => {
            setShowTicket(false);
            setSelectedRegistration(null);
          }}
        />
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onScanSuccess={() => {
            fetchRegistrations();
            setShowScanner(false);
          }}
        />
      )}
    </div>
  );
}