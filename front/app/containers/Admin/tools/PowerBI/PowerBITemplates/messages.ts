import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.Admin.tools.powerBITemplates.title',
    defaultMessage: 'Power BI templates',
  },
  intro: {
    id: 'app.containers.Admin.tools.powerBITemplates.intro',
    defaultMessage:
      'Note: To use either of these Power BI templates, you must first {link}',
  },
  publicApiLinkText: {
    id: 'app.containers.Admin.tools.powerBITemplates.publicApiLinkText',
    defaultMessage: 'create a set of credentials for our public API',
  },
  reportTemplateTitle: {
    id: 'app.containers.Admin.tools.powerBITemplates.reportTemplateTitle',
    defaultMessage: 'Report template',
  },
  reportTemplateDescription: {
    id: 'app.containers.Admin.tools.powerBITemplates.reportTemplateDescription3',
    defaultMessage:
      'This template will create a Power BI report based on your Go Vocal data. ' +
      'It will set up all the data connections to your Go Vocal ' +
      'platform, create the data model and some default dashboards. ' +
      'When you open the template in Power BI you will be prompted to enter your public API credentials. ' +
      'You will also need to enter the Base Url for your platform, which is: {baseUrl}',
  },
  reportTemplateDownload: {
    id: 'app.containers.Admin.tools.powerBITemplates.reportTemplateDownload',
    defaultMessage: 'Download report template',
  },
  dataflowTemplateTitle: {
    id: 'app.containers.Admin.tools.powerBITemplates.dataflowTemplateTitle',
    defaultMessage: 'Dataflow template',
  },
  dataflowTemplateDescription: {
    id: 'app.containers.Admin.tools.powerBITemplates.dataflowTemplateDescription',
    defaultMessage:
      'If you intend to use your Go Vocal data within a Power BI data flow, ' +
      'this template will allow you to set up a new data flow that connects to your Go Vocal data. ' +
      'Once you have downloaded this template you must first find and replace the following ' +
      'strings ##CLIENT_ID## and ##CLIENT_SECRET## in the template with your public API ' +
      'credentials before uploading to PowerBI.',
  },
  dataflowTemplateDownload: {
    id: 'app.containers.Admin.tools.powerBITemplates.dataflowTemplateDownload',
    defaultMessage: 'Download data flow template',
  },
  supportLinkDescription: {
    id: 'app.containers.Admin.tools.powerBITemplates.supportLinkDescription',
    defaultMessage:
      'Further details about using your Go Vocal data in Power BI can be found in our {link}.',
  },
  supportLinkUrl2: {
    id: 'app.containers.Admin.tools.powerBITemplates.supportLinkUrl2',
    defaultMessage:
      'https://support.govocal.com/en/articles/527578-use-citizenlab-data-in-powerbi',
  },
  supportLinkText: {
    id: 'app.containers.Admin.tools.powerBITemplates.supportLinkText',
    defaultMessage: 'support article',
  },
});
