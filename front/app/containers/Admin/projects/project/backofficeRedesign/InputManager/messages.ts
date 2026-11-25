import { defineMessages } from 'react-intl';

export default defineMessages({
  removeOne: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.removeOne',
    defaultMessage: 'Remove one',
  },
  addOne: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.addOne',
    defaultMessage: 'Add one',
  },

  importOptions: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.importOptions',
    defaultMessage: 'Import options',
  },

  totalVotesColumn: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.totalVotesColumn',
    defaultMessage: 'Votes',
  },
  onlineColumn: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.onlineColumn',
    defaultMessage: 'Online',
  },
  offlineColumn: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.offlineColumn',
    defaultMessage: 'Offline',
  },

  offlineVotesHelp: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.offlineVotesHelp',
    defaultMessage: 'Add votes collected on paper or in person.',
  },
  offlineParticipants: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.offlineParticipants',
    defaultMessage: 'Offline participants',
  },
  offlineVotesSaveError: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.offlineVotesSaveError',
    defaultMessage: 'The offline votes could not be saved. Please try again.',
  },
  saveOfflineVotes: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.saveOfflineVotes',
    defaultMessage: 'Save offline votes',
  },

  addOfflineVotes: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.addOfflineVotes',
    defaultMessage: 'Add offline votes',
  },
  exportParticipationData: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.exportParticipationData',
    defaultMessage: 'Export participation data.',
  },
  proposalVotes: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.proposalVotes',
    defaultMessage: 'Votes',
  },
  timeLeft: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.timeLeft',
    defaultMessage: 'Time left',
  },
  closed: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.closed',
    defaultMessage: 'Closed',
  },
  daysLeft: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.daysLeft',
    defaultMessage: '{days, plural, one {# day left} other {# days left}}',
  },

  statusColumn: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.statusColumn',
    defaultMessage: 'Status',
  },
  tagsColumn: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.tagsColumn',
    defaultMessage: 'Tags',
  },
  publishedColumn: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.publishedColumn',
    defaultMessage: 'Published',
  },
  repliedMark: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.repliedMark',
    defaultMessage: 'Replied',
  },
  addColumns: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.addColumns',
    defaultMessage: 'Add columns',
  },
  selectAllOnPage: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.selectAllOnPage3',
    defaultMessage: `{inputTerm, select,
      idea {Select all ideas on this page}
      option {Select all options on this page}
      project {Select all projects on this page}
      question {Select all questions on this page}
      issue {Select all issues on this page}
      contribution {Select all contributions on this page}
      proposal {Select all proposals on this page}
      initiative {Select all initiatives on this page}
      petition {Select all petitions on this page}
      comment {Select all comments on this page}
      response {Select all responses on this page}
      suggestion {Select all suggestions on this page}
      topic {Select all topics on this page}
      post {Select all posts on this page}
      story {Select all stories on this page}
      observation {Select all observations on this page}
      other {Select all inputs on this page}
    }`,
  },
  selectTerm: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.selectTerm3',
    defaultMessage: `{inputTerm, select,
      idea {Select this idea}
      option {Select this option}
      project {Select this project}
      question {Select this question}
      issue {Select this issue}
      contribution {Select this contribution}
      proposal {Select this proposal}
      initiative {Select this initiative}
      petition {Select this petition}
      comment {Select this comment}
      response {Select this response}
      suggestion {Select this suggestion}
      topic {Select this topic}
      post {Select this post}
      story {Select this story}
      observation {Select this observation}
      other {Select this input}
    }`,
  },
  unassigned: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.unassigned',
    defaultMessage: 'Unassigned',
  },

  searchTerms: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.searchTerms3',
    defaultMessage: `{inputTerm, select,
      idea {Search ideas}
      option {Search options}
      project {Search projects}
      question {Search questions}
      issue {Search issues}
      contribution {Search contributions}
      proposal {Search proposals}
      initiative {Search initiatives}
      petition {Search petitions}
      comment {Search comments}
      response {Search responses}
      suggestion {Search suggestions}
      topic {Search topics}
      post {Search posts}
      story {Search stories}
      observation {Search observations}
      other {Search inputs}
    }`,
  },
  filter: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.filter',
    defaultMessage: 'Filter',
  },
  filterSource: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.filterSource',
    defaultMessage: 'Source',
  },
  filterStatus: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.filterStatus',
    defaultMessage: 'Status',
  },
  filterAssignee: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.filterAssignee',
    defaultMessage: 'Assignee',
  },
  filterTags: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.filterTags',
    defaultMessage: 'Tags',
  },
  filterReply: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.filterReply',
    defaultMessage: 'Reply',
  },
  filterPhase: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.filterPhase',
    defaultMessage: 'Phase',
  },
  sourceOnline: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.sourceOnline',
    defaultMessage: 'Online',
  },
  sourceImported: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.sourceImported',
    defaultMessage: 'Imported',
  },
  replyAwaiting: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.replyAwaiting',
    defaultMessage: 'Awaiting reply',
  },
  replyReplied: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.replyReplied',
    defaultMessage: 'Replied',
  },
  clearAllFilters: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.clearAllFilters',
    defaultMessage: 'Clear all filters',
  },
  isAnyOf: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.isAnyOf',
    defaultMessage: 'is any of',
  },
  is: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.is',
    defaultMessage: 'is',
  },

  selectAllTerms: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.selectAllTerms3',
    defaultMessage: `{inputTerm, select,
      idea {Select all {count, plural, one {# idea} other {# ideas}}}
      option {Select all {count, plural, one {# option} other {# options}}}
      project {Select all {count, plural, one {# project} other {# projects}}}
      question {Select all {count, plural, one {# question} other {# questions}}}
      issue {Select all {count, plural, one {# issue} other {# issues}}}
      contribution {Select all {count, plural, one {# contribution} other {# contributions}}}
      proposal {Select all {count, plural, one {# proposal} other {# proposals}}}
      initiative {Select all {count, plural, one {# initiative} other {# initiatives}}}
      petition {Select all {count, plural, one {# petition} other {# petitions}}}
      comment {Select all {count, plural, one {# comment} other {# comments}}}
      response {Select all {count, plural, one {# response} other {# responses}}}
      suggestion {Select all {count, plural, one {# suggestion} other {# suggestions}}}
      topic {Select all {count, plural, one {# topic} other {# topics}}}
      post {Select all {count, plural, one {# post} other {# posts}}}
      story {Select all {count, plural, one {# story} other {# stories}}}
      observation {Select all {count, plural, one {# observation} other {# observations}}}
      statement {Select all {count, plural, one {# statement} other {# statements}}}
      other {Select all {count, plural, one {# input} other {# inputs}}}
    }`,
  },
  selectAllFailed: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.selectAllFailed',
    defaultMessage: 'Could not select them all. Please try again.',
  },
  batchUpdateFailed: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.batchUpdateFailed',
    defaultMessage: 'Could not update {failed} of {total}. Please try again.',
  },
  batchDeleteFailed: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.batchDeleteFailed',
    defaultMessage: 'Could not delete {failed} of {total}. Please try again.',
  },
  deleteTerms: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.deleteTerms3',
    defaultMessage: `{inputTerm, select,
      idea {Delete {count, plural, one {# idea} other {# ideas}}}
      option {Delete {count, plural, one {# option} other {# options}}}
      project {Delete {count, plural, one {# project} other {# projects}}}
      question {Delete {count, plural, one {# question} other {# questions}}}
      issue {Delete {count, plural, one {# issue} other {# issues}}}
      contribution {Delete {count, plural, one {# contribution} other {# contributions}}}
      proposal {Delete {count, plural, one {# proposal} other {# proposals}}}
      initiative {Delete {count, plural, one {# initiative} other {# initiatives}}}
      petition {Delete {count, plural, one {# petition} other {# petitions}}}
      comment {Delete {count, plural, one {# comment} other {# comments}}}
      response {Delete {count, plural, one {# response} other {# responses}}}
      suggestion {Delete {count, plural, one {# suggestion} other {# suggestions}}}
      topic {Delete {count, plural, one {# topic} other {# topics}}}
      post {Delete {count, plural, one {# post} other {# posts}}}
      story {Delete {count, plural, one {# story} other {# stories}}}
      observation {Delete {count, plural, one {# observation} other {# observations}}}
      statement {Delete {count, plural, one {# statement} other {# statements}}}
      other {Delete {count, plural, one {# input} other {# inputs}}}
    }`,
  },
  deleteTermTitle: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.deleteTermTitle3',
    defaultMessage: `{inputTerm, select,
      idea {Are you sure you want to delete this idea?}
      option {Are you sure you want to delete this option?}
      project {Are you sure you want to delete this project?}
      question {Are you sure you want to delete this question?}
      issue {Are you sure you want to delete this issue?}
      contribution {Are you sure you want to delete this contribution?}
      proposal {Are you sure you want to delete this proposal?}
      initiative {Are you sure you want to delete this initiative?}
      petition {Are you sure you want to delete this petition?}
      comment {Are you sure you want to delete this comment?}
      response {Are you sure you want to delete this response?}
      suggestion {Are you sure you want to delete this suggestion?}
      topic {Are you sure you want to delete this topic?}
      post {Are you sure you want to delete this post?}
      story {Are you sure you want to delete this story?}
      observation {Are you sure you want to delete this observation?}
      statement {Are you sure you want to delete this statement?}
      other {Are you sure you want to delete this input?}
    }`,
  },
  deleteTermExplanation: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.deleteTermExplanation3',
    defaultMessage: `{inputTerm, select,
      idea {This means you will lose all data associated with this idea, like comments, reactions and votes. This action cannot be undone.}
      option {This means you will lose all data associated with this option, like comments, reactions and votes. This action cannot be undone.}
      project {This means you will lose all data associated with this project, like comments, reactions and votes. This action cannot be undone.}
      question {This means you will lose all data associated with this question, like comments, reactions and votes. This action cannot be undone.}
      issue {This means you will lose all data associated with this issue, like comments, reactions and votes. This action cannot be undone.}
      contribution {This means you will lose all data associated with this contribution, like comments, reactions and votes. This action cannot be undone.}
      proposal {This means you will lose all data associated with this proposal, like comments, reactions and votes. This action cannot be undone.}
      initiative {This means you will lose all data associated with this initiative, like comments, reactions and votes. This action cannot be undone.}
      petition {This means you will lose all data associated with this petition, like comments, reactions and votes. This action cannot be undone.}
      comment {This means you will lose all data associated with this comment, like comments, reactions and votes. This action cannot be undone.}
      response {This means you will lose all data associated with this response, like comments, reactions and votes. This action cannot be undone.}
      suggestion {This means you will lose all data associated with this suggestion, like comments, reactions and votes. This action cannot be undone.}
      topic {This means you will lose all data associated with this topic, like comments, reactions and votes. This action cannot be undone.}
      post {This means you will lose all data associated with this post, like comments, reactions and votes. This action cannot be undone.}
      story {This means you will lose all data associated with this story, like comments, reactions and votes. This action cannot be undone.}
      observation {This means you will lose all data associated with this observation, like comments, reactions and votes. This action cannot be undone.}
      statement {This means you will lose all data associated with this statement, like comments, reactions and votes. This action cannot be undone.}
      other {This means you will lose all data associated with this input, like comments, reactions and votes. This action cannot be undone.}
    }`,
  },
  deleteTermsTitle3: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.deleteTermsTitle4',
    defaultMessage: `{inputTerm, select,
      idea {Are you sure you want to delete {count, plural, one {# idea} other {# ideas}}?}
      option {Are you sure you want to delete {count, plural, one {# option} other {# options}}?}
      project {Are you sure you want to delete {count, plural, one {# project} other {# projects}}?}
      question {Are you sure you want to delete {count, plural, one {# question} other {# questions}}?}
      issue {Are you sure you want to delete {count, plural, one {# issue} other {# issues}}?}
      contribution {Are you sure you want to delete {count, plural, one {# contribution} other {# contributions}}?}
      proposal {Are you sure you want to delete {count, plural, one {# proposal} other {# proposals}}?}
      initiative {Are you sure you want to delete {count, plural, one {# initiative} other {# initiatives}}?}
      petition {Are you sure you want to delete {count, plural, one {# petition} other {# petitions}}?}
      comment {Are you sure you want to delete {count, plural, one {# comment} other {# comments}}?}
      response {Are you sure you want to delete {count, plural, one {# response} other {# responses}}?}
      suggestion {Are you sure you want to delete {count, plural, one {# suggestion} other {# suggestions}}?}
      topic {Are you sure you want to delete {count, plural, one {# topic} other {# topics}}?}
      post {Are you sure you want to delete {count, plural, one {# post} other {# posts}}?}
      story {Are you sure you want to delete {count, plural, one {# story} other {# stories}}?}
      observation {Are you sure you want to delete {count, plural, one {# observation} other {# observations}}?}
      statement {Are you sure you want to delete {count, plural, one {# statement} other {# statements}}?}
      other {Are you sure you want to delete {count, plural, one {# input} other {# inputs}}?}
    }`,
  },
  deleteTermsExplanation: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.deleteTermsExplanation3',
    defaultMessage: `{inputTerm, select,
      idea {This means you will lose all data associated with these ideas, like comments, reactions and votes. This action cannot be undone.}
      option {This means you will lose all data associated with these options, like comments, reactions and votes. This action cannot be undone.}
      project {This means you will lose all data associated with these projects, like comments, reactions and votes. This action cannot be undone.}
      question {This means you will lose all data associated with these questions, like comments, reactions and votes. This action cannot be undone.}
      issue {This means you will lose all data associated with these issues, like comments, reactions and votes. This action cannot be undone.}
      contribution {This means you will lose all data associated with these contributions, like comments, reactions and votes. This action cannot be undone.}
      proposal {This means you will lose all data associated with these proposals, like comments, reactions and votes. This action cannot be undone.}
      initiative {This means you will lose all data associated with these initiatives, like comments, reactions and votes. This action cannot be undone.}
      petition {This means you will lose all data associated with these petitions, like comments, reactions and votes. This action cannot be undone.}
      comment {This means you will lose all data associated with these comments, like comments, reactions and votes. This action cannot be undone.}
      response {This means you will lose all data associated with these responses, like comments, reactions and votes. This action cannot be undone.}
      suggestion {This means you will lose all data associated with these suggestions, like comments, reactions and votes. This action cannot be undone.}
      topic {This means you will lose all data associated with these topics, like comments, reactions and votes. This action cannot be undone.}
      post {This means you will lose all data associated with these posts, like comments, reactions and votes. This action cannot be undone.}
      story {This means you will lose all data associated with these stories, like comments, reactions and votes. This action cannot be undone.}
      observation {This means you will lose all data associated with these observations, like comments, reactions and votes. This action cannot be undone.}
      statement {This means you will lose all data associated with these statements, like comments, reactions and votes. This action cannot be undone.}
      other {This means you will lose all data associated with these inputs, like comments, reactions and votes. This action cannot be undone.}
    }`,
  },
  batchStatus: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.batchStatus',
    defaultMessage: 'Status',
  },
  batchAssign: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.batchAssign',
    defaultMessage: 'Assign',
  },
  batchTags: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.batchTags',
    defaultMessage: 'Tags',
  },
  copyToPhase: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.copyToPhase',
    defaultMessage: 'Copy to phase',
  },
  statusChangeNotifies: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.statusChangeNotifies',
    defaultMessage:
      'The authors and other contributors get a notification of the new status.',
  },
  noOtherPhasesForTerms: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.noOtherPhasesForTerms3',
    defaultMessage: `{inputTerm, select,
      idea {There is no other phase that can hold ideas.}
      option {There is no other phase that can hold options.}
      project {There is no other phase that can hold projects.}
      question {There is no other phase that can hold questions.}
      issue {There is no other phase that can hold issues.}
      contribution {There is no other phase that can hold contributions.}
      proposal {There is no other phase that can hold proposals.}
      initiative {There is no other phase that can hold initiatives.}
      petition {There is no other phase that can hold petitions.}
      comment {There is no other phase that can hold comments.}
      response {There is no other phase that can hold responses.}
      suggestion {There is no other phase that can hold suggestions.}
      topic {There is no other phase that can hold topics.}
      post {There is no other phase that can hold posts.}
      story {There is no other phase that can hold stories.}
      observation {There is no other phase that can hold observations.}
      other {There is no other phase that can hold inputs.}
    }`,
  },

  previousTerm: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.previousTerm3',
    defaultMessage: `{inputTerm, select,
      idea {Previous idea}
      option {Previous option}
      project {Previous project}
      question {Previous question}
      issue {Previous issue}
      contribution {Previous contribution}
      proposal {Previous proposal}
      initiative {Previous initiative}
      petition {Previous petition}
      comment {Previous comment}
      response {Previous response}
      suggestion {Previous suggestion}
      topic {Previous topic}
      post {Previous post}
      story {Previous story}
      observation {Previous observation}
      other {Previous input}
    }`,
  },
  nextTerm: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.nextTerm3',
    defaultMessage: `{inputTerm, select,
      idea {Next idea}
      option {Next option}
      project {Next project}
      question {Next question}
      issue {Next issue}
      contribution {Next contribution}
      proposal {Next proposal}
      initiative {Next initiative}
      petition {Next petition}
      comment {Next comment}
      response {Next response}
      suggestion {Next suggestion}
      topic {Next topic}
      post {Next post}
      story {Next story}
      observation {Next observation}
      other {Next input}
    }`,
  },
  postedBy: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.postedBy',
    defaultMessage: 'Posted by {author}',
  },
  position: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.position',
    defaultMessage: '{position} of {total}',
  },
  edit: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.edit',
    defaultMessage: 'Edit',
  },
  editTerm: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.editTerm3',
    defaultMessage: `{inputTerm, select,
      idea {Edit idea}
      option {Edit option}
      project {Edit project}
      question {Edit question}
      issue {Edit issue}
      contribution {Edit contribution}
      proposal {Edit proposal}
      initiative {Edit initiative}
      petition {Edit petition}
      comment {Edit comment}
      response {Edit response}
      suggestion {Edit suggestion}
      topic {Edit topic}
      post {Edit post}
      story {Edit story}
      observation {Edit observation}
      other {Edit input}
    }`,
  },
  save: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.save',
    defaultMessage: 'Save',
  },
  viewOnSite: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.viewOnSite',
    defaultMessage: 'View on the site',
  },
  delete: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.delete',
    defaultMessage: 'Delete',
  },
  phases: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.phases',
    defaultMessage: 'Phases',
  },
  addTag: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.addTag',
    defaultMessage: 'Add tag',
  },

  waitingForReply: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.waitingForReply',
    defaultMessage: 'Waiting for a reply',
  },
  waitingForResponse: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.waitingForResponse',
    defaultMessage: 'Waiting for a response',
  },
  stillGatheringSupport: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.stillGatheringSupport',
    defaultMessage: 'Still gathering support',
  },
  offlineVotes: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.offlineVotes',
    defaultMessage: 'Offline votes',
  },
  autoShareResults: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.autoShareResults',
    defaultMessage: 'Auto-share results',
  },
  autoShareNotice: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.autoShareNotice',
    defaultMessage:
      'Voting results are shared on the platform and via email to participants on {date}, when the phase ends.',
  },
  autoShareNoticeNoEndDate: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.autoShareNoticeNoEndDate',
    defaultMessage:
      'Voting results are shared on the platform and via email to participants when the phase ends.',
  },
  autoShareNoticeEnded: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.autoShareNoticeEnded',
    defaultMessage:
      'This phase has ended, so its voting results are public on the platform.',
  },
  offlineCollection: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.offlineCollection',
    defaultMessage: 'Offline collection',
  },
  export: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.export',
    defaultMessage: 'Export',
  },

  noTermsTitle: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.noTermsTitle3',
    defaultMessage: `{inputTerm, select,
      idea {Ideas will appear here}
      option {Options will appear here}
      project {Projects will appear here}
      question {Questions will appear here}
      issue {Issues will appear here}
      contribution {Contributions will appear here}
      proposal {Proposals will appear here}
      initiative {Initiatives will appear here}
      petition {Petitions will appear here}
      comment {Comments will appear here}
      response {Responses will appear here}
      suggestion {Suggestions will appear here}
      topic {Topics will appear here}
      post {Posts will appear here}
      story {Stories will appear here}
      observation {Observations will appear here}
      other {Inputs will appear here}
    }`,
  },
  noTermsDescription: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.noTermsDescription3',
    defaultMessage: `{inputTerm, select,
      idea {Once people take part, you can review and manage their ideas here.}
      option {Once people take part, you can review and manage their options here.}
      project {Once people take part, you can review and manage their projects here.}
      question {Once people take part, you can review and manage their questions here.}
      issue {Once people take part, you can review and manage their issues here.}
      contribution {Once people take part, you can review and manage their contributions here.}
      proposal {Once people take part, you can review and manage their proposals here.}
      initiative {Once people take part, you can review and manage their initiatives here.}
      petition {Once people take part, you can review and manage their petitions here.}
      comment {Once people take part, you can review and manage their comments here.}
      response {Once people take part, you can review and manage their responses here.}
      suggestion {Once people take part, you can review and manage their suggestions here.}
      topic {Once people take part, you can review and manage their topics here.}
      post {Once people take part, you can review and manage their posts here.}
      story {Once people take part, you can review and manage their stories here.}
      observation {Once people take part, you can review and manage their observations here.}
      other {Once people take part, you can review and manage their inputs here.}
    }`,
  },
  importPaperTerms: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.importPaperTerms3',
    defaultMessage: `{inputTerm, select,
      idea {Import paper ideas}
      option {Import paper options}
      project {Import paper projects}
      question {Import paper questions}
      issue {Import paper issues}
      contribution {Import paper contributions}
      proposal {Import paper proposals}
      initiative {Import paper initiatives}
      petition {Import paper petitions}
      comment {Import paper comments}
      response {Import paper responses}
      suggestion {Import paper suggestions}
      topic {Import paper topics}
      post {Import paper posts}
      story {Import paper stories}
      observation {Import paper observations}
      other {Import paper inputs}
    }`,
  },
  paperAndExcelForms: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.paperAndExcelForms',
    defaultMessage: 'Paper and Excel forms',
  },
});
