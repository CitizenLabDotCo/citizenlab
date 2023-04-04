import {
  AuthenticationContext,
  GLOBAL_CONTEXT,
} from 'api/authentication_requirements/types';
import eventEmitter from 'utils/eventEmitter';
import getAuthenticationRequirements from 'api/authentication_requirements/getAuthenticationRequirements';
import { triggerAuthenticationFlow } from 'containers/NewAuthModal/events';
import { SuccessAction } from 'containers/NewAuthModal/SuccessActions/actions';

export type TSignUpInError = 'general' | 'franceconnect_merging_failed';

interface ISignUpInError {
  code: TSignUpInError;
}

export type TSignUpInFlow = 'signup' | 'signin';

export interface ISignUpInMetaData {
  flow?: TSignUpInFlow;
  pathname?: string;
  verification?: boolean;
  context?: AuthenticationContext;
  error?: ISignUpInError;
  isInvitation?: boolean;
  token?: string;
  noAutofocus?: boolean;
  successAction?: SuccessAction;
}

const OLD_MODAL_EVENT = 'openOldSignUpInModal';

// Shared flow
export async function openSignUpInModal(metaData?: Partial<ISignUpInMetaData>) {
  const isOldSignInFlow = metaData?.flow === 'signin';

  if (isOldSignInFlow) {
    triggerAuthenticationFlow({
      flow: metaData.flow ?? 'signup',
      pathname: metaData.pathname || window.location.pathname,
      context: metaData.context ?? GLOBAL_CONTEXT,
      successAction: metaData.successAction,
    });

    return;
  }

  if (metaData?.context) {
    const response = await getAuthenticationRequirements(metaData.context);

    const isLightFlow =
      response.data.attributes.requirements.requirements.special.password ===
      'dont_ask';

    if (isLightFlow) {
      triggerAuthenticationFlow({
        flow: metaData.flow ?? 'signup',
        pathname: metaData.pathname || window.location.pathname,
        context: metaData.context,
        successAction: metaData.successAction,
      });

      return;
    }
  }

  openOldSignUpInModal(metaData);
}

// Old flow
export function openOldSignUpInModal(metaData?: Partial<ISignUpInMetaData>) {
  const emittedMetaData: ISignUpInMetaData = {
    flow: metaData?.flow || 'signup',
    pathname: metaData?.pathname || window.location.pathname,
    verification: metaData?.verification,
    context: metaData?.context,
    error: metaData?.error,
    isInvitation: !!metaData?.isInvitation,
    token: metaData?.token,
    successAction: metaData?.successAction,
  };

  eventEmitter.emit(OLD_MODAL_EVENT, emittedMetaData);
}

export const openOldSignUpInModal$ = eventEmitter.observeEvent<
  ISignUpInMetaData | undefined
>(OLD_MODAL_EVENT);

export function closeOldSignUpInModal() {
  eventEmitter.emit(OLD_MODAL_EVENT, undefined);
}
