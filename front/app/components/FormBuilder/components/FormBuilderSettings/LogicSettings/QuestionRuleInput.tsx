import React, { useState } from 'react';

import {
  Box,
  colors,
  Icon,
  IOption,
  Select,
  Text,
} from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';

import {
  IFlatCustomField,
  LogicType,
  QuestionRuleType,
} from 'api/custom_fields/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { isRuleValid } from 'utils/yup/validateLogic';

import messages from '../../messages';

type QuestionRuleInputProps = {
  fieldId: string;
  validationError: string | undefined;
  answer: { key: string | number | undefined; label: string | undefined };
  name: string;
  pages:
    | {
        value: string | undefined;
        label: string;
      }[]
    | undefined;
};

export const QuestionRuleInput = ({
  fieldId,
  pages,
  name,
  answer,
  validationError,
}: QuestionRuleInputProps) => {
  const { formatMessage } = useIntl();
  const { setValue, watch, trigger, control } = useFormContext();
  const field: IFlatCustomField = watch(name);
  const logic: LogicType = field.logic;
  const rules = logic.rules;
  const fields: IFlatCustomField[] = watch('customFields');
  const initialValue: QuestionRuleType | undefined = rules
    ? rules.find((rule) => rule.if === answer.key)
    : undefined;
  const [ruleIsInvalid, setRuleIsInvalid] = useState(
    initialValue ? !isRuleValid(initialValue, fieldId, fields) : false
  );
  const [selectedPage, setSelectedPage] = useState<string | null | undefined>(
    initialValue ? initialValue.goto_page_id : undefined
  );
  const [showRuleInput, setShowRuleInput] = useState<boolean>(!!initialValue);

  const onSelectionChange = (page: IOption) => {
    setSelectedPage(page.value);

    // Remove any existing rule
    if (logic.rules && logic.rules.length > 0) {
      logic.rules = logic.rules.filter((rule) => rule.if !== answer.key);
    }

    if (answer.key) {
      // Generate new rule
      const newRule = {
        if: answer.key,
        goto_page_id: page.value.toString(),
      };
      setRuleIsInvalid(!isRuleValid(newRule, fieldId, fields));

      if (logic.rules) {
        const newRulesArray = logic.rules;
        newRulesArray.push(newRule);
        logic.rules = newRulesArray;
      } else {
        logic.rules = [newRule];
      }
      setValue(name, { ...field, logic }, { shouldDirty: true });
      trigger();
    }
  };

  const removeRuleForAnswer = () => {
    // Remove any existing rule
    if (logic.rules && logic.rules.length > 0) {
      logic.rules = logic.rules.filter((rule) => rule.if !== answer.key);
    }
    // Update rule variable
    setValue(name, { ...field, logic }, { shouldDirty: true });
    trigger();
  };

  const isCatchAllLogicRule =
    answer.key &&
    ['any_other_answer', 'no_answer'].includes(answer.key.toString());

  const ruleForAnswerLabel = ['multiselect', 'multiselect_image'].includes(
    field.input_type
  )
    ? formatMessage(messages.ruleForAnswerLabelMultiselect)
    : formatMessage(messages.ruleForAnswerLabel);

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field: { ref: _ref, onBlur } }) => {
          return (
            <>
              <Box
                mb="0px"
                display="flex"
                borderTop={`1px solid ${colors.divider}`}
                py="8px"
                onBlur={() => {
                  onBlur();
                  trigger();
                }}
              >
                {isCatchAllLogicRule ? (
                  <Box
                    width="305px"
                    flexGrow={0}
                    flexShrink={0}
                    flexWrap="wrap"
                  >
                    <Text color={'coolGrey600'} fontSize="s" fontStyle="italic">
                      {answer.label}
                    </Text>
                  </Box>
                ) : (
                  <>
                    <Box
                      width="90px"
                      flexGrow={0}
                      flexShrink={0}
                      flexWrap="wrap"
                    >
                      <Text color={'coolGrey600'} fontSize="s">
                        {ruleForAnswerLabel}
                      </Text>
                    </Box>
                    <Box
                      width="215px"
                      flexGrow={0}
                      flexShrink={0}
                      flexWrap="wrap"
                    >
                      <Text fontSize="s" fontWeight="bold">
                        {answer.label}
                      </Text>
                    </Box>
                  </>
                )}
                {!showRuleInput && (
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
                        name="plus-circle"
                      />
                    </ButtonWithLink>
                  </Box>
                )}
              </Box>
              {showRuleInput && (
                <Box
                  mb={validationError && ruleIsInvalid ? '8px' : '24px'}
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
                            <FormattedMessage
                              {...messages.goToPageInputLabel}
                            />
                          </Text>
                        }
                        onChange={onSelectionChange}
                      />
                    )}
                  </Box>
                  <Box ml="auto" flexGrow={0} flexShrink={0}>
                    <ButtonWithLink
                      onClick={() => {
                        setSelectedPage(undefined);
                        setShowRuleInput(false);
                        removeRuleForAnswer();
                      }}
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
              )}
              {validationError && ruleIsInvalid && (
                <Box mb="12px" data-cy="e2e-rule-input-error">
                  <Error
                    marginTop="8px"
                    marginBottom="8px"
                    text={validationError}
                    scrollIntoView={false}
                  />
                </Box>
              )}
            </>
          );
        }}
      />
    </>
  );
};
