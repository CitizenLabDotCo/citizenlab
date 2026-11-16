import React from 'react';

import { Box, Radio, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

// Heading level of a widget's title. Optional because craft.json layouts saved
// before this setting existed don't have it; those keep rendering an H1.
export type TitleVariant = 'h1' | 'h2';
export const DEFAULT_TITLE_VARIANT: TitleVariant = 'h1';

const OPTIONS = [
  { value: 'h1', message: messages.headingLevel1 },
  { value: 'h2', message: messages.headingLevel2 },
] as const;

interface Props {
  name: string;
}

const TitleVariantSetting = ({ name }: Props) => {
  const {
    actions: { setProp },
    titleVariant,
  } = useNode((node) => ({
    titleVariant: node.data.props.titleVariant as TitleVariant | undefined,
  }));

  return (
    <fieldset>
      <legend>
        <FormattedMessage {...messages.titleHeadingLevel} />
      </legend>
      <Text mt="4px" mb="12px" variant="bodyS" color="textSecondary">
        <FormattedMessage {...messages.titleHeadingLevelDescription} />
      </Text>
      <Box>
        {OPTIONS.map(({ value, message }) => (
          <Radio
            key={value}
            id={`${name}-${value}`}
            name={name}
            value={value}
            currentValue={titleVariant ?? DEFAULT_TITLE_VARIANT}
            label={<FormattedMessage {...message} />}
            onChange={(newValue: TitleVariant) =>
              setProp((props) => (props.titleVariant = newValue))
            }
            isRequired
          />
        ))}
      </Box>
    </fieldset>
  );
};

export default TitleVariantSetting;
