import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

// components
import {
  Box,
  IOption,
  Select,
  Text,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import Button from 'components/UI/Button';

// intl
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// types
import { IFlatCustomField, LogicType } from 'services/formCustomFields';

// utils
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
  const { setValue, watch, trigger, control } = useFormContext();
  const logic = watch(name) as LogicType;
  const fields: IFlatCustomField[] = watch('customFields');
  const [selectedPage, setSelectedPage] = useState<string | null | undefined>(
    logic && logic?.next_page_id ? logic.next_page_id : undefined
  );
  const [showRuleInput, setShowRuleInput] = useState<boolean>(
    selectedPage ? true : false
  );
  const [isRuleInvalid, setIsRuleInvalid] = useState(
    selectedPage
      ? !isPageRuleValid(fields, fieldId, logic?.next_page_id)
      : false
  );
  const onSelectionChange = (page: IOption) => {
    setSelectedPage(page.value);

    const value = {
      next_page_id: page.value,
    };
    setValue(name, value);
    setIsRuleInvalid(!isPageRuleValid(fields, fieldId, page.value));
    trigger();
  };

  const removeRule = () => {
    setSelectedPage(undefined);
    setShowRuleInput(false);
    setValue(name, {});
    if (validationError) {
      trigger();
    }
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
              <Box display="flex" flexDirection="column">
                {showRuleInput ? (
                  <>
                    <Box
                      mb={validationError && isRuleInvalid ? '8px' : '24px'}
                      display="flex"
                    >
                      <Box
                        flexGrow={0}
                        flexShrink={0}
                        width="320px"
                        data-cy="e2e-rule-input-select"
                      >
                        {pages && (
                          <Select
                            value={selectedPage}
                            options={pages}
                            label={
                              <Text
                                mb="0px"
                                margin="0px"
                                color="coolGrey600"
                                fontSize="s"
                              >
                                <FormattedMessage {...messages.pageRuleLabel} />
                              </Text>
                            }
                            onChange={onSelectionChange}
                          />
                        )}
                      </Box>
                      <Box ml="auto" flexGrow={0} flexShrink={0}>
                        <Button
                          onClick={removeRule}
                          mt="36px"
                          buttonStyle="text"
                          margin="0px"
                          padding="0px"
                        >
                          <Icon
                            width="24px"
                            fill={`${colors.coolGrey600}`}
                            name="delete"
                          />
                        </Button>
                      </Box>
                    </Box>
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
                  </>
                ) : (
                  <Box mb="8px" display="flex">
                    <Box
                      width="215px"
                      flexGrow={0}
                      flexShrink={0}
                      flexWrap="wrap"
                    >
                      <Text color="coolGrey600" fontSize="s">
                        <FormattedMessage {...messages.pageRuleLabel} />
                      </Text>
                    </Box>
                    <Box
                      ml="auto"
                      width="30px"
                      mt="12px"
                      flexGrow={0}
                      flexShrink={0}
                    >
                      <Button
                        onClick={() => {
                          setShowRuleInput(true);
                        }}
                        buttonStyle="text"
                        margin="0px"
                        padding="0px"
                        data-cy="e2e-add-rule-button"
                      >
                        <Icon
                          width="24px"
                          fill={`${colors.coolGrey600}`}
                          name="plus-circle"
                        />
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </>
          );
        }}
      />
    </>
  );
};
