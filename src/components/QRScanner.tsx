import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Camera, X, CheckCircle } from 'lucide-react';

interface QRScannerProps {
  onClose: () => void;
  onScanSuccess?: () => void;
}

export const QRScanner = ({ onClose, onScanSuccess }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [scanning, setScanning] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);

  useEffect(() => {
    startScanning();
    return () => {
      if (scanner) {
        scanner.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScanner.start();
      setScanner(qrScanner);
      setScanning(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara",
        variant: "destructive"
      });
    }
  };

  const handleScanResult = (result: QrScanner.ScanResult) => {
    try {
      const data = JSON.parse(result.data);
      if (data.id && data.nombre) {
        setScannedData(data);
        setConfirmDialog(true);
        if (scanner) {
          scanner.pause();
        }
      } else {
        toast({
          title: "QR inválido",
          description: "Este código QR no es válido para el evento",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "QR inválido",
        description: "No se pudo leer el código QR",
        variant: "destructive"
      });
    }
  };

  const confirmCheckIn = async () => {
    if (!scannedData) return;

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ checked_in: true })
        .eq('id', scannedData.id);

      if (error) throw error;

      toast({
        title: "¡Check-in exitoso!",
        description: `${scannedData.nombre} ha sido registrado`,
      });

      setConfirmDialog(false);
      onScanSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating check-in:', error);
      toast({
        title: "Error",
        description: "No se pudo realizar el check-in",
        variant: "destructive"
      });
    }
  };

  const cancelConfirm = () => {
    setConfirmDialog(false);
    setScannedData(null);
    if (scanner) {
      scanner.start();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Escanear QR</span>
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-200 rounded-lg object-cover"
                playsInline
              />
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                  <p className="text-gray-500">Iniciando cámara...</p>
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Apunta la cámara al código QR del ticket
            </p>
          </div>
        </Card>
      </div>

      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Confirmar Check-in</span>
            </DialogTitle>
            <DialogDescription>
              ¿Confirmas el check-in para esta persona?
            </DialogDescription>
          </DialogHeader>
          
          {scannedData && (
            <div className="space-y-2 p-4 bg-accent/20 rounded-lg">
              <p><strong>Nombre:</strong> {scannedData.nombre}</p>
              <p><strong>Teléfono:</strong> {scannedData.telefono}</p>
              <p><strong>Evento:</strong> {scannedData.evento}</p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button onClick={confirmCheckIn} className="flex-1">
              Confirmar
            </Button>
            <Button onClick={cancelConfirm} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};