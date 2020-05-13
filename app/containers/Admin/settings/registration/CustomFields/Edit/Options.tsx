import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

import { CLErrorsJSON } from 'typings';
import {
  IUserCustomFieldOptionsData,
  updateUserCustomFieldOption,
  deleteUserCustomFieldOption,
  addUserCustomFieldOption,
  IUserCustomFieldData
} from 'services/userCustomFields';
import GetUserCustomFieldOptions, { GetUserCustomFieldOptionsChildProps } from 'resources/GetUserCustomFieldOptions';

import { Formik, FormikErrors } from 'formik';
import OptionForm, { FormValues } from './OptionForm';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { isCLErrorJSON } from 'utils/errorUtils';

const OptionContainer = styled.div``;

interface InputProps {
  customField: IUserCustomFieldData;
}

interface DataProps {
  customFieldOptions: GetUserCustomFieldOptionsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  addingOption: boolean;
}

class OptionsForm extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      addingOption: false,
    };
  }

  initialValuesForEdit = (option: IUserCustomFieldOptionsData) => {
    return {
      key: option.attributes.key,
      title_multiloc: option.attributes.title_multiloc,
    };
  }

  initialValuesForNew = () => {
    return {
      key: '',
      title_multiloc: {},
    };
  }

  validate = (values: FormValues) => {
    const errors : FormikErrors<FormValues> = {};

    if (isEmpty(values.key)) {
      errors.key = [{ error: 'blank' }] as any;
    }

    if (!values.key.match(/^[a-zA-Z0-9_]+$/)) {
      errors.key = [{ error: 'blank' }] as any;
    }

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }

    return errors;
  }

  handleDelete = (option) => () => {
    deleteUserCustomFieldOption(this.props.customField.id, option.id);
  }

  handleCancel = () => {
    this.setState({
      addingOption: false,
    });
  }

  handleUpdateSubmit = (option) => (values, { setErrors, setSubmitting, resetForm, setStatus }) => {
    updateUserCustomFieldOption(this.props.customField.id, option.id, values).then(() => {
      resetForm();
    }).catch((errorResponse) => {
      if (isCLErrorJSON(errorResponse)) {
        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
      } else {
        setStatus('error');
      }
      setSubmitting(false);
    });
  }

  handleCreateSubmit = (values, { setErrors, setSubmitting, setStatus }) => {
    addUserCustomFieldOption(this.props.customField.id, values).then(() => {
      setSubmitting(false);
      this.setState({ addingOption: false });
    }).catch((errorResponse) => {
      if (isCLErrorJSON(errorResponse)) {
        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
      } else {
        setStatus('error');
      }
      setSubmitting(false);
    });
  }

  addOption = () => {
    this.setState({
      addingOption: true,
    });
  }

  renderFn = (option: IUserCustomFieldOptionsData | null = null) => (props) => (
    <OptionForm
      onClickDelete={this.handleDelete(option)}
      onClickCancel={this.handleCancel}
      mode={option ? 'edit' : 'new'}
      {...props}
    />
  )

  render() {
    const { customFieldOptions } = this.props;
    const { addingOption } = this.state;

    return !isNilOrError(customFieldOptions) && (
      <>
        {customFieldOptions.map((customFieldOption) => (
          <OptionContainer key={customFieldOption.id}>
            <Formik
              initialValues={this.initialValuesForEdit(customFieldOption)}
              onSubmit={this.handleUpdateSubmit(customFieldOption)}
              render={this.renderFn(customFieldOption)}
              validate={this.validate}
            />
          </OptionContainer>
        ))}

        {addingOption &&
          <OptionContainer>
            <Formik
              initialValues={this.initialValuesForNew()}
              onSubmit={this.handleCreateSubmit}
              render={this.renderFn()}
              validate={this.validate}
            />
          </OptionContainer>
        }

        {!addingOption &&
          <Button
            onClick={this.addOption}
            icon="plus"
          >
            <FormattedMessage {...messages.addOptionButton} />
          </Button>
        }
      </>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetUserCustomFieldOptions customFieldId={inputProps.customField.id}>
    {customField => <OptionsForm {...inputProps} customFieldOptions={customField} />}
  </GetUserCustomFieldOptions>
);
