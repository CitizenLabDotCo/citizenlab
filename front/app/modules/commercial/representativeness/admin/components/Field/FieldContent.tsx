import React from 'react';

// hooks
import useReferenceDistribution from '../../hooks/useReferenceDistribution';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import Options from './Options';
import Tippy from '@tippyjs/react';
import Button from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isSubmittingAllowed, FormValues } from './utils';

interface Props {
  userCustomFieldId: string;
  formValues: FormValues;
  submitting: boolean;
  touched: boolean;
  onUpdateEnabled: (optionId: string, enabled: boolean) => void;
  onUpdatePopulation: (optionId: string, population: number | null) => void;
  onSubmit: () => void;
}

const FieldContent = ({
  userCustomFieldId,
  formValues,
  submitting,
  touched,
  onUpdateEnabled,
  onUpdatePopulation,
  onSubmit,
}: Props) => {
  const { referenceDataUploaded } = useReferenceDistribution(userCustomFieldId);
  if (referenceDataUploaded === undefined) return null;

  const allowSubmit = isSubmittingAllowed(
    formValues,
    touched,
    referenceDataUploaded
  );

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
    >
      <Box
        width="100%"
        background="#FCFCFC"
        border={`1px ${colors.separation} solid`}
        pt="20px"
        pb="12px"
        px="16px"
      >
        <Header />
        <Options
          userCustomFieldId={userCustomFieldId}
          formValues={formValues}
          onUpdateEnabled={onUpdateEnabled}
          onUpdatePopulation={onUpdatePopulation}
        />
      </Box>

      <Tippy
        content={<FormattedMessage {...messages.disallowSaveMessage} />}
        disabled={allowSubmit}
        placement="top"
        theme="dark"
      >
        <div>
          <Button
            disabled={!allowSubmit}
            processing={submitting}
            text="Save"
            mt="20px"
            width="auto"
            onClick={onSubmit}
          />
        </div>
      </Tippy>
    </Box>
  );
};

export default FieldContent;
