import { Step } from './typings';
import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import { GetRequirements } from 'containers/Authentication/typings';
import { askCustomFields } from './utils';
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';
import { UseMutateFunction } from '@tanstack/react-query';
import { IUser, IUserUpdate } from 'api/users/types';
import { CLErrorsWrapper } from 'typings';

export const claveUnicaFlow = (
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateUser: UseMutateFunction<IUser, CLErrorsWrapper, IUserUpdate>
) => {
  return {
    'clave-unica:email': {
      SUBMIT_EMAIL: async ({
        email,
        userId,
      }: {
        email: string;
        userId: string;
      }) => {
        const { requirements } = await getRequirements();
        if (requirements.special.confirmation === 'require') {
          await resendEmailConfirmationCode(email);
          setCurrentStep('clave-unica:email-confirmation');
        } else {
          await updateUser({ userId, email });
          setCurrentStep('success');
        }
      },
    },
    'clave-unica:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('clave-unica:email');
      },
      SUBMIT_CODE: async (code: string) => {
        await confirmEmail({ code });

        const { requirements } = await getRequirements();

        if (askCustomFields(requirements.custom_fields)) {
          setCurrentStep('sign-up:custom-fields');
          return;
        }

        setCurrentStep('success');
      },
    },
  };
};
