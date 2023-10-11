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
    id: 'app.containers.Admin.tools.powerBITemplates.reportTemplateDescription',
    defaultMessage:
      'This template create a Power BI report based on your CitizenLab data. ' +
      'It will set up all the data connections to your CitizenLab ' +
      'platform, create the data model and some default dashboards. ' +
      'When you open the template in Power BI you will be prompted to enter your public API credentials.',
  },
  reportTemplateDownload: {
    id: 'app.containers.Admin.tools.powerBITemplates.reportTemplateDownload',
    defaultMessage: 'Download reporting template',
  },
  dataflowTemplateTitle: {
    id: 'app.containers.Admin.tools.powerBITemplates.dataflowTemplateTitle',
    defaultMessage: 'Dataflow template',
  },
  dataflowTemplateDescription: {
    id: 'app.containers.Admin.tools.powerBITemplates.dataflowTemplateDescription',
    defaultMessage:
      'If you intend to use your CitizenLab data within a Power BI data flow, ' +
      'this template will allow you to set up a new data flow that connects to your CitizenLab data. ' +
      'Once you have downloaded this template you must first find and replace the following ' +
      'strings ##CLIENT_ID## and ##CLIENT_SECRET## in the template with your public API ' +
      'credentials before uploading to PowerBI.',
  },
  dataflowTemplateDownload: {
    id: 'app.containers.Admin.tools.powerBITemplates.dataflowTemplateDownload',
    defaultMessage: 'Download data flow template',
  },
});
