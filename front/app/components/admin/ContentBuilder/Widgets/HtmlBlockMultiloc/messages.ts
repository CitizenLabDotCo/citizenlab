import { defineMessages } from 'react-intl';

export default defineMessages({
  htmlBlockMultiloc: {
    id: 'app.containers.admin.content_builder.html_block.label',
    defaultMessage: 'HTML block',
  },
  htmlBlockCode: {
    id: 'app.containers.admin.content_builder.html_block.code',
    defaultMessage: 'HTML code',
  },
  htmlBlockCodeTooltip: {
    id: 'app.containers.admin.content_builder.html_block.code_tooltip',
    defaultMessage:
      'Paste the HTML you want to display on your page. Read our {supportArticle} to see which tags and attributes are supported.',
  },
  htmlBlockCodeTooltipLinkText: {
    id: 'app.containers.admin.content_builder.html_block.code_tooltip_link_text',
    defaultMessage: 'support article',
  },
  htmlBlockCodeTooltipLinkUrl: {
    id: 'app.containers.admin.content_builder.html_block.code_tooltip_link_url',
    defaultMessage:
      'https://support.govocal.com/en/articles/527598-customizing-project-descriptions-with-the-content-builder#h_bdf731893f',
  },
});
