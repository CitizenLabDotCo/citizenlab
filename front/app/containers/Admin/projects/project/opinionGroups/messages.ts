import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.Admin.projects.project.opinionGroups.title',
    defaultMessage: 'Opinion groups',
  },
  subtitle: {
    id: 'app.containers.Admin.projects.project.opinionGroups.subtitle',
    defaultMessage:
      'Participants are grouped by how similarly they reacted to the inputs of this phase. Each dot is one participant; participants that reacted alike are close together.',
  },
  loading: {
    id: 'app.containers.Admin.projects.project.opinionGroups.loading',
    defaultMessage: 'Computing opinion groups. This can take a few seconds.',
  },
  error: {
    id: 'app.containers.Admin.projects.project.opinionGroups.error',
    defaultMessage: 'The opinion groups could not be computed.',
  },
  notEnoughData: {
    id: 'app.containers.Admin.projects.project.opinionGroups.notEnoughData',
    defaultMessage:
      'There are not enough reactions yet to find opinion groups. Lower the minimum number of reactions per participant, or come back when more people have participated.',
  },
  numberOfGroups: {
    id: 'app.containers.Admin.projects.project.opinionGroups.numberOfGroups',
    defaultMessage: 'Number of groups',
  },
  automatic: {
    id: 'app.containers.Admin.projects.project.opinionGroups.automatic',
    defaultMessage: 'Automatic',
  },
  minVotesPerParticipant: {
    id: 'app.containers.Admin.projects.project.opinionGroups.minVotesPerParticipant',
    defaultMessage: 'Min. reactions per participant',
  },
  colorBy: {
    id: 'app.containers.Admin.projects.project.opinionGroups.colorBy',
    defaultMessage: 'Colour dots by',
  },
  opinionGroup: {
    id: 'app.containers.Admin.projects.project.opinionGroups.opinionGroup',
    defaultMessage: 'Opinion group',
  },
  useDemographics: {
    id: 'app.containers.Admin.projects.project.opinionGroups.useDemographics',
    defaultMessage: 'Use demographics when grouping',
  },
  useDemographicsTooltip: {
    id: 'app.containers.Admin.projects.project.opinionGroups.useDemographicsTooltip',
    defaultMessage:
      'Adds the registration fields (for example age and gender) as extra features next to the reactions. Groups then also reflect who the participants are, not only how they reacted.',
  },
  demographicWeight: {
    id: 'app.containers.Admin.projects.project.opinionGroups.demographicWeight',
    defaultMessage: 'Demographic weight',
  },
  demographicWeightLow: {
    id: 'app.containers.Admin.projects.project.opinionGroups.demographicWeightLow',
    defaultMessage: 'Low',
  },
  demographicWeightMedium: {
    id: 'app.containers.Admin.projects.project.opinionGroups.demographicWeightMedium',
    defaultMessage: 'Medium',
  },
  demographicWeightHigh: {
    id: 'app.containers.Admin.projects.project.opinionGroups.demographicWeightHigh',
    defaultMessage: 'High',
  },
  participants: {
    id: 'app.containers.Admin.projects.project.opinionGroups.participants',
    defaultMessage: 'Participants',
  },
  participantsDetail: {
    id: 'app.containers.Admin.projects.project.opinionGroups.participantsDetail',
    defaultMessage: '{included} of {total} reacted often enough',
  },
  statements: {
    id: 'app.containers.Admin.projects.project.opinionGroups.statements',
    defaultMessage: 'Inputs',
  },
  statementsDetail: {
    id: 'app.containers.Admin.projects.project.opinionGroups.statementsDetail',
    defaultMessage: '{included} of {total} with enough reactions',
  },
  reactions: {
    id: 'app.containers.Admin.projects.project.opinionGroups.reactions',
    defaultMessage: 'Reactions',
  },
  reactionsDetail: {
    id: 'app.containers.Admin.projects.project.opinionGroups.reactionsDetail',
    defaultMessage: '{included} of {total} used',
  },
  groups: {
    id: 'app.containers.Admin.projects.project.opinionGroups.groups',
    defaultMessage: 'Groups',
  },
  groupsDetail: {
    id: 'app.containers.Admin.projects.project.opinionGroups.groupsDetail',
    defaultMessage: 'Separation score {silhouette}',
  },
  groupsDetailTooltip: {
    id: 'app.containers.Admin.projects.project.opinionGroups.groupsDetailTooltip',
    defaultMessage:
      'Silhouette score between -1 and 1. Values above 0.5 mean the groups are clearly separated; values near 0 mean the groups overlap and the split is weak.',
  },
  mapTitle: {
    id: 'app.containers.Admin.projects.project.opinionGroups.mapTitle',
    defaultMessage: 'Opinion map',
  },
  mapHint: {
    id: 'app.containers.Admin.projects.project.opinionGroups.mapHint',
    defaultMessage:
      'The axes have no unit. They are the two directions in which reactions differ the most. Hover a dot for details.',
  },
  axisHorizontal: {
    id: 'app.containers.Admin.projects.project.opinionGroups.axisHorizontal',
    defaultMessage: 'Left to right',
  },
  axisVertical: {
    id: 'app.containers.Admin.projects.project.opinionGroups.axisVertical',
    defaultMessage: 'Bottom to top',
  },
  axisExplanation: {
    id: 'app.containers.Admin.projects.project.opinionGroups.axisExplanation',
    defaultMessage: 'explains {percentage} of the differences',
  },
  axisPositive: {
    id: 'app.containers.Admin.projects.project.opinionGroups.axisPositive',
    defaultMessage: 'Further along: more agreement with',
  },
  axisNegative: {
    id: 'app.containers.Admin.projects.project.opinionGroups.axisNegative',
    defaultMessage: 'Further back: more agreement with',
  },
  axisDemographics: {
    id: 'app.containers.Admin.projects.project.opinionGroups.axisDemographics',
    defaultMessage: 'Related demographics',
  },
  unknown: {
    id: 'app.containers.Admin.projects.project.opinionGroups.unknown',
    defaultMessage: 'Unknown',
  },
  hiddenSmallGroup: {
    id: 'app.containers.Admin.projects.project.opinionGroups.hiddenSmallGroup',
    defaultMessage: 'Hidden (fewer than {threshold})',
  },
  groupName: {
    id: 'app.containers.Admin.projects.project.opinionGroups.groupName',
    defaultMessage: 'Group {name}',
  },
  groupSize: {
    id: 'app.containers.Admin.projects.project.opinionGroups.groupSize',
    defaultMessage: '{count} participants ({share})',
  },
  whatSetsApart: {
    id: 'app.containers.Admin.projects.project.opinionGroups.whatSetsApart',
    defaultMessage: 'What sets this group apart',
  },
  agrees: {
    id: 'app.containers.Admin.projects.project.opinionGroups.agrees',
    defaultMessage: 'Agrees',
  },
  disagrees: {
    id: 'app.containers.Admin.projects.project.opinionGroups.disagrees',
    defaultMessage: 'Disagrees',
  },
  insideVersusOutside: {
    id: 'app.containers.Admin.projects.project.opinionGroups.insideVersusOutside',
    defaultMessage: '{inside} in this group vs. {outside} in other groups',
  },
  noRepresentative: {
    id: 'app.containers.Admin.projects.project.opinionGroups.noRepresentative',
    defaultMessage: 'No input sets this group apart clearly.',
  },
  whoIsInGroup: {
    id: 'app.containers.Admin.projects.project.opinionGroups.whoIsInGroup',
    defaultMessage: 'Who is in this group',
  },
  overRepresented: {
    id: 'app.containers.Admin.projects.project.opinionGroups.overRepresented',
    defaultMessage: '{category}: {index}x more than average',
  },
  underRepresented: {
    id: 'app.containers.Admin.projects.project.opinionGroups.underRepresented',
    defaultMessage: '{category}: {index}x less than average',
  },
  absentInGroup: {
    id: 'app.containers.Admin.projects.project.opinionGroups.absentInGroup',
    defaultMessage: '{category}: nobody in this group',
  },
  balancedGroup: {
    id: 'app.containers.Admin.projects.project.opinionGroups.balancedGroup',
    defaultMessage: 'The demographics of this group are close to the average.',
  },
  privacyNote: {
    id: 'app.containers.Admin.projects.project.opinionGroups.privacyNote',
    defaultMessage:
      'To protect privacy, demographic categories with fewer than {threshold} participants are hidden, and no participant can be identified from the map.',
  },
  consensusTitle: {
    id: 'app.containers.Admin.projects.project.opinionGroups.consensusTitle',
    defaultMessage: 'Common ground across groups',
  },
  consensusSubtitle: {
    id: 'app.containers.Admin.projects.project.opinionGroups.consensusSubtitle',
    defaultMessage:
      'Inputs where every group leans the same way. The bars show the share of each group that agrees.',
  },
  noConsensus: {
    id: 'app.containers.Admin.projects.project.opinionGroups.noConsensus',
    defaultMessage: 'No input has a clear majority in every group yet.',
  },
  divisiveTitle: {
    id: 'app.containers.Admin.projects.project.opinionGroups.divisiveTitle',
    defaultMessage: 'Most divisive inputs',
  },
  divisiveSubtitle: {
    id: 'app.containers.Admin.projects.project.opinionGroups.divisiveSubtitle',
    defaultMessage:
      'Inputs where the groups disagree the most with each other. Good candidates for a deliberation round.',
  },
  noDivisive: {
    id: 'app.containers.Admin.projects.project.opinionGroups.noDivisive',
    defaultMessage: 'The groups do not disagree strongly on any input.',
  },
  allGroupsAgree: {
    id: 'app.containers.Admin.projects.project.opinionGroups.allGroupsAgree',
    defaultMessage: 'All groups agree',
  },
  allGroupsDisagree: {
    id: 'app.containers.Admin.projects.project.opinionGroups.allGroupsDisagree',
    defaultMessage: 'All groups disagree',
  },
  spread: {
    id: 'app.containers.Admin.projects.project.opinionGroups.spread',
    defaultMessage: '{spread} gap',
  },
  allStatementsTitle: {
    id: 'app.containers.Admin.projects.project.opinionGroups.allStatementsTitle',
    defaultMessage: 'All inputs by group',
  },
  showTable: {
    id: 'app.containers.Admin.projects.project.opinionGroups.showTable',
    defaultMessage: 'Show table',
  },
  hideTable: {
    id: 'app.containers.Admin.projects.project.opinionGroups.hideTable',
    defaultMessage: 'Hide table',
  },
  input: {
    id: 'app.containers.Admin.projects.project.opinionGroups.input',
    defaultMessage: 'Input',
  },
  agreeShare: {
    id: 'app.containers.Admin.projects.project.opinionGroups.agreeShare',
    defaultMessage: '% agree',
  },
  totalReactions: {
    id: 'app.containers.Admin.projects.project.opinionGroups.totalReactions',
    defaultMessage: 'Reactions (like / dislike / neutral)',
  },
  tooFewVotes: {
    id: 'app.containers.Admin.projects.project.opinionGroups.tooFewVotes',
    defaultMessage: 'n/a',
  },
  balanceTitle: {
    id: 'app.containers.Admin.projects.project.opinionGroups.balanceTitle',
    defaultMessage: 'Who took part',
  },
  balanceSubtitle: {
    id: 'app.containers.Admin.projects.project.opinionGroups.balanceSubtitle',
    defaultMessage:
      'The people who reacted in this phase, compared with all registered users of the platform. Large gaps mean some groups are under- or over-represented in the result.',
  },
  category: {
    id: 'app.containers.Admin.projects.project.opinionGroups.category',
    defaultMessage: 'Category',
  },
  voters: {
    id: 'app.containers.Admin.projects.project.opinionGroups.voters',
    defaultMessage: 'Reacted in this phase',
  },
  population: {
    id: 'app.containers.Admin.projects.project.opinionGroups.population',
    defaultMessage: 'All registered users',
  },
  representation: {
    id: 'app.containers.Admin.projects.project.opinionGroups.representation',
    defaultMessage: 'Representation',
  },
  underRepresentedLabel: {
    id: 'app.containers.Admin.projects.project.opinionGroups.underRepresentedLabel',
    defaultMessage: 'Under-represented',
  },
  overRepresentedLabel: {
    id: 'app.containers.Admin.projects.project.opinionGroups.overRepresentedLabel',
    defaultMessage: 'Over-represented',
  },
  balancedLabel: {
    id: 'app.containers.Admin.projects.project.opinionGroups.balancedLabel',
    defaultMessage: 'Balanced',
  },
  noDemographics: {
    id: 'app.containers.Admin.projects.project.opinionGroups.noDemographics',
    defaultMessage:
      'No demographic registration fields are enabled on this platform, so the groups cannot be compared by demographics.',
  },
  tooltipVotes: {
    id: 'app.containers.Admin.projects.project.opinionGroups.tooltipVotes',
    defaultMessage: '{count} reactions',
  },
  candidateGroups: {
    id: 'app.containers.Admin.projects.project.opinionGroups.candidateGroups',
    defaultMessage: 'Separation score per number of groups: {scores}',
  },
});
