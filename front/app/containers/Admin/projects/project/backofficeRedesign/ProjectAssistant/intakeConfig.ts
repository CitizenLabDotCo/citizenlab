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

export type IntakeQuestionId = 'stage' | 'audience' | 'timing';

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
    // The decision-making stage — the GSM framework from the intake skill.
    // It's asked first because it's what most steers the archetype the engine
    // picks (the backend prompt maps Problem/Solution/Decision/Implementation
    // to a method). Each option also nudges the funnel-appropriate levers.
    id: 'stage',
    ask: messages.intakeStageAsk,
    options: [
      {
        id: 'problem',
        label: messages.intakeStageProblem,
        // Nothing decided yet; listen widely.
        levers: { influence: 1, how_fixed: 0, format: 2 },
        brief: messages.intakeStageProblemBrief,
      },
      {
        id: 'solution',
        label: messages.intakeStageSolution,
        // Problem is clear; co-create ideas in the open.
        levers: { influence: 1, how_fixed: 0, format: 0 },
        brief: messages.intakeStageSolutionBrief,
      },
      {
        id: 'decision',
        label: messages.intakeStageDecision,
        // Options exist; residents help choose between them.
        levers: { influence: 2, how_fixed: 1 },
        brief: messages.intakeStageDecisionBrief,
      },
      {
        id: 'implementation',
        label: messages.intakeStageImplementation,
        // The plan is set; consult on how to roll it out.
        levers: { influence: 1, how_fixed: 2 },
        brief: messages.intakeStageImplementationBrief,
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
