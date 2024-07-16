import React from 'react';

import reactStringReplace from 'react-string-replace';

import ReferenceLink from './ReferenceLink';

export const refRegex =
  /\[?([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})\]?/g;

export const refRegexWithInitialEmptySpace =
  /\s\[?([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})\]?(,)?/g;

export const removeRefs = (input: string) => {
  return input.replace(refRegexWithInitialEmptySpace, '');
};

export const deleteTrailingIncompleteIDs = (str: string | null) => {
  if (!str) return str;
  return str.replace(/\[?[0-9a-f-]{0,35}$/, '');
};

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
    <ReferenceLink
      match={match}
      key={i}
      analysisId={analysisId}
      projectId={projectId}
      phaseId={phaseId || ''}
      selectedInputId={selectedInputId || ''}
    />
  ));
};
