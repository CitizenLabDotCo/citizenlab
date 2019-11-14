import { defineMessages } from 'react-intl';

export default defineMessages({
  createdTimeAgo: {
    id: 'app.components.PostShowComponents.createdTimeAgo',
    defaultMessage: 'Created {timeAgo}',
  },
  seeTranslation: {
    id: 'app.components.PostShowComponents.seeTranslation',
    defaultMessage: 'See translation',
  },
  seeOriginal: {
    id: 'app.components.PostShowComponents.seeOriginal',
    defaultMessage: 'See original',
  },
  linkToHomePage: {
    id: 'app.components.PostShowComponents.linkToHomePage',
    defaultMessage: 'Home page'
  },
  lastUpdated: {
    id: 'app.components.PostShowComponents.lastUpdated',
    defaultMessage: 'Last modified {modificationTime}',
  },
  lastChangesTitleIdea: {
    id: 'app.components.PostShowComponents.lastChangesTitleIdea',
    defaultMessage: 'Last changes to this idea',
  },
  lastChangesTitleInitiative: {
    id: 'app.components.PostShowComponents.lastChangesTitleInitiative',
    defaultMessage: 'Last changes to this initiative',
  },
  changeLogEntryIdea: {
    id: 'app.components.PostShowComponents.changeLogEntryIdea',
    defaultMessage: `{changeType, select,
      changed_status {{userName} has updated the status of this idea}
      published {{userName} created this idea}
      changed_title {{userName} updated the title of this idea}
      changed_body {{userName} updated the description of this idea}
    }`,
  },
  changeLogEntryInitiative: {
    id: 'app.components.PostShowComponents.changeLogEntryInitiative',
    defaultMessage: `{changeType, select,
      changed_status {{userName} has updated the status of this initiative}
      published {{userName} created this initiative}
      changed_title {{userName} updated the title of this initiative}
      changed_body {{userName} updated the description of this initiative}
    }`,
  }
});
