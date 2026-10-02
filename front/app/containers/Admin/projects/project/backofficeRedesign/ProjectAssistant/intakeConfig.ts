import { MessageDescriptor } from 'react-intl';

import { ProjectGenerationLevers } from 'api/project_generations/types';

import messages from './messages';

// The conversational intake: a short, friendly back-and-forth the assistant has
// after it's read the brief, before it drafts. Each answer is one tap, so the
// whole thing stays optional and fast — the "Draft" button is always there, so
// nobody is forced through a questionnaire. The point is a few high-signal
// questions that make the draft feel bespoke, not an exhaustive form.
//
// Each option does two things: it nudges the structural `levers` the backend
// already understands, and it adds one plain-language line to the brief, so the
// generation engine gets the context in the same words the manager would use.

export type IntakeQuestionId = 'outcome' | 'audience' | 'timing';

export type IntakeOption = {
  id: string;
  label: MessageDescriptor;
  // The structural dials this choice implies (merged into the levers).
  levers?: Partial<ProjectGenerationLevers>;
  // A sentence appended to the brief, phrased for the engine.
  brief: MessageDescriptor;
};

export type IntakeQuestionConfig = {
  id: IntakeQuestionId;
  // The assistant's chat bubble.
  ask: MessageDescriptor;
  options: IntakeOption[];
  // An optional free-text follow-up ("anything specific?") — kept optional so
  // it adds colour without adding friction.
  detailPlaceholder?: MessageDescriptor;
  // How a typed detail is woven into the brief: "{detail}" is replaced.
  detailBrief?: MessageDescriptor;
};

export const INTAKE_QUESTIONS: IntakeQuestionConfig[] = [
  {
    id: 'outcome',
    ask: messages.intakeOutcomeAsk,
    options: [
      {
        id: 'understand',
        label: messages.intakeOutcomeUnderstand,
        levers: { influence: 0, how_fixed: 0 },
        brief: messages.intakeOutcomeUnderstandBrief,
      },
      {
        id: 'inform-decision',
        label: messages.intakeOutcomeInform,
        levers: { influence: 1, how_fixed: 1 },
        brief: messages.intakeOutcomeInformBrief,
      },
      {
        id: 'residents-decide',
        label: messages.intakeOutcomeDecide,
        levers: { influence: 2 },
        brief: messages.intakeOutcomeDecideBrief,
      },
    ],
  },
  {
    id: 'audience',
    ask: messages.intakeAudienceAsk,
    options: [
      {
        id: 'anyone',
        label: messages.intakeAudienceAnyone,
        levers: { audience: 0, reach: 0 },
        brief: messages.intakeAudienceAnyoneBrief,
      },
      {
        id: 'residents',
        label: messages.intakeAudienceResidents,
        levers: { audience: 1 },
        brief: messages.intakeAudienceResidentsBrief,
      },
      {
        id: 'invited',
        label: messages.intakeAudienceInvited,
        levers: { audience: 2, reach: 2 },
        brief: messages.intakeAudienceInvitedBrief,
      },
    ],
    detailPlaceholder: messages.intakeAudienceDetailPlaceholder,
    detailBrief: messages.intakeAudienceDetailBrief,
  },
  {
    id: 'timing',
    ask: messages.intakeTimingAsk,
    options: [
      {
        id: 'no-deadline',
        label: messages.intakeTimingNone,
        brief: messages.intakeTimingNoneBrief,
      },
      {
        id: 'weeks',
        label: messages.intakeTimingWeeks,
        brief: messages.intakeTimingWeeksBrief,
      },
      {
        id: 'months',
        label: messages.intakeTimingMonths,
        brief: messages.intakeTimingMonthsBrief,
      },
    ],
    detailPlaceholder: messages.intakeTimingDetailPlaceholder,
    detailBrief: messages.intakeTimingDetailBrief,
  },
];

// One recorded answer per question: the chosen option (if any) and an optional
// typed detail.
export type IntakeAnswer = {
  optionId?: string;
  detail?: string;
};

export type IntakeAnswers = Partial<Record<IntakeQuestionId, IntakeAnswer>>;
