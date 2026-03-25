import { string, number, boolean } from 'yup';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from '../../messages';

export interface SharedFormValues {
  width: number;
  height: number;
  siteBgColor: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  font: string | null;
  fontSize: number;
  relativeLink: string;
  showHeader: boolean;
  showLogo: boolean;
  headerText: string;
  headerSubText: string;
  showFooter: boolean;
  buttonText: string;
}

export const sharedSchemaFields = {
  width: number().required(),
  height: number().required(),
  siteBgColor: string().required(),
  bgColor: string().required(),
  textColor: string().required(),
  accentColor: string().required(),
  font: string().required().nullable(),
  fontSize: number().required(),
  relativeLink: string().required(),
  showHeader: boolean().required(),
  showLogo: boolean().required(),
  headerText: string().required(),
  headerSubText: string().required(),
  showFooter: boolean().required(),
  buttonText: string().required(),
};

interface TenantColors {
  accentColor?: string | null;
  textColor?: string | null;
}

export const getSharedDefaultValues = (
  formatMessage: (descriptor: MessageDescriptor) => string,
  tenantColors?: TenantColors
) => ({
  width: 320,
  height: 400,
  siteBgColor: '#ffffff',
  bgColor: '#ffffff',
  textColor: tenantColors?.textColor || '#333333',
  accentColor: tenantColors?.accentColor || '#0A5159',
  font: null,
  fontSize: 15,
  relativeLink: '/',
  showHeader: true,
  showLogo: true,
  headerText: formatMessage(messages.fieldHeaderTextDefault),
  headerSubText: formatMessage(messages.fieldHeaderSubTextDefault),
  showFooter: true,
  buttonText: formatMessage(messages.fieldButtonTextDefault),
});
