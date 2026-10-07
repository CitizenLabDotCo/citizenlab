import { defineMessages } from 'react-intl';

const scope =
  'app.containers.Admin.projects.project.backofficeRedesign.ProjectAssistant';

export default defineMessages({
  title: {
    id: `${scope}.title`,
    defaultMessage: 'Project assistant',
  },
  intro: {
    id: `${scope}.introV2`,
    defaultMessage:
      'Tell me what you want to achieve and I’ll draft the whole project for you — page, phases and a survey, ready to review. Every draft is grounded in local best practice and ten years of data on what actually drives participation.',
  },
  tagline: {
    id: `${scope}.tagline`,
    defaultMessage: 'Drafts the whole project from a brief',
  },
  placeholder: {
    id: `${scope}.placeholderV2`,
    defaultMessage:
      'Describe what you want to achieve — a paragraph is perfect. Or drop a brief or memo and I’ll read it.',
  },
  draftButton: {
    id: `${scope}.draftButton`,
    defaultMessage: 'Draft my project',
  },
  attachFile: {
    id: `${scope}.attachFile`,
    defaultMessage: 'Attach a document',
  },
  removeFile: {
    id: `${scope}.removeFile`,
    defaultMessage: 'Remove {fileName}',
  },
  dropFiles: {
    id: `${scope}.dropFiles`,
    defaultMessage: 'Drop your document here',
  },
  filesHint: {
    id: `${scope}.filesHint`,
    defaultMessage:
      'PDF, Markdown or text, up to {maxFiles}. I read them to ground the draft.',
  },
  leversHeading: {
    id: `${scope}.leversHeading`,
    defaultMessage: 'A few choices to shape it',
  },
  leversHelper: {
    id: `${scope}.leversHelper`,
    defaultMessage:
      'Set to sensible defaults from best practice — nudge any that matter to you.',
  },
  leversTeaser: {
    id: `${scope}.leversTeaser`,
    defaultMessage:
      'Add a brief above and I’ll ask a couple of quick questions to shape the draft.',
  },
  intakeLead: {
    id: `${scope}.intakeLead`,
    defaultMessage:
      'Got it. A couple of quick questions and I’ll draft — tap an answer, or just hit draft whenever you’re ready.',
  },
  intakeSkip: {
    id: `${scope}.intakeSkip`,
    defaultMessage: 'Skip',
  },
  intakeDetailAdd: {
    id: `${scope}.intakeDetailAdd`,
    defaultMessage: 'Add a detail (optional)',
  },
  intakeAdvancedToggle: {
    id: `${scope}.intakeAdvancedToggle`,
    defaultMessage: 'Fine-tune the setup',
  },
  intakeAdvancedHelper: {
    id: `${scope}.intakeAdvancedHelper`,
    defaultMessage:
      'Your answers set these already — nudge any dial if you want more control.',
  },
  // The decision-making stage question — the GSM framing from the intake skill
  // (Problem / Solution / Decision / Implementation). It's the highest-signal
  // input: it maps straight to the archetype the engine drafts. The example in
  // each label follows one town-centre regeneration through the funnel.
  intakeStageAsk: {
    id: `${scope}.intakeStageAsk`,
    defaultMessage: 'Where are you in the decision on this?',
  },
  intakeStageProblem: {
    id: `${scope}.intakeStageProblem`,
    defaultMessage: 'Understanding a problem or opportunity',
  },
  intakeStageProblemBrief: {
    id: `${scope}.intakeStageProblemBrief`,
    defaultMessage:
      'Decision-making stage: Problem — we want to understand a problem or opportunity in the community before anything is decided (e.g. why the town centre is losing footfall and what residents need from it).',
  },
  intakeStageSolution: {
    id: `${scope}.intakeStageSolution`,
    defaultMessage: 'Finding solutions to a clear problem',
  },
  intakeStageSolutionBrief: {
    id: `${scope}.intakeStageSolutionBrief`,
    defaultMessage:
      'Decision-making stage: Solution — the problem is clear and we want to gather ideas for what to do about it (e.g. what a revitalised high street could include).',
  },
  intakeStageDecision: {
    id: `${scope}.intakeStageDecision`,
    defaultMessage: 'Choosing between options we’ve developed',
  },
  intakeStageDecisionBrief: {
    id: `${scope}.intakeStageDecisionBrief`,
    defaultMessage:
      'Decision-making stage: Decision — we have options developed and want residents to help choose between them (e.g. choosing between two masterplans for the market square).',
  },
  intakeStageImplementation: {
    id: `${scope}.intakeStageImplementation`,
    defaultMessage: 'Rolling out a decision well',
  },
  intakeStageImplementationBrief: {
    id: `${scope}.intakeStageImplementationBrief`,
    defaultMessage:
      'Decision-making stage: Implementation — the decision is made and we’re working out how to roll it out well (e.g. how to phase the works while keeping the square usable).',
  },
  intakeAudienceAsk: {
    id: `${scope}.intakeAudienceAsk`,
    defaultMessage: 'Who do you most want to hear from?',
  },
  intakeAudienceAnyone: {
    id: `${scope}.intakeAudienceAnyone`,
    defaultMessage: 'Anyone in the community',
  },
  intakeAudienceAnyoneBrief: {
    id: `${scope}.intakeAudienceAnyoneBrief`,
    defaultMessage: 'Open to anyone in the community.',
  },
  intakeAudienceResidents: {
    id: `${scope}.intakeAudienceResidents`,
    defaultMessage: 'Residents of our area',
  },
  intakeAudienceResidentsBrief: {
    id: `${scope}.intakeAudienceResidentsBrief`,
    defaultMessage: 'Aimed at residents of our area.',
  },
  intakeAudienceInvited: {
    id: `${scope}.intakeAudienceInvited`,
    defaultMessage: 'A specific group we’ll invite',
  },
  intakeAudienceInvitedBrief: {
    id: `${scope}.intakeAudienceInvitedBrief`,
    defaultMessage: 'Aimed at a specific group we’ll invite.',
  },
  intakeAudienceDetailPlaceholder: {
    id: `${scope}.intakeAudienceDetailPlaceholder`,
    defaultMessage: 'Anyone in particular? e.g. parents, cyclists, a neighbourhood',
  },
  intakeAudienceDetailBrief: {
    id: `${scope}.intakeAudienceDetailBrief`,
    defaultMessage: 'We especially want to reach: {detail}.',
  },
  intakeTimingAsk: {
    id: `${scope}.intakeTimingAsk`,
    defaultMessage: 'Last one — are you working towards a date?',
  },
  intakeTimingNone: {
    id: `${scope}.intakeTimingNone`,
    defaultMessage: 'No fixed deadline',
  },
  intakeTimingNoneBrief: {
    id: `${scope}.intakeTimingNoneBrief`,
    defaultMessage: 'No fixed deadline.',
  },
  intakeTimingWeeks: {
    id: `${scope}.intakeTimingWeeks`,
    defaultMessage: 'Within a few weeks',
  },
  intakeTimingWeeksBrief: {
    id: `${scope}.intakeTimingWeeksBrief`,
    defaultMessage: 'We’d like to wrap up within a few weeks.',
  },
  intakeTimingMonths: {
    id: `${scope}.intakeTimingMonths`,
    defaultMessage: 'A couple of months',
  },
  intakeTimingMonthsBrief: {
    id: `${scope}.intakeTimingMonthsBrief`,
    defaultMessage: 'We have a couple of months to run this.',
  },
  intakeTimingDetailPlaceholder: {
    id: `${scope}.intakeTimingDetailPlaceholder`,
    defaultMessage: 'A specific date or milestone? e.g. the March budget vote',
  },
  intakeTimingDetailBrief: {
    id: `${scope}.intakeTimingDetailBrief`,
    defaultMessage: 'Timed around: {detail}.',
  },
  // Closing the loop — what residents hear back + when. Feeds the
  // closes_the_loop rubric dimension directly (intake skill Q11).
  intakeClosingAsk: {
    id: `${scope}.intakeClosingAsk`,
    defaultMessage: 'When this closes, what will residents hear back?',
  },
  intakeClosingSummary: {
    id: `${scope}.intakeClosingSummary`,
    defaultMessage: 'A summary of what we heard',
  },
  intakeClosingSummaryBrief: {
    id: `${scope}.intakeClosingSummaryBrief`,
    defaultMessage:
      'When it closes, residents will hear back a summary of what the community said.',
  },
  intakeClosingShaped: {
    id: `${scope}.intakeClosingShaped`,
    defaultMessage: 'How their input shaped the decision',
  },
  intakeClosingShapedBrief: {
    id: `${scope}.intakeClosingShapedBrief`,
    defaultMessage:
      'When it closes, we’ll show residents how their input shaped the decision.',
  },
  intakeClosingDecision: {
    id: `${scope}.intakeClosingDecision`,
    defaultMessage: 'The final decision and the reasoning',
  },
  intakeClosingDecisionBrief: {
    id: `${scope}.intakeClosingDecisionBrief`,
    defaultMessage:
      'When it closes, we’ll share the final decision and the reasoning behind it.',
  },
  intakeClosingDetailPlaceholder: {
    id: `${scope}.intakeClosingDetailPlaceholder`,
    defaultMessage: 'By when? e.g. within 2 weeks of close, at the June council meeting',
  },
  intakeClosingDetailBrief: {
    id: `${scope}.intakeClosingDetailBrief`,
    defaultMessage: 'Feedback timing: {detail}.',
  },
  // Tone — the prompt already branches on tone; this gives it a signal.
  intakeToneAsk: {
    id: `${scope}.intakeToneAsk`,
    defaultMessage: 'What tone should the draft strike?',
  },
  intakeToneWarm: {
    id: `${scope}.intakeToneWarm`,
    defaultMessage: 'Warm and community',
  },
  intakeToneWarmBrief: {
    id: `${scope}.intakeToneWarmBrief`,
    defaultMessage: 'Tone: warm and community-minded.',
  },
  intakeToneNeutral: {
    id: `${scope}.intakeToneNeutral`,
    defaultMessage: 'Neutral and factual',
  },
  intakeToneNeutralBrief: {
    id: `${scope}.intakeToneNeutralBrief`,
    defaultMessage: 'Tone: neutral and factual.',
  },
  intakeToneFormal: {
    id: `${scope}.intakeToneFormal`,
    defaultMessage: 'Formal and institutional',
  },
  intakeToneFormalBrief: {
    id: `${scope}.intakeToneFormalBrief`,
    defaultMessage: 'Tone: formal and institutional — no emoji.',
  },
  // Audience distinctiveness — what makes the draft name THIS community
  // (intake skill Q7).
  intakeDistinctAsk: {
    id: `${scope}.intakeDistinctAsk`,
    defaultMessage: 'Anything distinctive about this community to reflect?',
  },
  intakeDistinctPlace: {
    id: `${scope}.intakeDistinctPlace`,
    defaultMessage: 'A specific place or area',
  },
  intakeDistinctPlaceBrief: {
    id: `${scope}.intakeDistinctPlaceBrief`,
    defaultMessage:
      'This centres on a specific place or neighbourhood — name it where possible.',
  },
  intakeDistinctMultilingual: {
    id: `${scope}.intakeDistinctMultilingual`,
    defaultMessage: 'A multilingual community',
  },
  intakeDistinctMultilingualBrief: {
    id: `${scope}.intakeDistinctMultilingualBrief`,
    defaultMessage: 'The community is multilingual — keep the language simple and plain.',
  },
  intakeDistinctSensitive: {
    id: `${scope}.intakeDistinctSensitive`,
    defaultMessage: 'Sensitive or low trust',
  },
  intakeDistinctSensitiveBrief: {
    id: `${scope}.intakeDistinctSensitiveBrief`,
    defaultMessage:
      'There’s sensitivity or low trust here — be especially transparent and acknowledge past friction.',
  },
  intakeDistinctNone: {
    id: `${scope}.intakeDistinctNone`,
    defaultMessage: 'Nothing in particular',
  },
  intakeDistinctNoneBrief: {
    id: `${scope}.intakeDistinctNoneBrief`,
    defaultMessage: '',
  },
  intakeDistinctDetailPlaceholder: {
    id: `${scope}.intakeDistinctDetailPlaceholder`,
    defaultMessage: 'Local specifics — landmarks, history, who’s affected',
  },
  intakeDistinctDetailBrief: {
    id: `${scope}.intakeDistinctDetailBrief`,
    defaultMessage: 'Local context: {detail}.',
  },
  // Statutory — flags a legally-required consultation, which triggers the
  // backend's statutory overlay (legal minimum duration + formal channel).
  intakeStatutoryAsk: {
    id: `${scope}.intakeStatutoryAsk`,
    defaultMessage: 'Is this a legally required (statutory) consultation?',
  },
  intakeStatutoryNo: {
    id: `${scope}.intakeStatutoryNo`,
    defaultMessage: 'No',
  },
  intakeStatutoryNoBrief: {
    id: `${scope}.intakeStatutoryNoBrief`,
    defaultMessage: '',
  },
  intakeStatutoryYes: {
    id: `${scope}.intakeStatutoryYes`,
    defaultMessage: 'Yes — legally required',
  },
  intakeStatutoryYesBrief: {
    id: `${scope}.intakeStatutoryYesBrief`,
    defaultMessage:
      'This is a statutory / legally-required public consultation — apply the legal minimum duration and a formal input channel.',
  },
  intakeStatutoryDetailPlaceholder: {
    id: `${scope}.intakeStatutoryDetailPlaceholder`,
    defaultMessage: 'Which instrument or legal minimum, if known? e.g. openbaar onderzoek, 6 weeks',
  },
  intakeStatutoryDetailBrief: {
    id: `${scope}.intakeStatutoryDetailBrief`,
    defaultMessage: 'Statutory details: {detail}.',
  },
  leverInfluenceQuestion: {
    id: `${scope}.leverInfluenceQuestion`,
    defaultMessage: 'How much influence will residents have?',
  },
  leverInfluenceGather: {
    id: `${scope}.leverInfluenceGather`,
    defaultMessage: 'We gather input',
  },
  leverInfluenceTogether: {
    id: `${scope}.leverInfluenceTogether`,
    defaultMessage: 'We decide together',
  },
  leverInfluenceResidents: {
    id: `${scope}.leverInfluenceResidents`,
    defaultMessage: 'Residents decide',
  },
  leverHowFixedQuestion: {
    id: `${scope}.leverHowFixedQuestion`,
    defaultMessage: 'How fixed is the plan already?',
  },
  leverHowFixedEarly: {
    id: `${scope}.leverHowFixedEarly`,
    defaultMessage: 'Early exploration',
  },
  leverHowFixedDirection: {
    id: `${scope}.leverHowFixedDirection`,
    defaultMessage: 'A rough direction',
  },
  leverHowFixedDecided: {
    id: `${scope}.leverHowFixedDecided`,
    defaultMessage: 'Mostly decided',
  },
  leverReachQuestion: {
    id: `${scope}.leverReachQuestion`,
    defaultMessage: 'What matters more here?',
  },
  leverReachMany: {
    id: `${scope}.leverReachMany`,
    defaultMessage: 'Many quick voices',
  },
  leverReachBalance: {
    id: `${scope}.leverReachBalance`,
    defaultMessage: 'A balance',
  },
  leverReachDepth: {
    id: `${scope}.leverReachDepth`,
    defaultMessage: 'Fewer, in depth',
  },
  leverFormatQuestion: {
    id: `${scope}.leverFormatQuestion`,
    defaultMessage: 'How should people take part?',
  },
  leverFormatOpen: {
    id: `${scope}.leverFormatOpen`,
    defaultMessage: 'In the open (ideation)',
  },
  leverFormatBalance: {
    id: `${scope}.leverFormatBalance`,
    defaultMessage: 'A balance',
  },
  leverFormatPrivate: {
    id: `${scope}.leverFormatPrivate`,
    defaultMessage: 'Privately (survey)',
  },
  leverAudienceQuestion: {
    id: `${scope}.leverAudienceQuestion`,
    defaultMessage: 'Who is this open to?',
  },
  leverAudienceEveryone: {
    id: `${scope}.leverAudienceEveryone`,
    defaultMessage: 'Everyone',
  },
  leverAudienceResidents: {
    id: `${scope}.leverAudienceResidents`,
    defaultMessage: 'Residents only',
  },
  leverAudienceInvited: {
    id: `${scope}.leverAudienceInvited`,
    defaultMessage: 'An invited group',
  },
  working: {
    id: `${scope}.working`,
    defaultMessage: 'Drafting your project — this can take a minute…',
  },
  elapsed: {
    id: `${scope}.elapsed`,
    defaultMessage: '{seconds}s',
  },
  succeeded: {
    id: `${scope}.succeeded`,
    defaultMessage:
      'Draft ready. Review the page, phases and survey on the left — nothing is published yet.',
  },
  failed: {
    id: `${scope}.failed`,
    defaultMessage: 'I couldn’t finish the draft. You can adjust and try again.',
  },
  errorInProgress: {
    id: `${scope}.errorInProgress`,
    defaultMessage: 'A draft is already being generated for this project.',
  },
  errorAiProcessingNotAllowed: {
    id: `${scope}.errorAiProcessingNotAllowed`,
    defaultMessage:
      'AI processing is turned off for this platform, so I can’t read the attached documents.',
  },
  errorUnsupportedFileType: {
    id: `${scope}.errorUnsupportedFileType`,
    defaultMessage: 'One of the documents is a type I can’t read.',
  },
  errorUpload: {
    id: `${scope}.errorUpload`,
    defaultMessage: 'I couldn’t upload {fileName}. Please try again.',
  },
  errorGeneric: {
    id: `${scope}.errorGeneric`,
    defaultMessage: 'Something went wrong. Please try again.',
  },
  lockedNotDraft: {
    id: `${scope}.lockedNotDraft`,
    defaultMessage:
      'The assistant drafts into a new project. This one is already published.',
  },
});
