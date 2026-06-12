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

import { DEFAULT_ACCESS_DENIED_MESSAGE } from './data';

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
          Customize error message
        </Title>
      }
    >
      <Box p="24px">
        <Text mt="0" color="coolGrey600">
          This is shown to people who try to take the action but don’t meet the
          requirements. By default they see:
        </Text>
        <Box
          my="12px"
          p="12px"
          borderRadius={stylingConsts.borderRadius}
          bgColor={colors.grey50}
          border={`1px solid ${colors.borderLight}`}
        >
          <Text m="0" fontStyle="italic" color="primary">
            “{DEFAULT_ACCESS_DENIED_MESSAGE}”
          </Text>
        </Box>
        <Text mb="16px" color="coolGrey600">
          Override it below for any language. Leave a language empty to keep the
          default for it.
        </Text>

        <InputMultilocWithLocaleSwitcher
          type="text"
          label="Custom message"
          locales={locales}
          valueMultiloc={valueMultiloc}
          onChange={onChange}
        />

        <Box mt="24px" display="flex" justifyContent="flex-end">
          <Button buttonStyle="admin-dark" onClick={onClose}>
            Done
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ErrorMessageModal;
