import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

// components
import { Box, IOption, Select, Text } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';

// intl
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// types
import { IFlatCustomField, LogicType } from 'services/formCustomFields';
import { isPageRuleValid } from 'utils/yup/validateLogic';

type RuleInputProps = {
  name: string;
  fieldId: string;
  validationError?: string;
  pages:
    | {
        value: string | undefined;
        label: string;
      }[]
    | undefined;
};

export const PageRuleInput = ({
  pages,
  name,
  fieldId,
  validationError,
}: RuleInputProps) => {
  const { setValue, watch, control } = useFormContext();
  const logic = watch(name) as LogicType;
  const fields: IFlatCustomField[] = watch('customFields');
  const [selectedPage, setSelectedPage] = useState<string | null | undefined>(
    logic && logic?.next_page_id ? logic.next_page_id : undefined
  );
  const [isRuleInvalid, setIsRuleInvalid] = useState(
    selectedPage
      ? !isPageRuleValid(fields, fieldId, logic?.next_page_id)
      : false
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
    setIsRuleInvalid(!isPageRuleValid(fields, fieldId, page.value));
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
                  {validationError && isRuleInvalid && (
                    <Box mb="12px">
                      <Error
                        marginTop="8px"
                        marginBottom="8px"
                        text={validationError}
                        scrollIntoView={false}
                      />
                    </Box>
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
