import React, { useState } from 'react';

// components
import { Box, IOption, Select, Text } from '@citizenlab/cl2-component-library';

// intl
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Controller, useFormContext } from 'react-hook-form';

type RuleInputProps = {
  name: string;
  pages:
    | {
        value: string | undefined;
        label: string;
      }[]
    | undefined;
};

type PageLogicType = { next_page_id: string };

export const PageRuleInput = ({ pages, name }: RuleInputProps) => {
  const { setValue, watch, control } = useFormContext();
  const logic = watch(name) as PageLogicType;
  const [selectedPage, setSelectedPage] = useState<string | null | undefined>(
    logic && logic?.next_page_id ? logic.next_page_id : undefined
  );
  const pagesWithEmptyOption = [
    { value: '', label: '' },
    ...(pages ? pages : []),
  ];
  const onSelectionChange = (page: IOption) => {
    setSelectedPage(page.value);
    const isPageEmpty = page.value === '' && page.label === '';

    const value = isPageEmpty
      ? {}
      : {
          next_page_id: page.value.toString(),
        };
    setValue(name, value);
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field: { ref: _ref } }) => {
          return (
            <>
              <Box mb="24px" display="flex">
                <Box
                  flexGrow={0}
                  flexShrink={0}
                  width="100%"
                  data-cy="e2e-rule-input-select"
                >
                  {pages && (
                    <Select
                      value={selectedPage}
                      options={pagesWithEmptyOption}
                      label={
                        <Text
                          mb="0px"
                          margin="0px"
                          color="coolGrey600"
                          fontSize="s"
                        >
                          <FormattedMessage {...messages.ruleForPageLabel} />
                        </Text>
                      }
                      onChange={onSelectionChange}
                    />
                  )}
                </Box>
              </Box>
            </>
          );
        }}
      />
    </>
  );
};
