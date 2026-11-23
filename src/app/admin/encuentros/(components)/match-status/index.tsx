'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { MATCH_STATUS, type MATCH_STATUS_TYPE } from '@/shared/enums';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { updateStatusAction } from '@/app/admin/encuentros/(actions)/update-status.action';
import { finishMatchAction } from '@/app/admin/encuentros/(actions)/finish-match.action';
import { toast } from 'sonner';

type Props = Readonly<{
  matchId: string;
  status: MATCH_STATUS_TYPE;
  localScore: number;
  visitorScore: number;
  localId: string;
  visitorId: string;
}>;

export const MatchStatus: FC<Props> = ({
  matchId,
  status,
  localScore,
  visitorScore,
  localId,
  visitorId,
}) => {
  const [currentStatus, setCurrentStatus] = useState<MATCH_STATUS_TYPE>(status);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const onUpdateStatus = async (newStatus: MATCH_STATUS_TYPE) => {
    if (newStatus === MATCH_STATUS.COMPLETED) {
      setIsConfirmOpen(true);
      return;
    }

    setIsPending(true);
    const response = await updateStatusAction(matchId, newStatus);
    setIsPending(false);

    if (!response.ok) {
      toast.error(response.message);
      return;
    }

    setCurrentStatus(newStatus);
    toast.success(response.message);
  };

  const onConfirmFinish = async () => {
    setIsPending(true);
    const response = await finishMatchAction({
      matchId,
      localScore,
      visitorScore,
      localId,
      visitorId,
    });
    setIsPending(false);

    if (!response.ok) {
      toast.error(response.message);
      return;
    }

    setCurrentStatus(MATCH_STATUS.COMPLETED);
    toast.success(response.message);
  };

  return (
    <>
      <Select
        value={currentStatus}
        onValueChange={onUpdateStatus}
        disabled={isPending}
      >
        <SelectTrigger
          className="w-[150px]"
          aria-label="Estado del encuentro"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={MATCH_STATUS.IN_REVIEW}>en revisión</SelectItem>
            <SelectItem value={MATCH_STATUS.SCHEDULED}>programado</SelectItem>
            <SelectItem value={MATCH_STATUS.IN_PROGRESS}>en progreso</SelectItem>
            <SelectItem value={MATCH_STATUS.POST_POSED}>pospuesto</SelectItem>
            <SelectItem value={MATCH_STATUS.CANCELED}>cancelado</SelectItem>
            <SelectItem value={MATCH_STATUS.COMPLETED}>finalizado</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿ Confirmas que quieres finalizar el encuentro ?</AlertDialogTitle>
            <AlertDialogDescription>
              Al finalizar el encuentro el resultado final impactará la tabla de posiciones
              y se recalcularán las estadísticas y los puntos obtenidos por cada equipo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cancel-btn">cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="delete-btn"
              onClick={onConfirmFinish}
            >
              proceder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MatchStatus;
