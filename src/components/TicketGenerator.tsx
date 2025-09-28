import { useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TicketGeneratorProps {
  registrationData: {
    id: number;
    nombre: string;
    telefono: string;
    direccion: string;
    iglesia?: string;
    pastor?: string;
    created_at: string;
  };
  onDownload: () => void;
}

export default function TicketGenerator({ registrationData, onDownload }: TicketGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateTicket = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Header background
    ctx.fillStyle = '#533b9d';
    ctx.fillRect(0, 0, 800, 120);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('JAHAZIEL BAND', 400, 45);
    ctx.font = 'bold 24px Arial';
    ctx.fillText('CONCIERTO EN VIVO', 400, 80);

    // Event details
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('📅 Domingo 28 de Septiembre • 5:00 PM', 50, 160);
    ctx.fillText('📍 Centro de Convenciones, Hotel Crowne Plaza, Managua', 50, 190);
    ctx.fillText('⭐ Invitado Especial: Alex Chang', 50, 220);

    // Attendee info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('INFORMACIÓN DEL ASISTENTE:', 50, 280);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`Nombre: ${registrationData.nombre}`, 50, 310);
    ctx.fillText(`Teléfono: ${registrationData.telefono}`, 50, 335);
    ctx.fillText(`Dirección: ${registrationData.direccion}`, 50, 360);
    
    if (registrationData.iglesia) {
      ctx.fillText(`Iglesia: ${registrationData.iglesia}`, 50, 385);
    }
    
    if (registrationData.pastor) {
      ctx.fillText(`Pastor: ${registrationData.pastor}`, 50, 410);
    }

    // QR Code data
    const qrData = JSON.stringify({
      id: registrationData.id,
      nombre: registrationData.nombre,
      telefono: registrationData.telefono,
      evento: 'JAHAZIEL_BAND_2024',
      fecha: '2024-09-28'
    });

    // Generate QR code
    try {
      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, qrData, {
        width: 150,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Draw QR code on ticket
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(550, 250, 180, 180);
      ctx.drawImage(qrCanvas, 565, 265, 150, 150);
      
      // QR code label
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CÓDIGO QR', 640, 450);
      ctx.font = '12px Arial';
      ctx.fillText('Para check-in en el evento', 640, 470);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    // Ticket number
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Ticket #${registrationData.id.toString().padStart(6, '0')}`, 750, 550);
    ctx.fillText(`Registrado: ${new Date(registrationData.created_at).toLocaleDateString()}`, 750, 570);

    // Footer
    ctx.fillStyle = '#475569';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ENTRADA GRATUITA • TICKET INTRANSFERIBLE • PRESENTAR DOCUMENTO DE IDENTIDAD', 400, 590);

    onDownload();
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <canvas 
            ref={canvasRef}
            className="w-full h-auto border rounded-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </CardContent>
      </Card>
      
      <Button 
        onClick={generateTicket}
        className="w-full gradient-hero text-white hover:opacity-90"
        size="lg"
      >
        <Download className="w-4 h-4 mr-2" />
        Descargar Ticket
      </Button>
    </div>
  );
}