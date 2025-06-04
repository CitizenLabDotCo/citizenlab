import React, { useMemo } from 'react';

import {
  Box,
  Checkbox,
  useBreakpoint,
  Text,
  Image,
} from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';
import styled, { useTheme } from 'styled-components';
import { CLError, RHFErrors } from 'typings';

import { useCustomFieldOptionImages } from 'api/content_field_option_images/useCustomFieldOptionImage';
import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import Input from 'components/HookForm/Input';
import Error, { TFieldName } from 'components/UI/Error';
import FullscreenImage from 'components/UI/FullscreenImage';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import { extractOptions } from '../../util';

import imageFile from './emptyImage.png';

const HoverBox = styled(Box)<{ hoverColor: string }>`
  cursor: pointer;
  &:hover {
    background-color: ${({ hoverColor }) => hoverColor};
  }
`;

const ImageMultichoiceField = ({
  question,
  scrollErrorIntoView,
}: {
  question: IFlatCustomField;
  scrollErrorIntoView?: boolean;
}) => {
  const imageIds =
    question.options
      ?.map((option) => option.image_id)
      .filter((imageId): imageId is string => typeof imageId === 'string') ||
    [];
  const customFieldOptionImages = useCustomFieldOptionImages(imageIds);
  const isSmallerThanPhone = useBreakpoint('phone');
  const theme = useTheme();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const {
    control,
    formState: { errors: formContextErrors },
    watch,
    setValue,
  } = useFormContext();

  const name = question.key;

  const value = watch(name);

  const options = useMemo(() => {
    return extractOptions(
      question,
      localize,
      question.random_option_ordering
    ).map((option) => {
      return {
        ...option,
        imageId:
          customFieldOptionImages.find(
            (query) =>
              query.data?.data.id ===
              question.options?.find((opt) => opt.key === option.value)
                ?.image_id
          )?.data?.data.attributes.versions.large || imageFile,
      };
    });
  }, [question, localize, customFieldOptionImages]);

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
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={() => {
          return (
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallerThanPhone
                  ? '1fr'
                  : 'repeat(2, 50%)',
                gap: '16px',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {options.map((option, index: number) => {
                return (
                  <HoverBox
                    key={option.value}
                    borderRadius="3px"
                    bgColor={theme.colors.tenantPrimaryLighten95}
                    border={
                      value?.includes(option.value)
                        ? `2px solid ${theme.colors.tenantPrimary}`
                        : `1px solid ${theme.colors.tenantPrimary}`
                    }
                    hoverColor={theme.colors.tenantPrimaryLighten75}
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
                            src={option.imageId || imageFile}
                            alt=""
                            style={{ borderRadius: '3px 3px 0 0' }}
                          />
                        ) : (
                          <Box minHeight="200px">
                            <FullscreenImage
                              src={option.imageId || imageFile}
                              altText={option.label}
                            />
                          </Box>
                        )}
                      </Box>
                      <Box display="flex" alignItems="flex-start" p="16px">
                        <Checkbox
                          checkedColor="tenantPrimary"
                          usePrimaryBorder={true}
                          id={`${name}-checkbox-${index}`}
                          data-cy="e2e-image-multichoice-control-checkbox"
                          onChange={() => onChange(option)}
                          checked={value?.includes(option.value)}
                          mr="8px"
                        />
                        <Text color="tenantPrimary" m="0">
                          {option.label}
                        </Text>
                      </Box>
                    </Box>
                  </HoverBox>
                );
              })}
            </Box>
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
