import { Multiloc } from 'typings';

import {
  IUpdatedPhaseProperties,
  ParticipationMethod,
  PrescreeningMode,
} from 'api/phases/types';

import projectMessages from 'containers/Admin/projects/project/messages';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from '../../messages';

type PhaseSetting = {
  label: MessageDescriptor;
  value: string;
  keys: string[];
};

type Format = {
  formatMessage: (message: MessageDescriptor) => string;
  localize: (multiloc: Multiloc) => string;
};

type Settings = IUpdatedPhaseProperties;
type SettingKey = keyof Settings;
type RowBuilder = (settings: Settings, format: Format) => PhaseSetting | null;

const toggle =
  (key: SettingKey, label: MessageDescriptor): RowBuilder =>
  (settings, { formatMessage }) => {
    const value = settings[key];
    if (typeof value !== 'boolean') return null;

    return {
      label,
      value: formatMessage(value ? messages.on : messages.off),
      keys: [key],
    };
  };

const count =
  (key: SettingKey, label: MessageDescriptor): RowBuilder =>
  (settings, { formatMessage }) => {
    const value = settings[key];
    if (typeof value === 'number') {
      return { label, value: value.toString(), keys: [key] };
    }
    if (value === null) {
      return { label, value: formatMessage(messages.unlimited), keys: [key] };
    }
    return null;
  };

const text =
  (key: SettingKey, label: MessageDescriptor): RowBuilder =>
  (settings) => {
    const value = settings[key];
    return typeof value === 'string' && value !== ''
      ? { label, value, keys: [key] }
      : null;
  };

const translatedText =
  (
    key: 'native_survey_title_multiloc' | 'native_survey_button_multiloc',
    label: MessageDescriptor
  ): RowBuilder =>
  (settings, { localize }) => {
    const value = settings[key];
    return value ? { label, value: localize(value), keys: [key] } : null;
  };

const choice =
  (
    key: SettingKey,
    label: MessageDescriptor,
    options: Record<string, MessageDescriptor>
  ): RowBuilder =>
  (settings, { formatMessage }) => {
    const value = settings[key];
    if (typeof value !== 'string' || !(value in options)) return null;

    return { label, value: formatMessage(options[value]), keys: [key] };
  };

const likesPerPerson: RowBuilder = (settings, { formatMessage }) => {
  const method = settings.reacting_like_method;
  const max = settings.reacting_like_limited_max;
  const row = {
    label: messages.settingLikeLimit,
    keys: ['reacting_like_method', 'reacting_like_limited_max'],
  };

  if (method === 'unlimited') {
    return { ...row, value: formatMessage(messages.unlimited) };
  }
  if (method === 'limited' && typeof max === 'number') {
    return { ...row, value: max.toString() };
  }
  return null;
};

const PRESCREENING_MODES: Record<PrescreeningMode, MessageDescriptor> = {
  all: messages.prescreeningAll,
  flagged_only: messages.prescreeningFlaggedOnly,
};

// A null mode means no screening.
const prescreening: RowBuilder = (settings, { formatMessage }) => {
  const mode = settings.prescreening_mode;
  if (mode === undefined) return null;

  return {
    label: messages.settingPrescreening,
    value: formatMessage(mode ? PRESCREENING_MODES[mode] : messages.off),
    keys: ['prescreening_mode'],
  };
};

const presentation = choice('presentation_mode', messages.settingPresentation, {
  card: messages.presentationCard,
  map: messages.presentationMap,
  feed: messages.presentationFeed,
});

const inputSettings: RowBuilder[] = [
  toggle('submission_enabled', messages.settingSubmission),
  toggle('commenting_enabled', messages.settingCommenting),
  toggle('reacting_enabled', messages.settingReacting),
  likesPerPerson,
  toggle('allow_anonymous_participation', messages.settingAnonymous),
  presentation,
  prescreening,
];

const surveySettings: RowBuilder[] = [
  translatedText('native_survey_title_multiloc', messages.settingSurveyTitle),
  translatedText('native_survey_button_multiloc', messages.settingSurveyButton),
  toggle('allow_anonymous_participation', messages.settingAnonymous),
];

const ROWS: Record<ParticipationMethod, RowBuilder[]> = {
  ideation: inputSettings,
  proposals: [
    ...inputSettings,
    count('reacting_threshold', messages.settingReactingThreshold),
    count('expire_days_limit', messages.settingExpireDays),
  ],
  common_ground: [
    toggle('submission_enabled', messages.settingSubmission),
    toggle('reacting_enabled', messages.settingReacting),
    toggle('allow_anonymous_participation', messages.settingAnonymous),
  ],
  voting: [
    choice('voting_method', messages.settingVotingMethod, {
      single_voting: messages.votingSingle,
      multiple_voting: messages.votingMultiple,
      budgeting: messages.votingBudgeting,
    }),
    count('voting_min_total', messages.settingVotingMin),
    count('voting_max_total', messages.settingVotingMax),
    count('voting_max_votes_per_idea', messages.settingVotesPerOption),
    toggle('commenting_enabled', messages.settingCommenting),
    presentation,
    toggle('autoshare_results_enabled', messages.settingAutoshare),
  ],
  native_survey: surveySettings,
  community_monitor_survey: surveySettings,
  survey: [
    choice('survey_service', messages.settingSurveyService, {
      typeform: projectMessages.typeform,
      survey_xact: projectMessages.survey_xact,
      survey_monkey: projectMessages.survey_monkey,
      google_forms: projectMessages.google_forms,
      enalyzer: projectMessages.enalyzer,
      qualtrics: projectMessages.qualtrics,
      smart_survey: projectMessages.smart_survey,
      microsoft_forms: projectMessages.microsoft_forms,
      snap_survey: projectMessages.snap_survey,
    }),
    text('survey_embed_url', messages.settingSurveyUrl),
  ],
  poll: [toggle('poll_anonymous', messages.settingPollAnonymous)],
  document_annotation: [
    text('document_annotation_embed_url', messages.settingDocumentUrl),
  ],
  information: [],
  volunteering: [],
};

export const hasSettings = (method: ParticipationMethod) =>
  ROWS[method].length > 0;

export const getSettingRows = (
  method: ParticipationMethod,
  settings: Settings,
  format: Format
): PhaseSetting[] =>
  ROWS[method].flatMap((buildRow) => buildRow(settings, format) ?? []);

export const getSettingKeys = (
  method: ParticipationMethod,
  settings: Settings,
  format: Format
) => getSettingRows(method, settings, format).flatMap(({ keys }) => keys);
