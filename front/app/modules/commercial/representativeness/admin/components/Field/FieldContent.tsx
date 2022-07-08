import React, { useState } from 'react';

// hooks
import useUserCustomField from 'modules/commercial/user_custom_fields/hooks/useUserCustomField';
import useReferenceDistribution from '../../hooks/useReferenceDistribution';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import Options from './Options';
import Tippy from '@tippyjs/react';
import Button from 'components/UI/Button';
import Warning from 'components/UI/Warning';
import BinModal from './BinModal';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isSubmittingAllowed, FormValues } from './utils';
import { isNilOrError } from 'utils/helperUtils';

// TODO derive this from reference distribution (depending on Adrien's work)
const AGE_GROUPS_SET = false;

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
  const [binModalOpen, setBinModalOpen] = useState(false);
  const userCustomField = useUserCustomField(userCustomFieldId);
  const { referenceDataUploaded } = useReferenceDistribution(userCustomFieldId);

  if (referenceDataUploaded === undefined || isNilOrError(userCustomField)) {
    return null;
  }

  const allowSubmit = isSubmittingAllowed(
    formValues,
    touched,
    referenceDataUploaded
  );

  const showSetAgeGroupsMessage =
    userCustomField.attributes.code === 'birthyear' && !AGE_GROUPS_SET;

  const openBinModal = () => setBinModalOpen(true);
  const closeBinModal = () => setBinModalOpen(false);

  return (
    <>
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
          {showSetAgeGroupsMessage ? (
            <Box mt="12px" mb="12px">
              <Warning>
                <FormattedMessage
                  {...messages.setAgeGroups}
                  values={{
                    setAgeGroupsLink: (
                      <Box
                        as="button"
                        style={{ fontWeight: 700 }}
                        onClick={openBinModal}
                      >
                        <FormattedMessage {...messages.setAgeGroupsLink} />
                      </Box>
                    ),
                  }}
                />
              </Warning>
            </Box>
          ) : (
            <Options
              userCustomFieldId={userCustomFieldId}
              formValues={formValues}
              onUpdateEnabled={onUpdateEnabled}
              onUpdatePopulation={onUpdatePopulation}
            />
          )}
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
      <BinModal open={binModalOpen} onClose={closeBinModal} />
    </>
  );
};

export default FieldContent;
