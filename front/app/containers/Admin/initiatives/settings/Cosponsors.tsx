import React from 'react';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { Box, Toggle, Text, Input } from '@citizenlab/cl2-component-library';

import Error from 'components/UI/Error';
import errorMessages from 'components/UI/Error/messages';

interface Props {
  requireCosponsors: boolean;
  cosponsorsNumber: number;
  onChangeRequireSponsors: (value: boolean) => void;
  onChangeCosponsorsNumber: (value: number) => void;
}

const Cosponsors = ({
  requireCosponsors,
  cosponsorsNumber,
  onChangeRequireSponsors,
  onChangeCosponsorsNumber,
}: Props) => {
  const initiativeCosponsorsAllowed = useFeatureFlag({
    name: 'initiative_cosponsors',
    onlyCheckAllowed: true,
  });
  const { formatMessage } = useIntl();

  if (!initiativeCosponsorsAllowed) return null;

  const handleReactingTresholdOnChange = (value: string) => {
    onChangeCosponsorsNumber(parseInt(value, 10));
  };

  return (
    <SectionField>
      <SubSectionTitle style={{ marginBottom: '0px' }}>
        <FormattedMessage {...messages.cosponsors} />
      </SubSectionTitle>
      <Box mb={requireCosponsors ? '8px' : '0'}>
        <Toggle
          checked={requireCosponsors}
          onChange={() => {
            onChangeRequireSponsors(!requireCosponsors);
          }}
          label={
            // copied from front/app/containers/Admin/initiatives/settings/RequireApprovalToggle.tsx
            <Box ml="8px">
              <Box display="flex">
                <Text
                  color="primary"
                  mb="0px"
                  fontSize="m"
                  style={{ fontWeight: 600 }}
                >
                  <FormattedMessage {...messages.requireCosponsorsLabel} />
                </Text>
              </Box>

              <Text color="coolGrey600" mt="0px" fontSize="m">
                <FormattedMessage {...messages.requireCosponsorsInfo} />
              </Text>
            </Box>
          }
        />
      </Box>
      {requireCosponsors && (
        <>
          <Box mb="10px">
            <Input
              name="cosponsors_number"
              type="number"
              min="1"
              required
              value={cosponsorsNumber?.toString()}
              onChange={handleReactingTresholdOnChange}
              label={formatMessage(messages.cosponsorsNumberLabel)}
            />
          </Box>
          {isNaN(cosponsorsNumber) && (
            <Error text={formatMessage(errorMessages.blank)} />
          )}

          {!isNaN(cosponsorsNumber) && cosponsorsNumber < 1 && (
            <Error text={formatMessage(messages.cosponsorsNumberMinError)} />
          )}
        </>
      )}
    </SectionField>
  );
};

export default Cosponsors;
