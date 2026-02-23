import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VirtualAssistant } from "./virtual-assistant";

export function ChatButton() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <>
      {/* Botón flotante del asistente */}
      <div className="fixed bottom-20 right-6 z-40">
        <Button
          onClick={() => setIsAssistantOpen(true)}
          className="w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Abrir asistente virtual"
        >
          <i className="fas fa-comments text-xl group-hover:scale-110 transition-transform"></i>
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-neutral-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Asistente Virtual
        </div>
      </div>

      {/* Componente del asistente virtual */}
      <VirtualAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </>
  );
}