import React, { useState } from 'react';

import {
  Box,
  IOption,
  Select,
  Text,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';

import { IFlatCustomField, LogicType } from 'api/custom_fields/types';

import Button from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isPageRuleValid } from 'utils/yup/validateLogic';

import messages from '../../messages';
import { findNextPageAfterCurrentPage } from 'components/FormBuilder/utils';
import { getFieldNumbers } from 'components/FormBuilder/components/utils';
import { getTitleFromPageId } from 'components/FormBuilder/components/FormFields/FormField/Logic/utils';

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
  const { formatMessage } = useIntl();
  const { setValue, watch, trigger, control } = useFormContext();
  const logic = watch(name) as LogicType;
  const fields: IFlatCustomField[] = watch('customFields');
  const [selectedPage, setSelectedPage] = useState<string | null | undefined>(
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    logic && logic?.next_page_id ? logic.next_page_id : undefined
  );
  const [showRuleInput, setShowRuleInput] = useState<boolean>(
    selectedPage ? true : false
  );
  const [isRuleInvalid, setIsRuleInvalid] = useState(
    selectedPage
      ? // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        !isPageRuleValid(fields, fieldId, logic?.next_page_id)
      : false
  );
  const onSelectionChange = (page: IOption) => {
    setSelectedPage(page.value);

    const value = {
      next_page_id: page.value,
    };
    setValue(name, value, { shouldDirty: true });
    setIsRuleInvalid(!isPageRuleValid(fields, fieldId, page.value));
    trigger();
  };

  const removeRule = () => {
    setSelectedPage(undefined);
    setShowRuleInput(false);
    setValue(name, {}, { shouldDirty: true });
    if (validationError) {
      trigger();
    }
  };

  // Get the default next page when no rule is set
  const defaultNextPage = getTitleFromPageId(
    findNextPageAfterCurrentPage(fields, fieldId),
    formatMessage(messages.formEnd),
    formatMessage(messages.page),
    getFieldNumbers(fields)
  );

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
                      <Text color="coolGrey600" fontSize="s" fontStyle="italic">
                        <FormattedMessage {...messages.pageRuleLabel} />{' '}
                        {defaultNextPage}
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
