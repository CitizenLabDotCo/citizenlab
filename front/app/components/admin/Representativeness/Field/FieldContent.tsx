import React, { useState } from 'react';

import { Box, colors, Tooltip } from '@citizenlab/cl2-component-library';

import { Bins } from 'api/reference_distribution/types';
import useReferenceDistributionData from 'api/reference_distribution/useReferenceDistributionData';

import Button from 'components/UI/ButtonWithLink';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { FormValues, isSubmittingAllowed } from 'utils/representativeness/form';

import BinModal from './BinModal';
import Header from './Header';
import messages from './messages';
import Options from './Options';

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
  const { referenceDataUploaded } =
    useReferenceDistributionData(userCustomFieldId);

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
          border={`1px ${colors.divider} solid`}
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

        <Tooltip
          content={<FormattedMessage {...messages.disallowSaveMessage} />}
          disabled={allowSubmit}
          placement="top"
          theme="dark"
        >
          <div>
            <Button
              disabled={!allowSubmit}
              processing={submitting}
              text={<FormattedMessage {...messages.save} />}
              mt="20px"
              width="auto"
              data-testid="representativeness-field-save-button"
              onClick={onSubmit}
            />
          </div>
        </Tooltip>
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
