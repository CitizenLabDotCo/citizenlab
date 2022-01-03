import { has } from 'lodash-es';
import { parse } from 'qs';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

export default function openVerificationModalIfSuccessOrError(search: string) {
  const urlSearchParams = parse(search, { ignoreQueryPrefix: true });

  if (has(urlSearchParams, 'verification_success')) {
    window.history.replaceState(null, '', window.location.pathname);
    openVerificationModal({ step: 'success' });
  }

  if (
    has(urlSearchParams, 'verification_error') &&
    urlSearchParams.verification_error === 'true'
  ) {
    window.history.replaceState(null, '', window.location.pathname);
    openVerificationModal({
      step: 'error',
      error: this.props.location.query?.error || null,
      context: null,
    });
  }
}
