import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { includes } from 'lodash-es';

import { FieldProps } from 'formik';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const Level = styled.div<{ depth: number }>`
  margin-left: ${(props) => props.depth * 20}px;
  display: flex;
  align-items: center;
`;

const AddLevel = styled(Level)`
  * {
    margin: 0 5px;
  }
`;

const AddButton = styled(Button)`
  font-size: 10px;
`;

type State = {};

const allLevels: TLevel[] = ['project', 'topic', 'area', 'clustering'];
type TLevel = 'project' | 'topic' | 'area' | 'clustering';

class FormikInput extends PureComponent<FieldProps<TLevel[]>, State> {
  handleOnChange = (newValue) => {
    this.props.form.setFieldValue(this.props.field.name, newValue);
  };

  handleAddLevel = (level: TLevel) => () => {
    const {
      form: { setFieldValue },
      field: { name, value },
    } = this.props;
    setFieldValue(name, [...value, level]);
  };

  handleRemoveLevel = (depth: number) => () => {
    const {
      form: { setFieldValue },
      field: { name, value },
    } = this.props;
    setFieldValue(name, [...value.slice(0, depth), ...value.slice(depth + 1)]);
  };

  availableLevels = (): TLevel[] => {
    const value: TLevel[] = this.props.field.value;

    return allLevels.filter((level) => {
      switch (level) {
        case 'clustering':
          return true;
        default:
          return !includes(value, level);
      }
    });
  };

  render() {
    const value: TLevel[] = this.props.field.value;

    return (
      <div>
        {value.map((v, i) => (
          <Level depth={i} key={`${i}-${v}`}>
            <Button
              buttonStyle="text"
              icon="close"
              onClick={this.handleRemoveLevel(i)}
            />
            <FormattedMessage
              {...(i === 0 ? messages.firstGroup : messages.thenLevel)}
              values={{
                level: (
                  <b>
                    <FormattedMessage {...messages[`level_${v}`]} />
                  </b>
                ),
              }}
            />
          </Level>
        ))}
        <AddLevel key="new-level" depth={value.length + 1}>
          {this.availableLevels().map((level: TLevel, index) => (
            <AddButton
              key={`level_${level}_${index}`}
              onClick={this.handleAddLevel(level)}
              buttonStyle="secondary-outlined"
              icon="plus-circle"
            >
              <FormattedMessage
                {...{
                  project: messages.level_project,
                  topic: messages.level_topic,
                  area: messages.level_area,
                  clustering: messages.level_description,
                }[level]}
              />
            </AddButton>
          ))}
        </AddLevel>
      </div>
    );
  }
}

export default FormikInput;
