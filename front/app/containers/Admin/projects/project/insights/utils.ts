import { ParticipationMethod } from 'api/phases/types';

/**
 * Whether the platform records who takes part in a phase.
 *
 * Konveio keeps the annotations and their authors on its own side, so a
 * document annotation phase only ever yields visit data here: participant
 * counts, the participation rate and demographics have nothing to report.
 */
export const tracksParticipants = (method: ParticipationMethod): boolean =>
  method !== 'document_annotation';
