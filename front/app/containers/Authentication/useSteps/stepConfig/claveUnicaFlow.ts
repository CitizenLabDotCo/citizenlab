import { Step } from './typings';
import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import { GetRequirements } from 'containers/Authentication/typings';
import { askCustomFields } from './utils';
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';

export const claveUnicaFlow = (
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void
) => {
  return {
    'clave-unica:email': {
      SUBMIT_EMAIL: async (email: string) => {
        await resendEmailConfirmationCode(email);
        setCurrentStep('clave-unica:email-confirmation');
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
