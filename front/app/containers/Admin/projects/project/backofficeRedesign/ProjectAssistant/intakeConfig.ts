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

export type IntakeQuestionId =
  | 'stage'
  | 'audience'
  | 'closing'
  | 'timing'
  | 'tone'
  | 'distinctiveness'
  | 'statutory';

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
    // Closing the loop — what residents hear back. No lever; it ensures the
    // brief states the feedback commitment the engine should design toward.
    id: 'closing',
    ask: messages.intakeClosingAsk,
    options: [
      {
        id: 'summary',
        label: messages.intakeClosingSummary,
        brief: messages.intakeClosingSummaryBrief,
      },
      {
        id: 'shaped',
        label: messages.intakeClosingShaped,
        brief: messages.intakeClosingShapedBrief,
      },
      {
        id: 'decision',
        label: messages.intakeClosingDecision,
        brief: messages.intakeClosingDecisionBrief,
      },
    ],
    detailPlaceholder: messages.intakeClosingDetailPlaceholder,
    detailBrief: messages.intakeClosingDetailBrief,
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
  {
    // Tone — the backend prompt already branches on tone; this feeds it.
    id: 'tone',
    ask: messages.intakeToneAsk,
    options: [
      {
        id: 'warm',
        label: messages.intakeToneWarm,
        brief: messages.intakeToneWarmBrief,
      },
      {
        id: 'neutral',
        label: messages.intakeToneNeutral,
        brief: messages.intakeToneNeutralBrief,
      },
      {
        id: 'formal',
        label: messages.intakeToneFormal,
        brief: messages.intakeToneFormalBrief,
      },
    ],
  },
  {
    // Audience distinctiveness — grounds the draft in THIS community. The chip
    // gives signal on its own; the free-text detail carries the specifics.
    id: 'distinctiveness',
    ask: messages.intakeDistinctAsk,
    options: [
      {
        id: 'place',
        label: messages.intakeDistinctPlace,
        brief: messages.intakeDistinctPlaceBrief,
      },
      {
        id: 'multilingual',
        label: messages.intakeDistinctMultilingual,
        brief: messages.intakeDistinctMultilingualBrief,
      },
      {
        id: 'sensitive',
        label: messages.intakeDistinctSensitive,
        brief: messages.intakeDistinctSensitiveBrief,
      },
      {
        id: 'none',
        label: messages.intakeDistinctNone,
        brief: messages.intakeDistinctNoneBrief,
      },
    ],
    detailPlaceholder: messages.intakeDistinctDetailPlaceholder,
    detailBrief: messages.intakeDistinctDetailBrief,
  },
  {
    // Statutory — flags a legally-required consultation; the brief line
    // triggers the backend's statutory overlay (legal minimum + formal channel).
    id: 'statutory',
    ask: messages.intakeStatutoryAsk,
    options: [
      {
        id: 'no',
        label: messages.intakeStatutoryNo,
        brief: messages.intakeStatutoryNoBrief,
      },
      {
        id: 'yes',
        label: messages.intakeStatutoryYes,
        brief: messages.intakeStatutoryYesBrief,
      },
    ],
    detailPlaceholder: messages.intakeStatutoryDetailPlaceholder,
    detailBrief: messages.intakeStatutoryDetailBrief,
  },
];

// One recorded answer per question: the chosen option (if any) and an optional
// typed detail.
export type IntakeAnswer = {
  optionId?: string;
  detail?: string;
};

export type IntakeAnswers = Partial<Record<IntakeQuestionId, IntakeAnswer>>;
