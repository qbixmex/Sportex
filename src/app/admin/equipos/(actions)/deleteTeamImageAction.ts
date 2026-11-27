'use server';

import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/get-session';
import deleteImage from '@/shared/actions/deleteImageAction';
import { updateTag } from 'next/cache';

export type ResponseDeleteAction = Promise<{
  ok: boolean;
  message: string;
}>;

export const deleteTeamImageAction = async (teamId: string): ResponseDeleteAction => {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return { ok: false, message: guard.message };
  }

  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId },
      select: {
        name: true,
        imagePublicID: true,
      },
    });

    if (!team) {
      return {
        ok: false,
        message: 'No se puede eliminar la imagen, quizás fue eliminada ó no existe',
      };
    }

    await prisma.team.update({
      where: { id: teamId },
      data: {
        imageUrl: null,
        imagePublicID: null,
      },
    });

    // Delete image from cloudinary.
    if (team.imagePublicID) {
      const response = await deleteImage(team.imagePublicID);
      if (!response.ok) {
        console.error(`Error eliminando la imagen del equipo: ${team.imagePublicID}`);
        return {
          ok: false,
          message: 'La imagen fue eliminada de la base de datos, pero no de cloudinary, revise los logs del servidor',
        };
      }
    }

    // Update Cache
    updateTag('admin-teams');
    updateTag('admin-team');
    updateTag('public-teams');
    updateTag('public-team');

    return {
      ok: true,
      message: 'La imagen ha sido eliminada correctamente',
    };
  } catch (error) {
    console.error(`Error eliminando la imagen del equipo: ${(error as Error).message}`);
    return {
      ok: false,
      message: 'No se pudo eliminar la imagen, revise los logs del servidor',
    };
  }
};
