import React, { useState } from 'react';

// components
import {
  Box,
  colors,
  Icon,
  IOption,
  Select,
  Text,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// intl
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Controller, useFormContext } from 'react-hook-form';

type RuleInputProps = {
  answer: { key: string | number | undefined; label: string | undefined };
  name: string;
  pages:
    | {
        value: string | undefined;
        label: string;
      }[]
    | undefined;
};

type LogicType = { rules: { if: string | number; goto_page_id: string }[] };

export const RuleInput = ({ pages, name, answer }: RuleInputProps) => {
  const { setValue, watch, control } = useFormContext();
  const rules = (watch(name) as LogicType).rules;
  const logic = watch(name) as LogicType;
  const initialValue = rules
    ? rules.find((rule) => rule.if === answer.key)
    : undefined;

  const [selectedPage, setSelectedPage] = useState<string | null | undefined>(
    initialValue ? initialValue.goto_page_id : undefined
  );
  const [showRuleInput, setShowRuleInput] = useState<boolean>(
    initialValue ? true : false
  );

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
      if (logic.rules) {
        const newRulesArray = logic.rules;
        newRulesArray.push(newRule);
        logic.rules = newRulesArray;
      } else {
        logic.rules = [newRule];
      }
      // Update rule variable
      setValue(name, logic);
    }
  };

  const removeRuleForAnswer = () => {
    // Remove any existing rule
    if (logic.rules && logic.rules.length > 0) {
      logic.rules = logic.rules.filter((rule) => rule.if !== answer.key);
    }
    // Update rule variable
    setValue(name, logic);
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
              <Box
                mb="0px"
                display="flex"
                borderTop={`1px solid ${colors.divider}`}
                py="8px"
              >
                <Box width="90px" flexGrow={0} flexShrink={0} flexWrap="wrap">
                  <Text color={'coolGrey600'} fontSize="s">
                    <FormattedMessage {...messages.ruleForAnswerLabel} />
                  </Text>
                </Box>
                <Box width="215px" flexGrow={0} flexShrink={0} flexWrap="wrap">
                  <Text fontSize="s" fontWeight="bold">
                    {answer.label}
                  </Text>
                </Box>
                {!showRuleInput && (
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
                    >
                      <Icon
                        width="24px"
                        fill={`${colors.coolGrey600}`}
                        name="plus-circle"
                      />
                    </Button>
                  </Box>
                )}
              </Box>
              {showRuleInput && (
                <Box mb="24px" display="flex">
                  <Box flexGrow={0} flexShrink={0} width="320px">
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
                    <Button
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
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          );
        }}
      />
    </>
  );
};
