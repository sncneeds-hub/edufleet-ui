import React from 'react';
import { MessageCircle, Phone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const FloatingActions = () => {
  return (
    <>
      {/* Left side: Download App Button */}
      <div className="fixed left-4 md:left-8 bottom-6 md:bottom-10 z-[100] animate-in-from-left">
        <a 
          href="https://play.google.com/store/apps" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <Button 
            className={cn(
              "rounded-full shadow-2xl h-12 md:h-16 px-4 md:px-8",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95",
              "border-2 border-white/20"
            )}
          >
            <Download className="w-5 h-5 md:w-6 md:h-6" />
            <span className="hidden sm:inline font-bold tracking-tight text-base md:text-lg">Download App</span>
            <span className="sm:hidden font-bold text-sm">App</span>
          </Button>
        </a>
      </div>

      {/* Right side: WhatsApp and Contact Icons */}
      <div className="fixed right-4 md:right-8 bottom-6 md:bottom-10 z-[100] flex flex-col gap-4 md:gap-6 animate-in-from-right">
        {/* Contact Icon */}
        <a 
          href="tel:7892841785" 
          className="group"
          title="Call Us"
        >
          <div className={cn(
            "w-10 h-10 md:w-13 md:h-13 rounded-full shadow-2xl",
            "bg-primary text-primary-foreground flex items-center justify-center",
            "transition-all duration-300 hover:scale-110 hover:-translate-y-2 group-hover:shadow-primary/40",
            "border-2 border-white/20 active:scale-90"
          )}>
            <Phone className="w-6 h-6 md:w-8 md:h-8" />
          </div>
        </a>

        {/* WhatsApp Icon */}
        <a 
          href="https://wa.me/7892841785" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group"
          title="WhatsApp Us"
        >
          <div className={cn(
            "w-10 h-10 md:w-13 md:h-13 rounded-full shadow-2xl",
            "bg-[#25D366] text-white flex items-center justify-center",
           "transition-all duration-300 hover:scale-110 hover:-translate-y-2 group-hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]",
            "border-2 border-white/20 active:scale-90"
          )}>
            <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
          </div>
        </a>
      </div>
    </>
  );
};
