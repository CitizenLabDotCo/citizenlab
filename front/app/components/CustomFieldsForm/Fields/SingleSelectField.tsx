import React, { useMemo } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
import styled, { useTheme } from 'styled-components';

import useAreas from 'api/areas/useAreas';
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

const StyledBox = styled(Box)<{ selected: boolean }>`
  cursor: pointer;
  &:hover {
    box-shadow: 0 0 0 1px
      ${({ selected }) => (selected ? 'undefined' : colors.borderDark)};
  }
`;

const SingleSelectField = ({
  question,
  scrollErrorIntoView,
  disabled,
}: {
  question: IFlatCustomField;
  scrollErrorIntoView?: boolean;
  disabled?: boolean;
}) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { watch } = useFormContext();
  const { data: areas } = useAreas({});

  const value = watch(question.key);
  const options = useMemo(() => {
    if (question.key === 'u_domicile' || question.key === 'domicile') {
      return [
        ...(areas?.data || []).map((area) => ({
          value: area.id,
          label: localize(area.attributes.title_multiloc),
        })),
        { value: 'outside', label: formatMessage(messages.otherArea) },
      ];
    }
    return extractOptions(question, localize, question.random_option_ordering);
  }, [question, localize, areas, formatMessage]);

  const selectOptions = useMemo(() => {
    // Add empty option at the beginning if field is not required (only for dropdown)
    if (!question.required) {
      return [{ value: '', label: '' }, ...options];
    }
    return options;
  }, [question.required, options]);

  return (
    <>
      {question.dropdown_layout ? (
        <Select
          name={question.key}
          options={selectOptions}
          scrollErrorIntoView={scrollErrorIntoView}
          disabled={disabled}
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
              padding="20px 20px 8px 20px"
              border={
                option.value === value
                  ? `2px solid ${theme.colors.tenantPrimary}`
                  : `1px solid ${theme.colors.borderDark}`
              }
              key={option.value}
              borderRadius="3px"
              selected={option.value === value}
            >
              <Radio
                name={question.key}
                id={option.value}
                key={option.value}
                value={option.value}
                label={option.label}
                buttonColor={theme.colors.tenantPrimary}
                canDeselect
                disabled={disabled}
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
