import type { FC } from 'react';
import { cn } from '@/lib/utils';
import { FieldMap } from '@/shared/components/field-map';
import type { ResolvedFieldMap } from '@/lib/maps';
import { CopyMap } from './copy-map';
import publicStyles from './public_styles.module.css';
import adminStyles from './admin_styles.module.css';

type Variant = 'public' | 'admin';

const VARIANTS = {
  public: publicStyles,
  admin: adminStyles,
} as const;

type Props = Readonly<{
  maps: readonly ResolvedFieldMap[];
  variant?: Variant;
  className?: string;
}>;

export const FieldsMap: FC<Props> = ({
  maps,
  variant = 'public',
  className,
}) => {
  const styles = VARIANTS[variant];

  return (
    <section className={cn(styles.section, className)}>
      <h2 className={styles.heading}>
        {maps.length === 1 ? 'Cancha' : 'Canchas'}
      </h2>

      {maps.length === 0 ? (
        <p className={styles.empty}>No hay canchas asignadas</p>
      ) : (
        <div
          className={cn(styles.mapsMobileLayout, {
            [styles.mapsDesktopLayout]: maps.length > 1,
          })}
        >
          {maps.map((map) => (
            <div key={map.id} className={styles.mapLayout}>
              <div className={styles.mapHeader}>
                <h3 className={styles.fieldName}>{map.name}</h3>
                <CopyMap mapUrl={map.link} />
              </div>
              <FieldMap
                link={map.link}
                embedUrl={map.embedUrl}
                title={map.name}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
