'use client';

import { useState, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Props = Readonly<{ mapUrl: string; }>;

export const CopyMap: FC<Props> = ({ mapUrl }) => {
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    if (isCopying) return;

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(mapUrl);
      toast.success('Mapa copiado correctamente', { duration: 3000 });
    } catch (error) {
      console.error('Error al copiar la URL del mapa:', error);
    } finally {
      setTimeout(() => setIsCopying(false), 3000);
    }
  };

  return (
    <Button
      variant={
        isCopying
          ? 'outline-secondary'
          : 'outline-primary'
      }
      onClick={handleCopy}
      disabled={isCopying}
      className="w-full md:w-fit"
    >
      copiar mapa
    </Button>
  );
};
