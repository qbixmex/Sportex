import type { Metadata } from 'next';
import { NotFoundIcon } from '@/shared/components/icons/not-found';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que estas buscando no existe',
  robots: 'noindex, nofollow',
};

const NotFoundPage = () => {
  return (
    <div className="admin-page">
      <div className="flex flex-1 flex-col justify-center items-center gap-5 bg-muted/50 min-h-dvh rounded-xl p-10 md:min-h-min">
        <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold text-pink-500">
          PÁGINA NO ENCONTRADA
        </h1>
        <NotFoundIcon
          strokeWidth={1}
          className="w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] h-auto text-gray-500"
        />
      </div>
    </div>
  );
};

export default NotFoundPage;
