// The ways a participant can actually get an account on this platform, read
// from live config. Purely about signing in / up — what is required *on top* of
// that is the separate concern of the security checks section.

import useIdMethods from 'api/id_methods/useIdMethods';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useIdMethodNames, { getMethodName } from 'hooks/useIdMethodNames';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const useSignInMethods = (): string[] => {
  const { formatMessage } = useIntl();
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const smsEnabled = useFeatureFlag({ name: 'sms' });
  const smsLoginEnabled = useFeatureFlag({ name: 'sms_login' });
  const { data: idMethods } = useIdMethods();
  const idMethodNames = useIdMethodNames();

  const methodNames: string[] = [];

  if (passwordLoginEnabled) {
    methodNames.push(formatMessage(messages.email));
  }
  if (passwordLoginEnabled && smsEnabled && smsLoginEnabled) {
    methodNames.push(formatMessage(messages.sms));
  }

  const authenticationMethods = (idMethods?.data ?? []).filter(
    (method) => method.attributes.authentication_method
  );

  // Naming the method is more useful than the generic term, but only works
  // while there is exactly one — beyond that the link below does it better.
  if (authenticationMethods.length === 1) {
    methodNames.push(getMethodName(authenticationMethods[0], idMethodNames));
  } else if (authenticationMethods.length > 1) {
    methodNames.push(formatMessage(messages.ssoSeeBelow));
  }

  return methodNames;
};

export default useSignInMethods;
