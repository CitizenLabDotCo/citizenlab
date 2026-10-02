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
  intakeOutcomeAsk: {
    id: `${scope}.intakeOutcomeAsk`,
    defaultMessage: 'When this wraps up, what do you want to walk away with?',
  },
  intakeOutcomeUnderstand: {
    id: `${scope}.intakeOutcomeUnderstand`,
    defaultMessage: 'A clear read on what people think',
  },
  intakeOutcomeUnderstandBrief: {
    id: `${scope}.intakeOutcomeUnderstandBrief`,
    defaultMessage:
      'The main goal is to understand what people think — we’re still exploring.',
  },
  intakeOutcomeInform: {
    id: `${scope}.intakeOutcomeInform`,
    defaultMessage: 'Input that feeds a decision we’ll make',
  },
  intakeOutcomeInformBrief: {
    id: `${scope}.intakeOutcomeInformBrief`,
    defaultMessage: 'We’ll fold the input into a decision we make.',
  },
  intakeOutcomeDecide: {
    id: `${scope}.intakeOutcomeDecide`,
    defaultMessage: 'A choice or priorities set by residents',
  },
  intakeOutcomeDecideBrief: {
    id: `${scope}.intakeOutcomeDecideBrief`,
    defaultMessage: 'Residents should directly shape the decision or set priorities.',
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
