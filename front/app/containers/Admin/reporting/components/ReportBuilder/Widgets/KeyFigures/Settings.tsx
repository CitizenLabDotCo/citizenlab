import React from 'react';

import {
  Box,
  Button,
  IconButton,
  Input,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

import { Props, Figure } from '.';

const Settings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    figures,
  } = useNode((node) => ({
    figures: ((node.data.props as Props).figures ?? []) as Figure[],
  }));

  const edit = (index: number, patch: Partial<Figure>) => {
    setProp((props: Props) => {
      const next = [...(props.figures ?? [])];
      next[index] = { ...next[index], ...patch };
      props.figures = next;
    });
  };

  return (
    <Box mb="20px">
      {figures.map((figure, index) => (
        <Box
          key={index}
          mb="20px"
          pb="16px"
          borderBottom={`1px solid ${colors.divider}`}
        >
          <Box display="flex" justifyContent="flex-end">
            <IconButton
              iconName="delete"
              a11y_buttonActionMessage={formatMessage(messages.removeFigure)}
              iconColor={colors.textSecondary}
              iconColorOnHover={colors.red600}
              onClick={() => {
                setProp((props: Props) => {
                  props.figures = (props.figures ?? []).filter(
                    (_, position) => position !== index
                  );
                });
              }}
            />
          </Box>
          <Box mb="12px">
            <Input
              type="text"
              label={formatMessage(messages.valueLabel)}
              value={figure.value ?? ''}
              onChange={(value) => edit(index, { value })}
            />
          </Box>
          <InputMultilocWithLocaleSwitcher
            label={
              <Text variant="bodyM" color="textSecondary" mb="0">
                {formatMessage(messages.captionLabel)}
              </Text>
            }
            type="text"
            valueMultiloc={figure.label}
            onChange={(label: Multiloc) => edit(index, { label })}
          />
        </Box>
      ))}

      <Button
        buttonStyle="secondary-outlined"
        icon="plus"
        onClick={() => {
          setProp((props: Props) => {
            props.figures = [...(props.figures ?? []), { value: '' }];
          });
        }}
      >
        {formatMessage(messages.addFigure)}
      </Button>
    </Box>
  );
};

export default Settings;
