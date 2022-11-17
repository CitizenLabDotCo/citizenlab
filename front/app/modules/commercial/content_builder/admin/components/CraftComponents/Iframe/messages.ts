import { defineMessages } from 'react-intl';

export default defineMessages({
  url: {
    id: 'app.containers.admin.ContentBuilder.url',
    defaultMessage: 'Embed',
  },
  embedIframeUrlLabel: {
    id: 'app.containers.admin.ContentBuilder.embedIframeUrlLabel',
    defaultMessage: 'Website address',
  },
  embedIframeUrlLabelTooltip: {
    id: 'app.containers.admin.ContentBuilder.embedIframeUrlLabelTooltip',
    defaultMessage: 'Full URL of the website you want to embed.',
  },
  embedIframeHeightLabel: {
    id: 'app.containers.admin.ContentBuilder.embedIframeHeightLabel',
    defaultMessage: 'Embed height (pixels)',
  },
  embedIframeHeightLabelTooltip: {
    id: 'app.containers.admin.ContentBuilder.embedIframeHeightLabelTooltip',
    defaultMessage:
      'Height you want your embedded content to appear on the page (in pixels).',
  },
  iframeHeightPlaceholder: {
    id: 'app.containers.admin.ContentBuilder.iframeHeightPlaceholder',
    defaultMessage: '300',
  },
  embedIframeTitleLabel: {
    id: 'app.containers.admin.ContentBuilder.embedIframeTitleLabel',
    defaultMessage: 'Short description of the content you are embedding',
  },
  embedIframeTitleTooltip: {
    id: 'app.containers.admin.ContentBuilder.embedIframeTitleTooltip',
    defaultMessage:
      'It is useful to provide this information for users who rely on a screen reader or other assistive technology.',
  },
  iframeInvalidUrlErrorMessage: {
    id: 'app.containers.admin.ContentBuilder.iframeUrlErrorMessage',
    defaultMessage:
      'Enter a valid web address, for example https://example.com',
  },
  iframeDescription: {
    id: 'app.containers.admin.ContentBuilder.iframeDescription',
    defaultMessage:
      'Display content from an external website on your page in an HTML iFrame.',
  },
  iframeInvalidWhitelistUrlErrorMessage: {
    id: 'app.containers.admin.ContentBuilder.iframeInvalidWhitelistUrlErrorMessage',
    defaultMessage:
      'Sorry, this content could not be embedded. {visitLinkMessage} to learn more.',
  },
  iframeEmbedVisitLinkMessage: {
    id: 'app.containers.admin.ContentBuilder.iframeEmbedVisitLinkMessage',
    defaultMessage: 'Visit our support page',
  },
  iframeSupportLink: {
    id: 'app.containers.admin.ContentBuilder.iframeSupportLink',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/6354058-embedding-elements-in-the-content-builder-to-enrich-project-descriptions',
  },
});
