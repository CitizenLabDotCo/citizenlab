import React, { useMemo } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import { useFormContext } from 'react-hook-form';
import styled, { useTheme } from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import Input from 'components/HookForm/Input';
import RadioGroup from 'components/HookForm/RadioGroup';
import Radio from 'components/HookForm/RadioGroup/Radio';
import Select from 'components/HookForm/Select';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { extractOptions } from '../util';

const StyledBox = styled(Box)`
  cursor: pointer;
  background-color: ${colors.grey100};
  &:hover {
    background-color: ${darken(0.05, colors.grey100)};
  }
`;

const SingleSelectField = ({
  question,
  scrollErrorIntoView,
}: {
  question: IFlatCustomField;
  scrollErrorIntoView?: boolean;
}) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { watch } = useFormContext();

  const value = watch(question.key);

  const options = useMemo(() => {
    return extractOptions(question, localize, question.random_option_ordering);
  }, [question, localize]);

  return (
    <>
      {question.dropdown_layout ? (
        <Select
          name={question.key}
          options={options}
          scrollErrorIntoView={scrollErrorIntoView}
        />
      ) : (
        <RadioGroup name={question.key} padding="0px">
          <ScreenReaderOnly>
            <legend>{localize(question.title_multiloc)}</legend>
          </ScreenReaderOnly>
          {options.map((option) => (
            <StyledBox
              style={{ cursor: 'pointer' }}
              mb="12px"
              padding="20px "
              border={
                options.includes(option.value)
                  ? `2px solid ${theme.colors.tenantPrimary}`
                  : `1px solid ${theme.colors.tenantPrimary}`
              }
              background={theme.colors.tenantPrimaryLighten95}
              key={option.value}
              borderRadius="3px"
            >
              <Radio
                name={question.key}
                id={option.value}
                key={option.value}
                value={option.value}
                label={option.label}
              />
            </StyledBox>
          ))}
        </RadioGroup>
      )}
      {value === 'other' && (
        <Input
          name={`${question.key}_other`}
          type="text"
          placeholder={formatMessage(messages.typeYourAnswer)}
        />
      )}
    </>
  );
};

export default SingleSelectField;
