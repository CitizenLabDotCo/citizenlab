import { v4 as uuidv4 } from 'uuid';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IPhaseData } from 'api/phases/types';

export function getTimelineTab(
  phase: IPhaseData
):
  | 'setup'
  | 'ideas'
  | 'proposals'
  | 'results'
  | 'polls'
  | 'survey-results'
  | 'volunteering' {
  const participationMethod = phase.attributes.participation_method;

  if (participationMethod === 'ideation' || participationMethod === 'voting') {
    return 'ideas';
  } else if (participationMethod === 'proposals') {
    return 'proposals';
  } else if (participationMethod === 'native_survey') {
    return 'results';
  } else if (participationMethod === 'poll') {
    return 'polls';
  } else if (participationMethod === 'survey') {
    return 'survey-results';
  } else if (participationMethod === 'volunteering') {
    return 'volunteering';
  }

  return 'setup';
}

type GenerateTemporaryFileAttachmentParams = {
  fileId: string;
  phaseId: string | undefined;
  position: number;
};

export const generateTemporaryFileAttachment = ({
  fileId,
  phaseId,
  position,
}: GenerateTemporaryFileAttachmentParams): IFileAttachmentData => {
  const temporaryFileAttachment: IFileAttachmentData = {
    id: `TEMP-${uuidv4()}`, // Temporary ID, to mark it as a newly added file attachment.
    attributes: {
      position,
    },
    relationships: {
      attachable: {
        data: {
          type: 'Phase',
          id: phaseId || '',
        },
      },
      file: {
        data: {
          id: fileId,
          type: 'file',
        },
      },
    },
    type: 'file_attachment',
  };

  return temporaryFileAttachment;
};
