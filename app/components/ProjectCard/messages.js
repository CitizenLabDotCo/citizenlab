/*
 * ProjectCard Messages
 *
 * This contains all the text for the ProjectCard component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  openProjectButton: {
    id: 'app.components.ProjectCard.openProjectButton',
    defaultMessage: 'Discover this project',
  },
  xIdeas: {
    id: 'app.components.ProjectCard.xIdeas',
    defaultMessage: '{x, plural, =0 {no ideas} one {# ideas} other {# ideas}}',
  },
  readMore: {
    id: 'app.components.ProjectCard.readMore',
    defaultMessage: 'Read more',
  },
});
