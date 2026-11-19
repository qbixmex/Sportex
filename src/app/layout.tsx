import type { FC, ReactNode } from 'react';
import { montserrat, robotoSerif, sourceCodePro, lato } from '@/app/(public)/fonts';
import { Providers } from './(public)/providers';
import '@/app/globals.css';
import { cn } from '@/lib/utils';

type Props = Readonly<{ children: ReactNode; }>;

const fontsVariables = [
  montserrat.variable,
  lato.variable,
  robotoSerif.variable,
  sourceCodePro.variable,
  lato.variable,
];

const RootLayout: FC<Props> = ({ children }) => {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className={cn(fontsVariables, 'antialiased')}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
