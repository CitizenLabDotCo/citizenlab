// Override the "you don't meet the requirements" message, per configured
// language.

import React from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  InputMultilocWithLocaleSwitcher,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';


import messages from './messages';

interface Props {
  opened: boolean;
  valueMultiloc: Multiloc;
  onClose: () => void;
  onChange: (valueMultiloc: Multiloc) => void;
}

const ErrorMessageModal = ({
  opened,
  valueMultiloc,
  onClose,
  onChange,
}: Props) => {
  const locales = useAppConfigurationLocales();

  if (!locales) return null;

  return (
    <Modal
      opened={opened}
      close={onClose}
      niceHeader
      width="560px"
      header={
        <Title ml="20px" variant="h3" color="primary">
          <FormattedMessage {...messages.modalTitle} />
        </Title>
      }
    >
      <Box p="24px">
        <Text mt="0" color="coolGrey600">
          <FormattedMessage {...messages.thisIsShownToPeople} />
        </Text>
        <Box
          my="12px"
          p="12px"
          borderRadius={stylingConsts.borderRadius}
          bgColor={colors.grey50}
          border={`1px solid ${colors.borderLight}`}
        >
          <Text m="0" fontStyle="italic" color="primary">
            <FormattedMessage {...messages.defaultErrorMessage} />
          </Text>
        </Box>
        <Text mb="16px" color="coolGrey600">
          <FormattedMessage {...messages.overrideItBelow} />
        </Text>

        <InputMultilocWithLocaleSwitcher
          type="text"
          label={<FormattedMessage {...messages.customMessage} />}
          locales={locales}
          valueMultiloc={valueMultiloc}
          onChange={onChange}
        />

        <Box mt="24px" display="flex" justifyContent="flex-end">
          <Button buttonStyle="admin-dark" onClick={onClose}>
            <FormattedMessage {...messages.done} />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ErrorMessageModal;
