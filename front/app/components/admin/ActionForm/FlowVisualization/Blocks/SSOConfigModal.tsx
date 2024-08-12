import React from 'react';

import {
  Box,
  Title,
  Text,
  Icon,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';

import { ActionMetadata } from 'api/verification_methods/types';

import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { getVerifiedDataList } from './utils';

interface Props {
  opened: boolean;
  verificationMethodMetadata: ActionMetadata;
  onClose: () => void;
}

const SSOConfigModal = ({
  opened,
  verificationMethodMetadata,
  onClose,
}: Props) => {
  const localize = useLocalize();
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
        <Box mb="24px">
          <Text fontWeight="bold">
            <FormattedMessage {...messages.verifiedData} />
          </Text>
          <ul>
            {verifiedDataList.map((attribute, index) => (
              <li
                key={index}
                style={{ fontSize: fontSizes.s, marginBottom: '8px' }}
              >
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
              </li>
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

export default SSOConfigModal;
