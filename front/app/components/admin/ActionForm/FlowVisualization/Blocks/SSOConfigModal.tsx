import React from 'react';

import {
  Box,
  Title,
  Text,
  Icon,
  fontSizes,
  colors,
  Radio,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useVerificationMethodVerifiedActions from 'api/verification_methods/useVerificationMethodVerifiedActions';

import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { MessageDescriptor, FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { getVerifiedDataList } from './utils';

const StyledLi = styled.li`
  font-size: ${fontSizes.s}px;
  margin-bottom: 8px;
`;

interface Props {
  opened: boolean;
  verificationExpiry: number | null;
  onClose: () => void;
  onChangeVerificationExpiry: (value: number | null) => void;
}

const SSOConfigModal = ({
  opened,
  verificationExpiry,
  onClose,
  onChangeVerificationExpiry,
}: Props) => {
  const localize = useLocalize();

  const { data: verificationMethod } = useVerificationMethodVerifiedActions();

  const verificationMethodMetadata =
    verificationMethod?.data.attributes.method_metadata;

  if (!verificationMethodMetadata) return null;

  const verifiedDataList = getVerifiedDataList(
    verificationMethodMetadata,
    localize
  );

  return (
    <Modal
      opened={opened}
      close={onClose}
      niceHeader={true}
      header={
        <Title ml="20px" variant="h3" color="primary">
          <FormattedMessage
            {...messages.xVerification}
            values={{
              verificationMethod: verificationMethodMetadata.name,
            }}
          />
        </Title>
      }
      closeOnClickOutside={false}
      width={'550px'}
    >
      <Box m="20px">
        <Box>
          <Text fontWeight="bold">
            <FormattedMessage {...messages.howRecentlyShouldUsersBeVerified} />
          </Text>
          <Radio
            id={'verification-frequency-every-30-min-radio'}
            name={'verification-frequency-every-30-min-radio'}
            isRequired
            value={0}
            currentValue={verificationExpiry}
            label={<RadioLabel message={messages.verificationFrequency30Min} />}
            onChange={onChangeVerificationExpiry}
          />
          <Radio
            id={'verification-frequency-every-7-days-radio'}
            name={'verification-frequency-every-7-days-radio'}
            isRequired
            value={7}
            currentValue={verificationExpiry}
            label={<RadioLabel message={messages.verificationFrequency7Days} />}
            onChange={onChangeVerificationExpiry}
          />
          <Radio
            id={'verification-frequency-every-30-days-radio'}
            name={'verification-frequency-every-30-days-radio'}
            isRequired
            value={30}
            currentValue={verificationExpiry}
            label={
              <RadioLabel message={messages.verificationFrequency30Days} />
            }
            onChange={onChangeVerificationExpiry}
          />
          <Radio
            id={'verification-frequency-once-radio'}
            name={'verification-frequency-once-radio'}
            isRequired
            value={''}
            currentValue={verificationExpiry === null ? '' : verificationExpiry}
            label={<RadioLabel message={messages.verificationFrequencyOnce} />}
            onChange={(value) => {
              onChangeVerificationExpiry(value === '' ? null : value);
            }}
          />
        </Box>
        <Box mb="24px">
          <Text fontWeight="bold">
            <FormattedMessage {...messages.dataReturned} />
          </Text>
          <ul>
            {verifiedDataList.map((attribute, index) => (
              <StyledLi key={index}>
                <span style={{ marginRight: '4px' }}>{attribute.label}</span>
                {attribute.locked && (
                  <Icon
                    name="lock"
                    width="14px"
                    height="14px"
                    transform="translate(0,-1)"
                    fill={colors.grey700}
                  />
                )}
              </StyledLi>
            ))}
          </ul>
        </Box>
        <Warning>
          <FormattedMessage {...messages.useSmartGroups} />
        </Warning>
      </Box>
    </Modal>
  );
};

interface RadioLabelProps {
  message: MessageDescriptor;
}

const RadioLabel = ({ message }: RadioLabelProps) => (
  <Text mt="0px" mb="0px" variant="bodyS">
    <FormattedMessage {...message} />
  </Text>
);

export default SSOConfigModal;
