import React, { useState } from 'react';

import {
  Box,
  Input,
  Toggle,
  Label,
  Text,
} from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  pageButtonLabelMultilocName: string;
  pageButtonLinkName: string;
};
const PageButtonSettings = ({
  pageButtonLabelMultilocName,
  pageButtonLinkName,
}: Props) => {
  const locale = useLocale();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { control, watch, setValue } = useFormContext();

  const [useCustomButton, setUseCustomButton] = useState(
    watch(pageButtonLinkName)
  );

  return (
    <Box mb="16px" id="e2e-custom-button-toggle">
      <Toggle
        checked={useCustomButton}
        label={formatMessage(messages.useCustomButton)}
        onChange={() => {
          setValue(pageButtonLabelMultilocName, {});
          setValue(pageButtonLinkName, '');
          setUseCustomButton(!useCustomButton);
        }}
      />

      {useCustomButton && (
        <Box pt="20px">
          <Controller
            name={pageButtonLinkName}
            control={control}
            defaultValue={'default'}
            render={({ field: { ref: _ref, value } }) => {
              return (
                <Box mb="28px" data-cy="e2e-custom-button-link">
                  <Label htmlFor={'page_button_link'}>
                    {formatMessage(messages.buttonLink)}
                  </Label>
                  <Input
                    id="page_button_link"
                    type="text"
                    value={value}
                    onChange={(value) => setValue(pageButtonLinkName, value)}
                  />
                </Box>
              );
            }}
          />

          <SectionField>
            <InputMultilocWithLocaleSwitcher
              initiallySelectedLocale={locale}
              maxCharCount={25}
              name={pageButtonLabelMultilocName}
              label={formatMessage(messages.buttonLabel)}
              id="e2e-custom-button-label"
            />
          </SectionField>

          {localize(watch(pageButtonLabelMultilocName)) && (
            <Box ml="auto" display="flex" gap="16px" mb="30px">
              <Text color="textSecondary" my="auto">
                {formatMessage(messages.preview)}
              </Text>
              <ButtonWithLink
                linkTo={watch(pageButtonLinkName)}
                openLinkInNewTab={true}
              >
                {localize(watch(pageButtonLabelMultilocName))}
              </ButtonWithLink>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PageButtonSettings;
