import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  accept = "image/*",
  maxSize = 5,
  className = ""
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: `El archivo debe ser menor a ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Crear FormData para envío multipart
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/staff-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.url) {
        setPreview(data.url);
        onChange(data.url);
        toast({
          title: "Imagen subida exitosamente",
          description: "La imagen se ha guardado correctamente"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error al subir imagen",
        description: "No se pudo guardar la imagen",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Label htmlFor="image-upload">Imagen del profesional</Label>
          <div className="mt-2">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div 
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={handleClick}
              >
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sin imagen</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Subiendo..." : "Subir imagen"}
          </Button>
          
          {preview && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
      />
      
      <p className="text-xs text-gray-500">
        Formatos permitidos: JPG, PNG, GIF, WebP. Máximo {maxSize}MB.
      </p>
    </div>
  );
}