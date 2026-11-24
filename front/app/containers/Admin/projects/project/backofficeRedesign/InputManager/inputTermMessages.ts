import { defineMessages } from 'react-intl';

// The phase's naming option, for use inside other messages. `other` is the
// wording until the phase has loaded.
export default defineMessages({
  singular: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.term.singular',
    defaultMessage:
      '{term, select, idea {idea} option {option} project {project} question {question} issue {issue} contribution {contribution} proposal {proposal} initiative {initiative} petition {petition} comment {comment} response {response} suggestion {suggestion} topic {topic} post {post} story {story} observation {observation} other {input}}',
  },
  plural: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.term.plural',
    defaultMessage:
      '{term, select, idea {ideas} option {options} project {projects} question {questions} issue {issues} contribution {contributions} proposal {proposals} initiative {initiatives} petition {petitions} comment {comments} response {responses} suggestion {suggestions} topic {topics} post {posts} story {stories} observation {observations} other {inputs}}',
  },
  capitalizedSingular: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.term.capitalizedSingular',
    defaultMessage:
      '{term, select, idea {Idea} option {Option} project {Project} question {Question} issue {Issue} contribution {Contribution} proposal {Proposal} initiative {Initiative} petition {Petition} comment {Comment} response {Response} suggestion {Suggestion} topic {Topic} post {Post} story {Story} observation {Observation} other {Input}}',
  },
  capitalizedPlural: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.term.capitalizedPlural',
    defaultMessage:
      '{term, select, idea {Ideas} option {Options} project {Projects} question {Questions} issue {Issues} contribution {Contributions} proposal {Proposals} initiative {Initiatives} petition {Petitions} comment {Comments} response {Responses} suggestion {Suggestions} topic {Topics} post {Posts} story {Stories} observation {Observations} other {Inputs}}',
  },
  count: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputManager.term.count',
    defaultMessage:
      '{term, select, idea {{count, plural, one {# idea} other {# ideas}}} option {{count, plural, one {# option} other {# options}}} project {{count, plural, one {# project} other {# projects}}} question {{count, plural, one {# question} other {# questions}}} issue {{count, plural, one {# issue} other {# issues}}} contribution {{count, plural, one {# contribution} other {# contributions}}} proposal {{count, plural, one {# proposal} other {# proposals}}} initiative {{count, plural, one {# initiative} other {# initiatives}}} petition {{count, plural, one {# petition} other {# petitions}}} comment {{count, plural, one {# comment} other {# comments}}} response {{count, plural, one {# response} other {# responses}}} suggestion {{count, plural, one {# suggestion} other {# suggestions}}} topic {{count, plural, one {# topic} other {# topics}}} post {{count, plural, one {# post} other {# posts}}} story {{count, plural, one {# story} other {# stories}}} observation {{count, plural, one {# observation} other {# observations}}} other {{count, plural, one {# input} other {# inputs}}}}',
  },
});
