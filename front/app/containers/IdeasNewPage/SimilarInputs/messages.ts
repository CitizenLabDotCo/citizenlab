import { defineMessages } from 'react-intl';

export default defineMessages({
  similarSubmissionsPosted: {
    id: 'app.components.ideas.similarIdeas.similarSubmissionsPosted',
    defaultMessage: 'Similar submissions already posted:',
  },
  similarSubmissionsDescription: {
    id: 'app.components.ideas.similarIdeas.similarSubmissionsDescription',
    defaultMessage:
      'We found similar submisisons - engaging with them can help make them stronger!',
  },
  similarSubmissionsSearch: {
    id: 'app.components.ideas.similarIdeas.similarSubmissionsSearch',
    defaultMessage: 'Looking for similar submissions ...',
  },
  noSimilarSubmissions: {
    id: 'app.components.ideas.similarIdeas.noSimilarSubmissions',
    defaultMessage: 'No similar submissions found.',
  },
  engageHere: {
    id: 'app.components.ideas.similarIdeas.engageHere',
    defaultMessage: 'Engage here',
  },
  similarSubmissionsAnnounceResults: {
    id: 'app.components.ideas.similarIdeas.similarSubmissionsAnnounceResults',
    defaultMessage:
      '{count, plural, =0 {No similar submissions found.} one {One similar submission found.} other {{count} similar submissions found.}}',
  },
});
