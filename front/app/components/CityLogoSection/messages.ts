import { defineMessages } from 'react-intl';

export default defineMessages({
  iframeTitle: {
    id: 'app.components.CityLogoSection.iframeTitle',
    defaultMessage: 'More information about {orgName}',
  },
  slogan: {
    id: 'app.components.CityLogoSection.slogan',
    defaultMessage:
      '{type, select, generic {This website is an initiative from {name}} other {This website is an initiative from the city of {name}}}',
  },
});
