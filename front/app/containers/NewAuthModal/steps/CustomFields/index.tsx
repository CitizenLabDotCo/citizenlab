import React, { useEffect, FormEvent } from 'react';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import UserCustomFieldsForm, {
  FormData,
} from 'components/UserCustomFieldsForm';
import useUserCustomFieldsSchema from 'hooks/useUserCustomFieldsSchema';
import Button from 'components/UI/Button';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// events
import eventEmitter from 'utils/eventEmitter';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Status } from 'containers/NewAuthModal/typings';

interface Props {
  status: Status;
  onSubmit: (id: string, formData: FormData) => void;
  onSkip: () => void;
}

const CustomFields = ({ status, onSubmit, onSkip }: Props) => {
  const authUser = useAuthUser();
  const userCustomFieldsSchema = useUserCustomFieldsSchema();
  const smallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();

  useEffect(() => {
    trackEventByName(tracks.signUpCustomFieldsStepEntered);
  }, []);

  if (isNilOrError(authUser) || isNilOrError(userCustomFieldsSchema)) {
    return null;
  }

  const loading = status === 'pending';

  const handleSubmit = ({ formData }: { formData: FormData }) => {
    onSubmit(authUser.id, formData);
  };

  const handleOnSubmitButtonClick = (event: FormEvent) => {
    event.preventDefault();
    eventEmitter.emit('customFieldsSubmitEvent');
  };

  return (
    <Box
      w="100%"
      pb={smallerThanPhone ? '14px' : '28px'}
      id="e2e-signup-custom-fields-container"
    >
      <UserCustomFieldsForm authUser={authUser} onSubmit={handleSubmit} />

      <Box
        display="flex"
        flexDirection={smallerThanPhone ? 'column' : undefined}
        alignItems={smallerThanPhone ? 'stretch' : 'center'}
        justifyContent={smallerThanPhone ? 'center' : 'space-between'}
        mt="-16px"
      >
        <Button
          id="e2e-signup-custom-fields-submit-btn"
          processing={loading}
          disabled={loading}
          text={formatMessage(messages.completeSignUp)}
          onClick={handleOnSubmitButtonClick}
        />

        {!userCustomFieldsSchema.hasRequiredFields && (
          <Button
            id="e2e-signup-custom-fields-skip-btn"
            buttonStyle="text"
            padding="0"
            textDecoration="underline"
            textDecorationHover="underline"
            processing={loading}
            onClick={onSkip}
            mt={smallerThanPhone ? '20px' : undefined}
            mb={smallerThanPhone ? '16px' : undefined}
          >
            {formatMessage(messages.skip)}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CustomFields;
