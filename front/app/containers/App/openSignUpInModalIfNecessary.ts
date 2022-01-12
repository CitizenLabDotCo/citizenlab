import { isNilOrError, endsWith } from 'utils/helperUtils';
import { parse } from 'qs';
import { openSignUpInModal } from 'components/SignUpIn/events';
import { SSOParams } from 'services/singleSignOn';
import clHistory from 'utils/cl-router/history';
import { TAuthUser } from 'containers/App';

export default function openSignUpInModalIfNecessary(
  authUser: TAuthUser,
  isAuthError: boolean,
  isInvitation: boolean,
  signUpInModalMounted: boolean,
  search: string
) {
  // here we check all the possible conditions that could potentially trigger the sign-up and/or verification flow to appear
  if (
    // when the user is redirected to the '/authentication-error' url (e.g. when SSO fails)
    isAuthError ||
    // when the user is sent to the '/invite' url (e.g. when the user clicks on an invitation link)
    isInvitation ||
    // when -both- the signup modal component has mounted and the authUser stream has initiated
    (signUpInModalMounted && !isNilOrError(authUser))
  ) {
    const urlSearchParams = parse(search, {
      ignoreQueryPrefix: true,
    }) as any as SSOParams;
    // this constant represents the 'token' param that can optionally be included in the url
    // when a user gets sent to the platform through an invitation link (e.g. '/invite?token=123456)
    const token = urlSearchParams?.['token'] as string | undefined;

    // shouldCompleteRegistration is set to true when the authUser registration_completed_at attribute is not yet set.
    // when this attribute is undefined the sign-up process has not yet been completed and the user account is not yet valid!
    const shouldCompleteRegistration =
      !authUser?.data.attributes.registration_completed_at;
    // see services/singleSignOn.ts for the typed interface of all the sso related url params the url can potentially contain
    const {
      sso_response,
      sso_flow,
      sso_pathname,
      sso_verification,
      sso_verification_action,
      sso_verification_id,
      sso_verification_type,
    } = urlSearchParams;

    if (isAuthError || isInvitation) {
      // remove all url params from the url as relevant params have already been captured in the code above.
      // this avoids possbile polution by any remaining url params later on in the process.
      window.history.replaceState(null, '', '/');
    }

    // 1. sso_response indicates the user got sent back to the platform from an external sso page (facebook, google, ...)
    // 2. shouldCompleteRegistration indicates the authUser registration_completed_at attribute is not yet set and the user still needs to complete their registration
    // 3. isInvitation indicates the user got sent to the platform through an invitation link
    if (sso_response || shouldCompleteRegistration || isInvitation) {
      // if the sso_pathname is present we redirect the user to it
      // we do this to sent the user back to the page they came from after
      // having been redirected to an external SSO service (e.g. '/project/123' -> facebook sign-on -> back to '/project/123')
      if (!isAuthError && sso_pathname) {
        clHistory.replace(sso_pathname);
      }

      const shouldVerify =
        !authUser?.data?.attributes?.verified && sso_verification;

      // we do not open the modal when the user gets sent to the '/sign-up' or '/sign-in' urls because
      // on those pages we show the sign-up-in flow directly on the page and not as a modal.
      // otherwise, when any of the above-defined conditions is set to true, we do trigger the modal
      if (
        !endsWith(sso_pathname, ['sign-up', 'sign-in']) &&
        (isAuthError || shouldCompleteRegistration || shouldVerify)
      ) {
        openSignUpInModal({
          isInvitation,
          token,
          flow: isAuthError && sso_flow ? sso_flow : 'signup',
          error: isAuthError,
          verification: !!sso_verification,
          verificationContext:
            sso_verification &&
            sso_verification_action &&
            sso_verification_id &&
            sso_verification_type
              ? {
                  action: sso_verification_action as any,
                  id: sso_verification_id as any,
                  type: sso_verification_type as any,
                }
              : undefined,
        });
      }
    }
  }
}
