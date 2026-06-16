import { API_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';

import { SurveyPdfCover } from './generateSurveyResponsesPdf';

type Params = {
  phaseId: string;
  cover: SurveyPdfCover;
};

// Fetches the cover page rendered as HTML by the backend (the same template the
// PDF uses), for the live preview. Returns raw HTML to drop into an iframe.
export const fetchCoverPreviewHtml = async ({
  phaseId,
  cover,
}: Params): Promise<string> => {
  const response = await fetch(
    `${API_PATH}/phases/${phaseId}/survey_cover_preview`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/html',
        Authorization: `Bearer ${getJwt()}`,
      },
      body: JSON.stringify({
        cover: {
          include: cover.include,
          title: cover.title,
          subtitle: cover.subtitle,
          date: cover.date,
          prepared_by: cover.preparedBy,
          notes: cover.notes,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Cover preview failed: ${response.status}`);
  }

  return response.text();
};
