import { isEqual } from 'lodash-es';
import { Multiloc } from 'typings';

import { MessageDescriptor } from 'utils/cl-intl';

import { ProposedValues } from '../../draft';
import messages from '../../messages';

type Format = {
  formatMessage: (
    message: MessageDescriptor,
    values?: Record<string, number>
  ) => string;
  localize: (multiloc: Multiloc) => string;
};

type Field = {
  label: MessageDescriptor;
  // The text of a fixed value. Values without one are shown as they are.
  options?: Record<string, MessageDescriptor>;
  format?: (value: unknown, format: Format) => string;
};

type OtherSettingRow = {
  key: string;
  label: string;
  value: string;
  previous?: string;
};

// 0 means every 30 minutes, any other number is a number of days, and null means never.
const formatExpiry = (value: unknown, { formatMessage }: Format) => {
  if (value === 0) return formatMessage(messages.thirtyMinutes);
  if (typeof value === 'number') {
    return formatMessage(messages.nDays, { days: value });
  }
  return formatMessage(messages.never);
};

const LIMIT_OPTIONS = {
  limited: messages.limited,
  unlimited: messages.unlimited,
};

const FIELDS: Record<string, Field | undefined> = {
  reacting_like_method: {
    label: messages.settingLikeLimit,
    options: LIMIT_OPTIONS,
  },
  reacting_like_limited_max: { label: messages.settingLikeLimit },
  reacting_dislike_enabled: { label: messages.settingDisliking },
  reacting_dislike_method: {
    label: messages.settingDislikeLimit,
    options: LIMIT_OPTIONS,
  },
  reacting_dislike_limited_max: { label: messages.settingMaxDislikes },
  available_views: {
    label: messages.settingAvailableViews,
    options: {
      card: messages.presentationCard,
      map: messages.presentationMap,
      feed: messages.presentationFeed,
    },
  },
  ideas_order: {
    label: messages.settingSorting,
    options: {
      trending: messages.sortTrending,
      random: messages.sortRandom,
      popular: messages.sortPopular,
      new: messages.sortNewest,
      '-new': messages.sortOldest,
      comments_count: messages.sortMostDiscussed,
    },
  },
  input_term: { label: messages.settingInputTerm },
  similarity_enabled: { label: messages.settingSimilarInputs },
  similarity_threshold_title: { label: messages.settingSimilarityTitle },
  similarity_threshold_body: { label: messages.settingSimilarityBody },
  vote_term: { label: messages.settingVoteTerm },
  voting_min_selected_options: { label: messages.settingMinSelectedOptions },
  voting_filtering_enabled: { label: messages.settingVotingFiltering },
  manual_voters_amount: { label: messages.settingOfflineVoters },

  require_verification: { label: messages.requirementVerification },
  require_name: { label: messages.requirementName },
  require_password: { label: messages.requirementPassword },
  require_confirmed_email: { label: messages.requirementEmail },
  require_confirmed_phone_number: { label: messages.requirementPhone },
  verification_expiry: {
    label: messages.settingVerificationExpiry,
    format: formatExpiry,
  },
  confirmed_email_expiry: {
    label: messages.settingEmailExpiry,
    format: formatExpiry,
  },
  confirmed_phone_number_expiry: {
    label: messages.settingPhoneExpiry,
    format: formatExpiry,
  },
  access_denied_explanation_multiloc: {
    label: messages.settingRefusalMessage,
  },

  address_2_multiloc: { label: messages.settingAddressDetails },
  attend_button_multiloc: { label: messages.settingAttendButton },
  using_url: { label: messages.settingSignUpLink },
  maximum_attendees: { label: messages.settingMaxAttendees },

  live_auto_input_topics_enabled: { label: messages.settingAutomaticTags },
};

const isMultiloc = (value: unknown): value is Multiloc =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((text) => typeof text === 'string');

// A field nobody labelled yet still shows up, under its own name.
const readableName = (key: string) => {
  const words = key.replace(/_multiloc$/, '').replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const formatValue = (
  value: unknown,
  field: Field | undefined,
  format: Format
): string => {
  const { formatMessage, localize } = format;

  if (field?.format) return field.format(value, format);
  if (value === null || value === undefined) {
    return formatMessage(messages.none);
  }
  if (typeof value === 'boolean') {
    return formatMessage(value ? messages.on : messages.off);
  }
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item, field, format)).join(', ');
  }
  if (isMultiloc(value)) return localize(value);
  if (typeof value === 'object') return JSON.stringify(value);

  const option = field?.options?.[String(value)];
  return option ? formatMessage(option) : String(value);
};

// Everything a proposal changes that has no row of its own, so nothing gets approved unseen.
export const getOtherSettingRows = (
  { proposed, saved }: ProposedValues,
  shownKeys: string[],
  format: Format
) => {
  const savedValues = new Map<string, unknown>(Object.entries(saved ?? {}));

  return Object.entries(proposed).flatMap(
    ([key, value]: [string, unknown]): OtherSettingRow[] => {
      if (shownKeys.includes(key)) return [];

      const savedValue = savedValues.get(key);
      // Multilocs are updated per locale.
      const proposedValue =
        isMultiloc(value) && isMultiloc(savedValue)
          ? { ...savedValue, ...value }
          : value;
      if (saved && isEqual(proposedValue, savedValue)) return [];

      const field = FIELDS[key];

      return [
        {
          key,
          label: field ? format.formatMessage(field.label) : readableName(key),
          value: formatValue(proposedValue, field, format),
          previous: saved && formatValue(savedValue, field, format),
        },
      ];
    }
  );
};
