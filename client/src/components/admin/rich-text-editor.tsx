import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Escribe el contenido aquí...",
  minHeight = 300
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  
  // Para evitar errores de hidratación con SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Módulos y formatos para el editor
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };
  
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "color",
    "background",
    "align",
  ];
  
  // Manejar la inserción de una imagen
  const handleImageInsert = () => {
    const quill = quillRef.current?.getEditor();
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = () => {
          // En una implementación real, aquí se cargaría la imagen a un servidor
          // y se obtendría una URL. Para este ejemplo, usamos el DataURL
          const imageUrl = reader.result as string;
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', imageUrl, 'user');
          }
        };
        
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };
  
  // Acciones adicionales para el editor
  const editorActions = (
    <div className="flex justify-between items-center py-2 border-t">
      <div className="text-sm text-neutral-500">
        Puedes arrastrar imágenes directamente al editor
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleImageInsert}
      >
        <i className="fas fa-image mr-2"></i>
        Insertar imagen
      </Button>
    </div>
  );
  
  return (
    <div className="rounded-md border">
      {isMounted ? (
        <div className="rich-text-editor">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            modules={modules}
            formats={formats}
            style={{ minHeight: `${minHeight}px` }}
          />
          {editorActions}
        </div>
      ) : (
        <div 
          className="border rounded-md p-4 bg-neutral-50 text-neutral-400"
          style={{ minHeight: `${minHeight}px` }}
        >
          Cargando editor...
        </div>
      )}
    </div>
  );
}