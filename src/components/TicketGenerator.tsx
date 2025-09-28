import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Music, MapPin, Calendar, Clock, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TicketProps {
  registration: {
    id: number;
    nombre: string;
    telefono: string;
    direccion: string;
    iglesia?: string;
    pastor?: string;
  };
  onClose: () => void;
}

export const TicketGenerator = ({ registration, onClose }: TicketProps) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const generateQR = async () => {
    const ticketData = {
      id: registration.id,
      nombre: registration.nombre,
      telefono: registration.telefono,
      evento: 'JAHAZIEL BAND - Concierto en Vivo'
    };
    
    try {
      return await QRCode.toDataURL(JSON.stringify(ticketData), {
        width: 150,
        margin: 2,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('Error generando QR:', error);
      return '';
    }
  };

  const downloadTicket = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false
      });
      
      const link = document.createElement('a');
      link.download = `ticket-jahaziel-band-${registration.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "¡Ticket descargado!",
        description: "Tu ticket ha sido guardado como imagen.",
      });
    } catch (error) {
      console.error('Error descargando ticket:', error);
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar el ticket. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    generateQR().then(setQrCode);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-gradient">Tu Ticket</h2>
          
          {/* Ticket Design */}
          <div ref={ticketRef} className="bg-white p-6 rounded-lg shadow-lg">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-3">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">JAHAZIEL BAND</h1>
              <p className="text-lg text-gray-600">Concierto en Vivo</p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-gray-900">Domingo 28 Sept</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-gray-900">5:00 PM</span>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-gray-900">Hotel Crowne Plaza, Managua</span>
              </div>
            </div>

            {/* Attendee Info */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Asistente</h3>
              <p className="text-lg font-medium text-gray-900">{registration.nombre}</p>
              <p className="text-sm text-gray-600">Tel: {registration.telefono}</p>
              {registration.iglesia && (
                <p className="text-sm text-gray-600">Iglesia: {registration.iglesia}</p>
              )}
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              {qrCode && (
                <img src={qrCode} alt="Código QR" className="w-32 h-32" />
              )}
            </div>

            {/* Ticket ID */}
            <div className="text-center">
              <p className="text-xs text-gray-500">Ticket ID: #{registration.id}</p>
              <p className="text-xs text-gray-500 mt-1">Este ticket es intransferible</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              onClick={downloadTicket}
              className="flex-1 gradient-hero text-white hover:opacity-90"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Ticket
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};