import React from 'react';

// components
import {
  Toggle,
  Box,
  IconTooltip,
  Input,
  Label,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { Controller, useFormContext } from 'react-hook-form';

const StyledLabel = styled(Label)`
  height: 100%;
  margin-top: auto;
  margin-bottom: auto;
`;

type Props = {
  minimumSelectCountName: string;
  maximumSelectCountName: string;
  selectCountToggleName: string;
  selectOptionsName: string;
};

const MultiselectSettings = ({
  minimumSelectCountName,
  maximumSelectCountName,
  selectCountToggleName,
  selectOptionsName,
}: Props) => {
  const { formatMessage } = useIntl();
  const { control, setValue, trigger, watch } = useFormContext();

  return (
    <Box mb="24px">
      <Box mb="16px">
        <Controller
          name={selectCountToggleName}
          control={control}
          defaultValue={false}
          render={({ field: { ref: _ref, value } }) => {
            return (
              <Toggle
                checked={value}
                onChange={() => {
                  setValue(selectCountToggleName, !value);
                  trigger();
                }}
                label={
                  <Box display="flex">
                    {formatMessage(messages.limitNumberAnswers)}
                    <Box pl="4px">
                      <IconTooltip
                        placement="top-start"
                        content={formatMessage(
                          messages.limitNumberAnswersTooltip
                        )}
                      />
                    </Box>
                  </Box>
                }
              />
            );
          }}
        />
      </Box>

      {watch(selectCountToggleName) && (
        <Box ml="16px">
          <Box mb="8px" display="flex">
            <Box minWidth="100px" my="auto">
              <StyledLabel htmlFor="minimumInput" value="Minimum" />
            </Box>
            <Controller
              name={minimumSelectCountName}
              control={control}
              defaultValue={[]}
              render={({ field: { ref: _ref, value } }) => {
                return (
                  <Input
                    value={value}
                    name={minimumSelectCountName}
                    id="minimumInput"
                    type="number"
                    max={watch(selectOptionsName).length}
                    min="1"
                    size="small"
                    onChange={(value) => {
                      setValue(minimumSelectCountName, value);
                      trigger();
                    }}
                  />
                );
              }}
            />
          </Box>
          <Box display="flex">
            <Box minWidth="100px" my="auto">
              <StyledLabel
                htmlFor="maximumInput"
                value={formatMessage(messages.maximum)}
              />
            </Box>
            <Controller
              name={maximumSelectCountName}
              control={control}
              defaultValue={[]}
              render={({ field: { ref: _ref, value } }) => {
                return (
                  <Input
                    value={value}
                    name={maximumSelectCountName}
                    id="maximumInput"
                    type="number"
                    size="small"
                    min={watch(minimumSelectCountName)}
                    max={watch(selectOptionsName).length}
                    onChange={(value) => {
                      setValue(maximumSelectCountName, value);
                      trigger();
                    }}
                  />
                );
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MultiselectSettings;
