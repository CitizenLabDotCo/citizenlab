import React, { useMemo } from 'react';

import {
  Box,
  Checkbox,
  useBreakpoint,
  Text,
  Image,
  colors,
} from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';
import styled, { useTheme } from 'styled-components';
import { CLError, RHFErrors } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import Input from 'components/HookForm/Input';
import Error, { TFieldName } from 'components/UI/Error';
import FullscreenImage from 'components/UI/FullscreenImage';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import { extractOptions } from '../../util';

import emptyImageFile from './emptyImage.png';

const HoverBox = styled(Box)<{ selected: boolean }>`
  cursor: pointer;
  &:hover {
    box-shadow: 0 0 0 1px
      ${({ selected }) => (selected ? 'undefined' : colors.borderDark)};
  }
`;

const StyledGrid = styled(Box)<{ isSmallerThanPhone: boolean }>`
  display: grid;
  grid-template-columns: ${({ isSmallerThanPhone }) =>
    isSmallerThanPhone ? '1fr' : 'repeat(2, 50%)'};
  gap: 16px;
  width: 100%;
  justify-content: center;
  padding-left: 8px;
  padding-right: 8px;
  margin-bottom: 16px;
`;

const ImageMultichoiceField = ({
  question,
  scrollErrorIntoView,
}: {
  question: IFlatCustomField;
  scrollErrorIntoView?: boolean;
}) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const theme = useTheme();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const {
    control,
    formState: { errors: formContextErrors },
    watch,
    setValue,
    trigger,
  } = useFormContext();

  const name = question.key;

  const value = watch(name);

  const options = useMemo(() => {
    return extractOptions(question, localize, question.random_option_ordering);
  }, [question, localize]);

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;
  const apiError = errors?.error && ([errors] as CLError[]);

  const onChange = (option) => {
    if (value?.includes(option.value)) {
      setValue(
        name,
        value.filter((v: string) => v !== option.value),
        {
          shouldDirty: true,
          shouldTouch: true,
        }
      );
    } else {
      setValue(name, [...(value || []), option.value], {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
    trigger(name);
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={() => {
          return (
            <StyledGrid isSmallerThanPhone={isSmallerThanPhone}>
              {options.map((option, index: number) => {
                return (
                  <HoverBox
                    key={option.value}
                    borderRadius="3px"
                    border={
                      value?.includes(option.value)
                        ? `2px solid ${theme.colors.tenantPrimary}`
                        : `1px solid ${theme.colors.borderDark}`
                    }
                    selected={value?.includes(option.value)}
                  >
                    <Box
                      as="label"
                      htmlFor={`${name}-checkbox-${index}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <Box p="16px" pb="0">
                        {option.value === 'other' ? (
                          <Image
                            width="100%"
                            src={
                              option.image?.attributes.versions.medium ||
                              emptyImageFile
                            }
                            alt=""
                            style={{ borderRadius: '3px 3px 0 0' }}
                          />
                        ) : (
                          <Box minHeight="200px">
                            <FullscreenImage
                              src={
                                option.image?.attributes.versions.large ||
                                emptyImageFile
                              }
                              altText={option.label}
                            />
                          </Box>
                        )}
                      </Box>
                      <Box display="flex" alignItems="flex-start" p="16px">
                        <Checkbox
                          checkedColor="tenantPrimary"
                          id={`${name}-checkbox-${index}`}
                          data-cy="e2e-image-multichoice-control-checkbox"
                          onChange={() => onChange(option)}
                          checked={value?.includes(option.value)}
                          mr="8px"
                        />
                        <Text color="textPrimary" m="0">
                          {option.label}
                        </Text>
                      </Box>
                    </Box>
                  </HoverBox>
                );
              })}
            </StyledGrid>
          );
        }}
      />

      {value?.includes('other') && (
        <Input
          name={`${name}_other`}
          type="text"
          placeholder={formatMessage(messages.typeYourAnswer)}
        />
      )}
      {validationError && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={scrollErrorIntoView}
        />
      )}
      {apiError && (
        <Error
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </>
  );
};

export default ImageMultichoiceField;
