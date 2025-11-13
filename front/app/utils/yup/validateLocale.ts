import { string } from 'yup';

import { appLocalePairs } from 'containers/App/constants';

import { keys } from 'utils/helperUtils';

const locales = keys(appLocalePairs);

const validateLocale = () => string().oneOf(locales);

export default validateLocale;
