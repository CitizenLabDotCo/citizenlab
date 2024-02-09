import React from 'react';
import reactStringReplace from 'react-string-replace';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { Icon, colors } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import styled from 'styled-components';

export const refRegex =
  /\[?([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})\]?/g;

export const refRegexWithInitialEmptySpace =
  /\s\[?([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})\]?/g;

export const removeRefs = (input: string) => {
  return input.replace(refRegexWithInitialEmptySpace, '');
};

export const deleteTrailingIncompleteIDs = (str: string | null) => {
  if (!str) return str;
  return str.replace(/\[?[0-9a-f-]{0,35}$/, '');
};

const StyledLink = styled(Link)<{ isActive: boolean }>`
  color: ${colors.black};
  svg {
    transform: scaleX(-1);
    margin-bottom: 4px;
  }
  :hover {
    color: ${colors.teal500};
  }
  ${({ isActive }) =>
    isActive &&
    `color: ${colors.teal500};
  `}
`;

export const replaceIdRefsWithLinks = ({
  insight,
  analysisId,
  projectId,
  phaseId,
  selectedInputId,
}: {
  insight: string | null;
  analysisId: string;
  projectId: string;
  phaseId?: string | null;
  selectedInputId?: string;
}) => {
  if (!insight) return null;
  return reactStringReplace(insight, refRegex, (match, i) => (
    <StyledLink
      to={`/admin/projects/${projectId}/analysis/${analysisId}?phase_id=${phaseId}&selected_input_id=${match}`}
      onClick={() => {
        updateSearchParams({ selected_input_id: match });
        trackEventByName(tracks.inputPreviewedFromSummary.name, {
          extra: { analysisId },
        });
      }}
      key={i}
      isActive={selectedInputId === match}
    >
      <Icon name="comment" width="12px" height="12px" />
    </StyledLink>
  ));
};
