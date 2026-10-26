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
  | 'influence'
  | 'success'
  | 'audience'
  | 'closing'
  | 'timing'
  | 'distinctiveness'
  | 'statutory';

export type IntakeOption = {
  id: string;
  label: MessageDescriptor;
  // The structural dials this choice implies (merged into the levers).
  levers?: Partial<ProjectGenerationLevers>;
  // A sentence appended to the brief, phrased for the engine.
  brief: MessageDescriptor;
  // "Other" — picking it reveals the question's free-text field so the manager
  // can describe their own situation instead of choosing a preset.
  isOther?: boolean;
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
    // to a method). Stage sets how_fixed/format but NOT influence: how much
    // power residents hold is asked directly in the next question, because the
    // two are orthogonal (a "Decision"-stage project can be a mere Consult or a
    // binding Decide).
    id: 'stage',
    ask: messages.intakeStageAsk,
    options: [
      {
        id: 'problem',
        label: messages.intakeStageProblem,
        // Nothing decided yet; listen widely.
        levers: { how_fixed: 0, format: 2 },
        brief: messages.intakeStageProblemBrief,
      },
      {
        id: 'solution',
        label: messages.intakeStageSolution,
        // Problem is clear; co-create ideas in the open.
        levers: { how_fixed: 0, format: 0 },
        brief: messages.intakeStageSolutionBrief,
      },
      {
        id: 'decision',
        label: messages.intakeStageDecision,
        // Options exist; residents help choose between them.
        levers: { how_fixed: 1 },
        brief: messages.intakeStageDecisionBrief,
      },
      {
        id: 'implementation',
        label: messages.intakeStageImplementation,
        // The plan is set; consult on how to roll it out.
        levers: { how_fixed: 2 },
        brief: messages.intakeStageImplementationBrief,
      },
      {
        id: 'other',
        label: messages.intakeStageOther,
        // No preset fits — the typed detail carries the signal instead.
        isOther: true,
        brief: messages.intakeStageOtherBrief,
      },
    ],
    detailPlaceholder: messages.intakeStageDetailPlaceholder,
    detailBrief: messages.intakeStageDetailBrief,
  },
  {
    // Real influence — the IAP2 ladder, asked directly (the single highest-
    // judgement moment in the original intake). The "real level, not the hoped-
    // for one" framing in the ask carries the skill's truth-check cheaply,
    // without a second turn. Drives the influence lever 0..4.
    id: 'influence',
    ask: messages.intakeInfluenceAsk,
    options: [
      {
        id: 'inform',
        label: messages.intakeInfluenceInform,
        levers: { influence: 0 },
        brief: messages.intakeInfluenceInformBrief,
      },
      {
        id: 'consult',
        label: messages.intakeInfluenceConsult,
        levers: { influence: 1 },
        brief: messages.intakeInfluenceConsultBrief,
      },
      {
        id: 'involve',
        label: messages.intakeInfluenceInvolve,
        levers: { influence: 2 },
        brief: messages.intakeInfluenceInvolveBrief,
      },
      {
        id: 'codesign',
        label: messages.intakeInfluenceCodesign,
        levers: { influence: 3 },
        brief: messages.intakeInfluenceCodesignBrief,
      },
      {
        id: 'decide',
        label: messages.intakeInfluenceDecide,
        levers: { influence: 4 },
        brief: messages.intakeInfluenceDecideBrief,
      },
    ],
  },
  {
    // Success — what a win looks like. One tap for the type of win (which nudges
    // the reach lever: breadth vs depth), plus an optional concrete target in
    // free text — the highest-signal part, matching the skill's examples
    // ("200 responses", "5% of residents").
    id: 'success',
    ask: messages.intakeSuccessAsk,
    options: [
      {
        id: 'turnout',
        label: messages.intakeSuccessTurnout,
        // Breadth: many quick voices.
        levers: { reach: 0 },
        brief: messages.intakeSuccessTurnoutBrief,
      },
      {
        id: 'representative',
        label: messages.intakeSuccessRepresentative,
        levers: { reach: 1 },
        brief: messages.intakeSuccessRepresentativeBrief,
      },
      {
        id: 'depth',
        label: messages.intakeSuccessDepth,
        // Depth: fewer, richer contributions.
        levers: { reach: 2 },
        brief: messages.intakeSuccessDepthBrief,
      },
      {
        id: 'decision',
        label: messages.intakeSuccessDecision,
        // Decision-readiness isn't a reach trade-off; the brief carries it.
        brief: messages.intakeSuccessDecisionBrief,
      },
    ],
    detailPlaceholder: messages.intakeSuccessDetailPlaceholder,
    detailBrief: messages.intakeSuccessDetailBrief,
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
