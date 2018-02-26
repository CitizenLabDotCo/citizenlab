import * as React from 'react';
// import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
// import messages from './messages';
import { injectNestedResources, InjectedNestedResourceLoaderProps } from 'utils/resourceLoaders/nestedResourcesLoader';
import { ICustomFieldOptionData, customFieldOptionsStream, updateCustomFieldOption, deleteCustomFieldOption, addCustomFieldOption } from 'services/userCustomFields';
import { Formik } from 'formik';
import OptionForm from './OptionForm';
import { API } from 'typings';
import { SectionTitle } from 'components/admin/Section';
import messages from '../messages';
import Button from 'components/UI/Button';
import styled from 'styled-components';


const OptionContainer = styled.div`

`;

type Props = {
  customFieldId: string;
};

type State = {
  addingOption: boolean;
};

class OptionsForm extends React.Component<Props & InjectedNestedResourceLoaderProps<ICustomFieldOptionData>, State> {

  constructor(props) {
    super(props);
    this.state = {
      addingOption: false,
    };
  }

  initialValuesForEdit = (option: ICustomFieldOptionData) => {
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

  handleDelete = (option) => () => {
    deleteCustomFieldOption(this.props.customFieldId, option.id);
  }

  handleUpdateSubmit = (option) => (values, { setErrors, setSubmitting }) => {

    updateCustomFieldOption(this.props.customFieldId, option.id, values)
      .then(() => {
        setSubmitting(false);
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  handleCreateSubmit = (values, { setErrors, setSubmitting }) => {
    addCustomFieldOption(this.props.customFieldId, values)
      .then(() => {
        setSubmitting(false);
        this.setState({ addingOption: false });
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  addOption = () => {
    this.setState({
      addingOption: true,
    });
  }

  renderFn = (option: ICustomFieldOptionData | null = null) => (props) => (
    <OptionForm
      onClickDelete={this.handleDelete(option)}
      mode={option ? 'edit' : 'new'}
      {...props}
    />
  )

  render() {
    const { addingOption } = this.state;
    return (
      <div>
        <SectionTitle>
          <FormattedMessage {...messages.optionsTitle} />
        </SectionTitle>
        {this.props.options.all.map((option) => (
          <OptionContainer key={option.id}>
            <Formik
              initialValues={this.initialValuesForEdit(option)}
              onSubmit={this.handleUpdateSubmit(option)}
              render={this.renderFn(option)}
            />
          </OptionContainer>
        ))}
        {addingOption &&
          <OptionContainer>
            <Formik
              initialValues={this.initialValuesForNew()}
              onSubmit={this.handleCreateSubmit}
              render={this.renderFn()}
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
      </div>
    );
  }


}

export default injectNestedResources('options', customFieldOptionsStream ,(props) => props.customFieldId)(OptionsForm);
