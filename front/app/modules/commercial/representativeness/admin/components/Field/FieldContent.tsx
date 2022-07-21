import React, { useState } from 'react';

// hooks
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

// typings
import { Bins } from '../../services/referenceDistribution';

interface Props {
  userCustomFieldId: string;
  formValues: FormValues;
  bins?: Bins;
  submitting: boolean;
  touched: boolean;
  binsSet?: boolean;
  onUpdateEnabled: (optionId: string, enabled: boolean) => void;
  onUpdatePopulation: (optionId: string, population: number | null) => void;
  onSaveBins: (bins: Bins) => void;
  onSubmit: () => void;
}

const FieldContent = ({
  userCustomFieldId,
  formValues,
  bins,
  submitting,
  touched,
  binsSet,
  onUpdateEnabled,
  onUpdatePopulation,
  onSaveBins,
  onSubmit,
}: Props) => {
  const [binModalOpen, setBinModalOpen] = useState(false);
  const { referenceDataUploaded } = useReferenceDistribution(userCustomFieldId);

  if (referenceDataUploaded === undefined) {
    return null;
  }

  const allowSubmit = isSubmittingAllowed(
    formValues,
    touched,
    referenceDataUploaded
  );

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
          {binsSet === false ? (
            <Box mt="12px" mb="12px">
              <Warning>
                <FormattedMessage
                  {...messages.setAgeGroups}
                  values={{
                    setAgeGroupsLink: (
                      <Box
                        as="button"
                        data-testid="set-age-groups-button"
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
              bins={bins}
              onUpdateEnabled={onUpdateEnabled}
              onUpdatePopulation={onUpdatePopulation}
              onEditBins={openBinModal}
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
              data-testid="representativeness-field-save-button"
              onClick={onSubmit}
            />
          </div>
        </Tippy>
      </Box>

      <BinModal
        open={binModalOpen}
        bins={bins}
        onClose={closeBinModal}
        onSave={onSaveBins}
      />
    </>
  );
};

export default FieldContent;
