import React from 'react';

import {
  Box,
  Title,
  Text,
  Icon,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useVerificationMethod from 'api/verification_methods/useVerificationMethod';

import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { getVerifiedDataList } from './utils';

interface Props {
  opened: boolean;
  onClose: () => void;
}

const StyledLi = styled.li`
  font-size: ${fontSizes.s}px;
  margin-bottom: 8px;
`;

const VerificationModal = ({ opened, onClose }: Props) => {
  const { data: verificationMethod } = useVerificationMethod();
  const localize = useLocalize();

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
      </Box>
    </Modal>
  );
};

export default VerificationModal;
