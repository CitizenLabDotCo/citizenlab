import React from 'react';

import {
  Box,
  Image,
  Label,
  Radio,
  Text,
} from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import RadioGroup from 'components/HookForm/RadioGroup';

import { useIntl } from 'utils/cl-intl';

import defaultPageSvg from './images/default_page_layout.svg';
import mapPageSvg from './images/map_page_layout.svg';
import messages from './messages';

type Props = {
  field: IFlatCustomFieldWithIndex;
  pageLayoutName: string;
};

const PageLayoutSettings = ({ pageLayoutName }: Props) => {
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
                        key={'default'}
                        onChange={() => {
                          setValue(pageLayoutName, 'default');
                        }}
                      />
                    </Box>
                  </Box>

                  <Box display="flex">
                    <Image src={mapPageSvg} alt={''} />
                    <Box my="auto" ml="8px">
                      <Radio
                        value={'map'}
                        name="page_layout"
                        currentValue={value}
                        id={`page_layout_map`}
                        label={
                          <Box display="flex" flexDirection="column">
                            <Text
                              m="0px"
                              fontWeight={value === 'map' ? 'bold' : undefined}
                            >
                              {formatMessage(messages.mapBasedPage)}
                            </Text>
                            <Text fontSize="s" color={'grey700'} m="0px">
                              {formatMessage(messages.mapOptionDescription)}
                            </Text>
                          </Box>
                        }
                        key={'map'}
                        onChange={() => {
                          setValue(pageLayoutName, 'map');
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </RadioGroup>
            </>
          );
        }}
      />
    </>
  );
};

export default PageLayoutSettings;
