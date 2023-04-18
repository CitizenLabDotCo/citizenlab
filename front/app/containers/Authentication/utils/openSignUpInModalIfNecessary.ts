// // routing
// import clHistory from 'utils/cl-router/history';

// // events
// import { triggerAuthenticationFlow } from 'containers/NewAuthModal/events';

// // utils
// import { isNilOrError, endsWith } from 'utils/helperUtils';
// import { parse } from 'qs';

// // typings
// import { SSOParams } from 'services/singleSignOn';
import { TAuthUser } from 'hooks/useAuthUser';
// import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';

export default function openSignUpInModalIfNecessary(
  _authUser: TAuthUser,
  _isAuthError: boolean,
  _isInvitation: boolean,
  _search: string
) {
  // here we check all the possible conditions that could potentially trigger the sign-up and/or verification flow to appear
  // if (
  //   // when the user is redirected to the '/authentication-error' url (e.g. when SSO fails)
  //   isAuthError ||
  //   // when the user is sent to the '/invite' url (e.g. when the user clicks on an invitation link)
  //   isInvitation ||
  //   // when the user is logged in
  //   !isNilOrError(authUser)
  // ) {
  //   const urlSearchParams = parse(search, {
  //     ignoreQueryPrefix: true,
  //   }) as any as SSOParams;
  //   // see services/singleSignOn.ts for the typed interface of all the sso related url params the url can potentially contain
  //   const {
  //     sso_response,
  //     sso_flow,
  //     sso_pathname,
  //     sso_verification,
  //     sso_verification_action,
  //     sso_verification_id,
  //     sso_verification_type,
  //     error_code,
  //   } = urlSearchParams;
  //   if (isAuthError || isInvitation) {
  //     // remove all url params from the url as relevant params have already been captured in the code above.
  //     // this avoids possbile polution by any remaining url params later on in the process.
  //     window.history.replaceState(null, '', '/');
  //   }
  //   // 1. sso_response indicates the user got sent back to the platform from an external sso page (facebook, google, ...)
  //   // 2. isInvitation indicates the user got sent to the platform through an invitation link
  //   if (sso_response || isInvitation) {
  //     // if the sso_pathname is present we redirect the user to it
  //     // we do this to sent the user back to the page they came from after
  //     // having been redirected to an external SSO service (e.g. '/project/123' -> facebook sign-on -> back to '/project/123')
  //     if (!isAuthError && sso_pathname) {
  //       clHistory.replace(sso_pathname);
  //     }
  //     const shouldVerify =
  //       // authUser check is needed so we don't open the sign up/in modal again when a
  //       // user closes the sign up modal at e.g. the verification step.
  //       // At that point authUser will exist.
  //       // When we just do !authUser?.data?.attributes?.verified,
  //       // we will also return true here when authUser is null or undefined.
  //       !isNilOrError(authUser) &&
  //       !authUser.attributes.verified &&
  //       sso_verification;
  //     const shouldFinishRegistrationAfterSSO =
  //       sso_response &&
  //       sso_flow === 'signup' &&
  //       !isNilOrError(authUser) &&
  //       !authUser.attributes.registration_completed_at;
  //     // we do not open the modal when the user gets sent to the '/sign-up' or '/sign-in' urls because
  //     // on those pages we show the sign-up-in flow directly on the page and not as a modal.
  //     // otherwise, when any of the above-defined conditions is set to true, we do trigger the modal
  //     if (
  //       !endsWith(sso_pathname, ['sign-up', 'sign-in']) &&
  //       (isAuthError ||
  //         shouldVerify ||
  //         isInvitation ||
  //         shouldFinishRegistrationAfterSSO)
  //     ) {
  //       triggerAuthenticationFlow({
  //         flow: isAuthError && sso_flow ? sso_flow : 'signup',
  //         error: isAuthError ? { code: error_code || 'general' } : undefined,
  //         context:
  //           sso_verification_action && sso_verification_type
  //             ? ({
  //                 action: sso_verification_action,
  //                 id: sso_verification_id,
  //                 type: sso_verification_type,
  //               } as AuthenticationContext)
  //             : undefined,
  //       });
  //     }
  //   }
  // }
}
