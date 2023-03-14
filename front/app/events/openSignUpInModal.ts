import { AuthenticationContext } from 'api/permissions/types';
import eventEmitter from 'utils/eventEmitter';
import getAuthenticationRequirements from 'api/permissions/getAuthenticationRequirements';

export type TSignUpInError = 'general' | 'franceconnect_merging_failed';

interface ISignUpInError {
  code: TSignUpInError;
}

export type TSignUpInFlow = 'signup' | 'signin';

export interface ISignUpInMetaData {
  flow: TSignUpInFlow;
  pathname: string;
  verification?: boolean;
  context?: AuthenticationContext;
  error?: ISignUpInError;
  isInvitation?: boolean;
  token?: string;
  noAutofocus?: boolean;
  onSuccess?: () => void;
}

const OLD_MODAL_EVENT = 'openOldSignUpInModal';

// Shared flow
export async function openSignUpInModal(metaData?: Partial<ISignUpInMetaData>) {
  const emittedMetaData: ISignUpInMetaData = {
    flow: metaData?.flow || 'signup',
    pathname: metaData?.pathname || window.location.pathname,
    verification: metaData?.verification,
    context: metaData?.context,
    error: metaData?.error,
    isInvitation: !!metaData?.isInvitation,
    token: metaData?.token,
    onSuccess: metaData?.onSuccess,
  };

  if (emittedMetaData.context) {
    const response = await getAuthenticationRequirements(
      emittedMetaData.context
    );
    const passwordNotRequired =
      response.data.attributes.requirements.requirements.special.password ===
      'dont_ask';

    if (passwordNotRequired) {
      // TODO fire new flow
      return;
    }
  }

  openOldSignUpInModal(emittedMetaData);
}

// Old flow
export function openOldSignUpInModal(metaData: ISignUpInMetaData | undefined) {
  eventEmitter.emit(OLD_MODAL_EVENT, metaData);
}

export const openOldSignUpInModal$ = eventEmitter.observeEvent<
  ISignUpInMetaData | undefined
>(OLD_MODAL_EVENT);

export function closeOldSignUpInModal() {
  openOldSignUpInModal(undefined);
}

// New flow
// TODO
