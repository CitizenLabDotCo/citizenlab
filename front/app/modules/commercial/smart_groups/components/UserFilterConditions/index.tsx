import React from 'react';
import { clone } from 'lodash-es';
import styled from 'styled-components';
import { TRule } from './rules';

// components
import Button from 'components/UI/Button';
import Rule from './Rule';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from 'containers/Admin/users/tracks';

// styling
import { colors } from 'utils/styleUtils';

import Error from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';

const Container = styled.div`
  width: 560px;
`;

const RulesList = styled.div`
  margin: 0 -5px;
`;

const AddButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  margin: 0;
  margin-top: 15px;
  padding: 0;

  &:hover {
    .buttonIcon {
      fill: ${colors.primary};
    }
  }

  .button {
    padding: 0;
  }

  .buttonIcon {
    fill: ${colors.teal};
  }

  .buttonText {
    color: ${colors.primary};
  }
`;

type Props = {
  rules: TRule[];
  onChange: (rules: TRule[]) => void;
};

interface State {}

interface Tracks {
  trackConditionAdd: () => void;
}

class UserFilterConditions extends React.PureComponent<Props & Tracks, State> {
  handleOnChangeRule = (index) => (rule: TRule) => {
    const newRules = clone(this.props.rules);
    newRules.splice(index, 1, rule);
    this.props.onChange(newRules);
  };

  handleOnRemoveRule = (index) => () => {
    const newRules = clone(this.props.rules);
    newRules.splice(index, 1);
    this.props.onChange(newRules);
  };

  handleOnAddRule = () => {
    this.props.trackConditionAdd();
    const newRules = clone(this.props.rules);
    newRules.push({});
    this.props.onChange(newRules);
  };

  render() {
    const { rules } = this.props;
    return (
      <Container>
        <RulesList>
          {rules.map((rule, index) => (
            <Rule
              key={index}
              ruleName={`e2e-rule-${index}`}
              rule={rule}
              onChange={this.handleOnChangeRule(index)}
              onRemove={this.handleOnRemoveRule(index)}
              showLabels={index === 0}
            />
          ))}
        </RulesList>
        <AddButton
          className="e2e-add-condition-button"
          onClick={this.handleOnAddRule}
          icon="plus-circle"
          buttonStyle="text"
          justify="left"
        >
          <FormattedMessage {...messages.addCondition} />
        </AddButton>
      </Container>
    );
  }
}

const UserFilterConditionsWithHoc = injectTracks<Props>({
  trackConditionAdd: tracks.conditionAdd,
})(UserFilterConditions);

export const HookFormUserFilterConditions = ({ name }: { name: string }) => {
  const {
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useFormContext();

  const handleOnChange = (newValue: TRule[]) => {
    setValue(name, newValue);
  };

  const validationError = errors[name]?.message as string | undefined;

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => (
          <UserFilterConditionsWithHoc
            {...field}
            onChange={handleOnChange}
            rules={getValues(name)}
          />
        )}
      />
      {validationError && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={false}
        />
      )}
    </>
  );
};
