/*
 * IdeasIndexPage Messages
 *
 * This contains all the text for the IdeasIndexPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  titleCity: {
    id: 'app.containers.landing.title',
    description: 'name is the name of a city',
    defaultMessage: 'Co-create {name}',
  },
  SubTitleCity: {
    id: 'app.containers.landing.loadMore',
    description: 'name is the name of a city',
    defaultMessage: 'Share your ideas for {name} and co-create your city',
  },

  // ideas
  ideasFrom: {
    id: 'app.containers.landing.ideasFrom',
    defaultMessage: 'Ideas for {name}',
  },
  viewIdeas: {
    id: 'app.containers.landing.viewIdeas',
    defaultMessage: 'View all Ideas',
  },

  // projects
  projectsFrom: {
    id: 'app.containers.landing.topics',
    defaultMessage: 'Projects From {name}',
  },
  viewProjects: {
    id: 'app.containers.landing.viewProjects',
    defaultMessage: 'View all Projects',
  },

  // footer
  poweredBy: {
    id: 'app.containers.landing.poweredBy',
    defaultMessage: 'Powered by CitizenLab | Geef je feedback over het platform',
  },

});
