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

import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
  LogicType,
} from 'api/custom_fields/types';

import { getTitleFromPageId } from 'components/FormBuilder/components/FormFields/FormField/Logic/utils';
import { getFieldNumbers } from 'components/FormBuilder/components/utils';
import { findNextPageAfterCurrentPage } from 'components/FormBuilder/utils';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isPageRuleValid } from 'utils/yup/validateLogic';

import messages from '../../messages';
import usePageList from '../usePageList';

import { PageListType } from './index';

type RuleInputProps = {
  field: IFlatCustomFieldWithIndex;
  name: string;
  fieldId: string;
  validationError?: string;
};

export const PageRuleInput = ({
  field,
  name,
  fieldId,
  validationError,
}: RuleInputProps) => {
  const { formatMessage } = useIntl();
  const { setValue, watch, trigger, control } = useFormContext();
  const pageOptions = usePageList();
  const fieldType = watch(`customFields.${field.index}.input_type`);
  const logic = watch(name) as LogicType | undefined;
  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const [selectedPage, setSelectedPage] = useState<string | null | undefined>(
    logic?.next_page_id ? logic.next_page_id : undefined
  );
  const [showRuleInput, setShowRuleInput] = useState<boolean>(
    selectedPage ? true : false
  );
  const [isRuleInvalid, setIsRuleInvalid] = useState(
    selectedPage
      ? !isPageRuleValid(formCustomFields, fieldId, logic?.next_page_id)
      : false
  );
  const onSelectionChange = (page: IOption) => {
    setSelectedPage(page.value);

    const value = {
      next_page_id: page.value,
    };
    setValue(name, value, { shouldDirty: true });
    setIsRuleInvalid(!isPageRuleValid(formCustomFields, fieldId, page.value));
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
    findNextPageAfterCurrentPage(formCustomFields, fieldId),
    formatMessage(messages.page),
    getFieldNumbers(formCustomFields),
    formCustomFields,
    formatMessage(messages.lastPage)
  );

  // Which page is the current question on?
  // Technically there should always be a current page ID and null should never be returned
  const getCurrentPageId = (questionId: string): string | null => {
    if (fieldType === 'page') return field.id;

    let pageId: string | null = null;
    for (const field of formCustomFields) {
      if (field.input_type === 'page') pageId = field.id;
      if (field.id === questionId) return pageId;
    }
    return null;
  };

  // Current and previous pages should be disabled in select options
  const pages: PageListType = pageOptions.map((page) => {
    return {
      ...page,
      disabled: page.value === getCurrentPageId(field.id) ? false : true,
    };
  });

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
                      </Box>
                      <Box ml="auto" flexGrow={0} flexShrink={0}>
                        <ButtonWithLink
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
                        </ButtonWithLink>
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
                      <ButtonWithLink
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
                          name="edit"
                        />
                      </ButtonWithLink>
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
