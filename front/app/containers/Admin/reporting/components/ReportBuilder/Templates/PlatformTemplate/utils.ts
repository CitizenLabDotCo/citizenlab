import { FormatMessage } from 'typings';

import { getComparedTimeRange } from 'components/admin/GraphCards/_utils/query';

import messages from './messages';

export const getComparedDateRange = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const { compare_start_at, compare_end_at } = getComparedTimeRange(
    startDate,
    endDate
  );

  return {
    compareStartAt: compare_start_at,
    compareEndAt: compare_end_at,
  };
};

export const getCommunity = ({
  participantsNumber,
  formatMessage,
}: {
  participantsNumber: number;
  formatMessage: FormatMessage;
}) => {
  const community = `<b>${formatMessage(messages.community)}</b>`;
  const participants = formatMessage(messages.participants);

  return `<li>${community}: ${` ${participantsNumber} ${participants}`}</li>`;
};

export const getProjects = ({
  projectsNumber,
  formatMessage,
}: {
  projectsNumber: number;
  formatMessage: FormatMessage;
}) => {
  const projects = formatMessage(messages.projects);
  const published = formatMessage(messages.projectsPublished);

  return `<li><b>${projects}</b>: ${` ${projectsNumber} ${published}`}</li>`;
};

export const getDateLastReport = ({
  formatMessage,
}: {
  formatMessage: FormatMessage;
}) => {
  const dateLastReport = formatMessage(messages.dateLastReport);
  return `<li><b>${dateLastReport}</b>: </li>`;
};
