import React from 'react';

import {
  Box,
  Image,
  Label,
  Radio,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import RadioGroup from 'components/HookForm/RadioGroup';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import defaultPageSvg from './images/default_page_layout.svg';
import mapPageSvg from './images/map_page_layout.svg';
import messages from './messages';

type Props = {
  field: IFlatCustomFieldWithIndex;
  pageLayoutName: string;
};

const PageLayoutSettings = ({ pageLayoutName }: Props) => {
  const isPageLayoutSettingsEnabled = useFeatureFlag({ name: 'form_mapping' });
  const { formatMessage } = useIntl();
  const { control, setValue } = useFormContext();

  return (
    <>
      <Controller
        name={pageLayoutName}
        control={control}
        defaultValue={'default'}
        render={({ field: { ref: _ref, value } }) => {
          return (
            <>
              <Label htmlFor={'page_layout'}>
                {formatMessage(messages.pageType)}
              </Label>
              <RadioGroup name="page_layout" padding="0px">
                <Box display="flex" flexDirection="column" gap="16px" mb="24px">
                  <Box display="flex">
                    <Image src={defaultPageSvg} alt={''} />
                    <Box my="auto" ml="8px">
                      <Radio
                        value={'default'}
                        name="page_layout"
                        id={`page_layout_default`}
                        currentValue={value}
                        label={
                          <Text
                            m="0px"
                            fontWeight={
                              value === 'default' ? 'bold' : undefined
                            }
                          >
                            {formatMessage(messages.normalPage)}
                          </Text>
                        }
                        onChange={() => {
                          setValue(pageLayoutName, 'default', {
                            shouldDirty: true,
                          });
                        }}
                      />
                    </Box>
                  </Box>
                  <Box display="flex">
                    <Image src={mapPageSvg} alt={''} />
                    <Tooltip
                      disabled={isPageLayoutSettingsEnabled}
                      content={formatMessage(messages.notInCurrentLicense)}
                    >
                      <Box my="auto" ml="8px">
                        <Radio
                          disabled={!isPageLayoutSettingsEnabled}
                          value={'map'}
                          name="page_layout"
                          currentValue={value}
                          id={`page_layout_map`}
                          label={
                            <Box display="flex" flexDirection="column">
                              <Text
                                m="0px"
                                fontWeight={
                                  value === 'map' ? 'bold' : undefined
                                }
                                color={
                                  isPageLayoutSettingsEnabled
                                    ? 'black'
                                    : 'grey500'
                                }
                              >
                                {formatMessage(messages.mapBasedPage)}
                              </Text>
                              <Text
                                fontSize="s"
                                color={
                                  isPageLayoutSettingsEnabled
                                    ? 'black'
                                    : 'grey500'
                                }
                                m="0px"
                              >
                                {formatMessage(messages.mapOptionDescription)}
                              </Text>
                            </Box>
                          }
                          onChange={() => {
                            setValue(pageLayoutName, 'map', {
                              shouldDirty: true,
                            });
                          }}
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </RadioGroup>
              {value === 'map' && (
                <Box mb="16px">
                  <Warning>
                    {formatMessage(messages.noMapInputQuestions)}
                  </Warning>
                </Box>
              )}
            </>
          );
        }}
      />
    </>
  );
};

export default PageLayoutSettings;
