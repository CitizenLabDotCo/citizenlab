import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.Admin.projects.project.tradeoffs.title',
    defaultMessage: 'Trade-off map',
  },
  experimental: {
    id: 'app.containers.Admin.projects.project.tradeoffs.experimental',
    defaultMessage: 'Experimental',
  },
  subtitle: {
    id: 'app.containers.Admin.projects.project.tradeoffs.subtitle',
    defaultMessage:
      'See how position statements combine or conflict, and build a decision that keeps as much support as possible.',
  },
  intro: {
    id: 'app.containers.Admin.projects.project.tradeoffs.intro',
    defaultMessage:
      'Each statement is a cleaned-up position, merged from the inputs in this phase. Two statements are additive when they reinforce each other, exclusive when they cannot both be part of one decision, and neutral otherwise. Relations are suggested by AI and by participants. You confirm them.',
  },
  demoNotice: {
    id: 'app.containers.Admin.projects.project.tradeoffs.demoNotice',
    defaultMessage:
      'Prototype with demo data on "{topic}". The statements shown are not the inputs of this phase.',
  },
  weightBy: {
    id: 'app.containers.Admin.projects.project.tradeoffs.weightBy',
    defaultMessage: 'Weigh support by',
  },
  weightVotes: {
    id: 'app.containers.Admin.projects.project.tradeoffs.weightVotes',
    defaultMessage: 'Votes',
  },
  weightLikes: {
    id: 'app.containers.Admin.projects.project.tradeoffs.weightLikes',
    defaultMessage: 'Likes',
  },
  weightBoth: {
    id: 'app.containers.Admin.projects.project.tradeoffs.weightBoth',
    defaultMessage: 'Votes + likes',
  },
  viewMap: {
    id: 'app.containers.Admin.projects.project.tradeoffs.viewMap',
    defaultMessage: 'Map',
  },
  viewMatrix: {
    id: 'app.containers.Admin.projects.project.tradeoffs.viewMatrix',
    defaultMessage: 'Matrix',
  },
  viewList: {
    id: 'app.containers.Admin.projects.project.tradeoffs.viewList',
    defaultMessage: 'Statements',
  },
  legendExclusive: {
    id: 'app.containers.Admin.projects.project.tradeoffs.legendExclusive',
    defaultMessage: 'Exclusive',
  },
  legendAdditive: {
    id: 'app.containers.Admin.projects.project.tradeoffs.legendAdditive',
    defaultMessage: 'Additive',
  },
  legendUnconfirmed: {
    id: 'app.containers.Admin.projects.project.tradeoffs.legendUnconfirmed',
    defaultMessage: 'Not yet confirmed',
  },
  legendSelected: {
    id: 'app.containers.Admin.projects.project.tradeoffs.legendSelected',
    defaultMessage: 'In package',
  },
  legendBlocked: {
    id: 'app.containers.Admin.projects.project.tradeoffs.legendBlocked',
    defaultMessage: 'Blocked by package',
  },
  legendSize: {
    id: 'app.containers.Admin.projects.project.tradeoffs.legendSize',
    defaultMessage: 'Circle size = weighted support',
  },
  mapHint: {
    id: 'app.containers.Admin.projects.project.tradeoffs.mapHint',
    defaultMessage:
      'Click a statement to add it to the decision package. Click a line to review the relation between two statements.',
  },
  matrixHint: {
    id: 'app.containers.Admin.projects.project.tradeoffs.matrixHint',
    defaultMessage:
      'Rows and columns are statements. Click a cell to review the relation between the two.',
  },
  decisionPackage: {
    id: 'app.containers.Admin.projects.project.tradeoffs.decisionPackage',
    defaultMessage: 'Decision package',
  },
  coverageLabel: {
    id: 'app.containers.Admin.projects.project.tradeoffs.coverageLabel',
    defaultMessage: 'of weighted support kept',
  },
  statementsCount: {
    id: 'app.containers.Admin.projects.project.tradeoffs.statementsCount',
    defaultMessage:
      '{count, plural, =0 {No statements} one {# statement} other {# statements}}',
  },
  synergiesCount: {
    id: 'app.containers.Admin.projects.project.tradeoffs.synergiesCount',
    defaultMessage:
      '{count, plural, =0 {No synergies} one {# synergy} other {# synergies}}',
  },
  conflictsCount: {
    id: 'app.containers.Admin.projects.project.tradeoffs.conflictsCount',
    defaultMessage:
      '{count, plural, =0 {No conflicts} one {# conflict} other {# conflicts}}',
  },
  emptyPackage: {
    id: 'app.containers.Admin.projects.project.tradeoffs.emptyPackage',
    defaultMessage:
      'Your package is empty. Click statements on the map, or start from a suggested package.',
  },
  remove: {
    id: 'app.containers.Admin.projects.project.tradeoffs.remove',
    defaultMessage: 'Remove',
  },
  blockedHeading: {
    id: 'app.containers.Admin.projects.project.tradeoffs.blockedHeading',
    defaultMessage: 'Left out because of your choices',
  },
  blockedBy: {
    id: 'app.containers.Admin.projects.project.tradeoffs.blockedBy',
    defaultMessage: 'Blocked by {labels}',
  },
  completePackage: {
    id: 'app.containers.Admin.projects.project.tradeoffs.completePackage',
    defaultMessage: 'Complete package',
  },
  completeTooltip: {
    id: 'app.containers.Admin.projects.project.tradeoffs.completeTooltip',
    defaultMessage:
      'Keep what you chose and add the best compatible statements.',
  },
  clear: {
    id: 'app.containers.Admin.projects.project.tradeoffs.clear',
    defaultMessage: 'Clear',
  },
  suggestionsHeading: {
    id: 'app.containers.Admin.projects.project.tradeoffs.suggestionsHeading',
    defaultMessage: 'Suggested packages',
  },
  suggestionsDescription: {
    id: 'app.containers.Admin.projects.project.tradeoffs.suggestionsDescription',
    defaultMessage:
      'Packages without conflicts, ranked by weighted support plus synergies. They differ on purpose, so you see the real choices.',
  },
  option: {
    id: 'app.containers.Admin.projects.project.tradeoffs.option',
    defaultMessage: 'Option {letter}',
  },
  useSuggestion: {
    id: 'app.containers.Admin.projects.project.tradeoffs.useSuggestion',
    defaultMessage: 'Use',
  },
  currentSuggestion: {
    id: 'app.containers.Admin.projects.project.tradeoffs.currentSuggestion',
    defaultMessage: 'Current',
  },
  naiveComparison: {
    id: 'app.containers.Admin.projects.project.tradeoffs.naiveComparison',
    defaultMessage:
      'For comparison: the {count} most supported statements on their own contain {conflicts, plural, one {# conflict} other {# conflicts}}.',
  },
  draftHeading: {
    id: 'app.containers.Admin.projects.project.tradeoffs.draftHeading',
    defaultMessage: 'Recommendation draft',
  },
  draftIncluded: {
    id: 'app.containers.Admin.projects.project.tradeoffs.draftIncluded',
    defaultMessage: 'Included',
  },
  draftLeftOut: {
    id: 'app.containers.Admin.projects.project.tradeoffs.draftLeftOut',
    defaultMessage: 'Left out',
  },
  draftConflictsWith: {
    id: 'app.containers.Admin.projects.project.tradeoffs.draftConflictsWith',
    defaultMessage: 'conflicts with {labels}',
  },
  draftCoverage: {
    id: 'app.containers.Admin.projects.project.tradeoffs.draftCoverage',
    defaultMessage:
      'This package keeps {percent}% of the weighted support ({support} of {total}).',
  },
  copyDraft: {
    id: 'app.containers.Admin.projects.project.tradeoffs.copyDraft',
    defaultMessage: 'Copy',
  },
  copied: {
    id: 'app.containers.Admin.projects.project.tradeoffs.copied',
    defaultMessage: 'Copied',
  },
  reviewQueue: {
    id: 'app.containers.Admin.projects.project.tradeoffs.reviewQueue',
    defaultMessage: 'Relations to review',
  },
  reviewQueueDescription: {
    id: 'app.containers.Admin.projects.project.tradeoffs.reviewQueueDescription',
    defaultMessage:
      'AI suggestions that are not confirmed yet. The least certain ones, and the ones where participants disagree with the AI, come first.',
  },
  reviewQueueEmpty: {
    id: 'app.containers.Admin.projects.project.tradeoffs.reviewQueueEmpty',
    defaultMessage: 'Every relation is confirmed.',
  },
  review: {
    id: 'app.containers.Admin.projects.project.tradeoffs.review',
    defaultMessage: 'Review',
  },
  participantsDisagree: {
    id: 'app.containers.Admin.projects.project.tradeoffs.participantsDisagree',
    defaultMessage: 'Participants disagree',
  },
  relationHeading: {
    id: 'app.containers.Admin.projects.project.tradeoffs.relationHeading',
    defaultMessage: 'Relation between {a} and {b}',
  },
  kindExclusive: {
    id: 'app.containers.Admin.projects.project.tradeoffs.kindExclusive',
    defaultMessage: 'Exclusive',
  },
  kindAdditive: {
    id: 'app.containers.Admin.projects.project.tradeoffs.kindAdditive',
    defaultMessage: 'Additive',
  },
  kindNeutral: {
    id: 'app.containers.Admin.projects.project.tradeoffs.kindNeutral',
    defaultMessage: 'Neutral',
  },
  kindExclusiveHelp: {
    id: 'app.containers.Admin.projects.project.tradeoffs.kindExclusiveHelp',
    defaultMessage: 'Cannot both be part of one decision.',
  },
  kindAdditiveHelp: {
    id: 'app.containers.Admin.projects.project.tradeoffs.kindAdditiveHelp',
    defaultMessage: 'Reinforce each other when combined.',
  },
  kindNeutralHelp: {
    id: 'app.containers.Admin.projects.project.tradeoffs.kindNeutralHelp',
    defaultMessage: 'Independent of each other.',
  },
  confidence: {
    id: 'app.containers.Admin.projects.project.tradeoffs.confidence',
    defaultMessage: '{percent}% confidence',
  },
  sourceAi: {
    id: 'app.containers.Admin.projects.project.tradeoffs.sourceAi',
    defaultMessage: 'AI suggestion',
  },
  sourceAdmin: {
    id: 'app.containers.Admin.projects.project.tradeoffs.sourceAdmin',
    defaultMessage: 'Set by moderator',
  },
  sourceParticipants: {
    id: 'app.containers.Admin.projects.project.tradeoffs.sourceParticipants',
    defaultMessage: 'From participants',
  },
  noRelation: {
    id: 'app.containers.Admin.projects.project.tradeoffs.noRelation',
    defaultMessage: 'No relation recorded. Treated as neutral.',
  },
  confirmed: {
    id: 'app.containers.Admin.projects.project.tradeoffs.confirmed',
    defaultMessage: 'Confirmed',
  },
  confirmRelation: {
    id: 'app.containers.Admin.projects.project.tradeoffs.confirmRelation',
    defaultMessage: 'Confirm as {kind}',
  },
  participantVotesHeading: {
    id: 'app.containers.Admin.projects.project.tradeoffs.participantVotesHeading',
    defaultMessage: 'Participants said ({count} pairwise votes)',
  },
  noParticipantVotes: {
    id: 'app.containers.Admin.projects.project.tradeoffs.noParticipantVotes',
    defaultMessage: 'Participants have not weighed in on this pair yet.',
  },
  close: {
    id: 'app.containers.Admin.projects.project.tradeoffs.close',
    defaultMessage: 'Close',
  },
  columnStatement: {
    id: 'app.containers.Admin.projects.project.tradeoffs.columnStatement',
    defaultMessage: 'Statement',
  },
  columnVotes: {
    id: 'app.containers.Admin.projects.project.tradeoffs.columnVotes',
    defaultMessage: 'Votes',
  },
  columnLikes: {
    id: 'app.containers.Admin.projects.project.tradeoffs.columnLikes',
    defaultMessage: 'Likes',
  },
  columnWeight: {
    id: 'app.containers.Admin.projects.project.tradeoffs.columnWeight',
    defaultMessage: 'Weight',
  },
  columnRelations: {
    id: 'app.containers.Admin.projects.project.tradeoffs.columnRelations',
    defaultMessage: 'Relations',
  },
  columnEffect: {
    id: 'app.containers.Admin.projects.project.tradeoffs.columnEffect',
    defaultMessage: 'Effect on package',
  },
  inPackage: {
    id: 'app.containers.Admin.projects.project.tradeoffs.inPackage',
    defaultMessage: 'In package',
  },
  add: {
    id: 'app.containers.Admin.projects.project.tradeoffs.add',
    defaultMessage: 'Add',
  },
  mergedFrom: {
    id: 'app.containers.Admin.projects.project.tradeoffs.mergedFrom',
    defaultMessage: 'Merged from {count} inputs',
  },
  effectReplaces: {
    id: 'app.containers.Admin.projects.project.tradeoffs.effectReplaces',
    defaultMessage: 'replaces {labels}',
  },
  exclusiveWith: {
    id: 'app.containers.Admin.projects.project.tradeoffs.exclusiveWith',
    defaultMessage: '{count, plural, one {# exclusive} other {# exclusive}}',
  },
  additiveWith: {
    id: 'app.containers.Admin.projects.project.tradeoffs.additiveWith',
    defaultMessage: '{count, plural, one {# additive} other {# additive}}',
  },
});
