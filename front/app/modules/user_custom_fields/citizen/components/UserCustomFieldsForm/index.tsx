import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';
import moment from 'moment';
import {
  isBoolean,
  forOwn,
  get,
  uniq,
  isNil,
  isEmpty,
  isString,
} from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// libraries
import Form, { FieldProps } from 'react-jsonschema-form';

// services
import GetUserCustomFieldsSchema, {
  GetUserCustomFieldsSchemaChildProps,
} from 'modules/user_custom_fields/resources/GetUserCustomFieldsSchema';

// components
import { FormLabelValue } from 'components/UI/FormComponents';
import TextArea from 'components/UI/TextArea';
import { Input, IconTooltip, Select, DateInput } from 'cl2-component-library';
import MultipleSelect from 'components/UI/MultipleSelect';
import Checkbox from 'components/UI/Checkbox';
import { SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';
import {
  ExtraFormDataConfiguration,
  ExtraFormDataKey,
} from 'containers/UsersEditPage/ProfileForm';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typings
import { IOption } from 'typings';
import { IUserData } from 'services/users';

// utils
import eventEmitter from 'utils/eventEmitter';

const Container = styled.div``;

const StyledSectionField = styled(SectionField)`
  margin-bottom: 30px;
`;

const StyledFormLabelValue = styled(FormLabelValue)`
  display: block;
  margin-bottom: 10px;
`;

const InvisibleSubmitButton = styled.button`
  visibility: hidden;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 5px;
`;

const StyledSelect = styled(Select)`
  flex-grow: 1;
`;

const StyledTextArea = styled(TextArea)`
  flex-grow: 1;
`;

const StyledMultipleSelect = styled(MultipleSelect)`
  flex-grow: 1;
`;

const StyledDateInput = styled(DateInput)`
  flex-grow: 1;
`;

export interface InputProps {
  authUser: IUserData;
  onSubmit: (data: { key: string; formData: Object | null }) => void;
  onChange?: () => void;
  onData?: (data: {
    key: ExtraFormDataKey;
    data: ExtraFormDataConfiguration;
  }) => void;
}

interface State {
  formData: Object | null;
}

interface DataProps {
  userCustomFieldsSchema: GetUserCustomFieldsSchemaChildProps;
}

interface Props extends InputProps, DataProps {}

class UserCustomFieldsForm extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  submitbuttonElement: HTMLButtonElement | null;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.subscriptions = [];
    this.state = {
      formData: null,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter.observeEvent('customFieldsSubmitEvent').subscribe(() => {
        if (this.submitbuttonElement) {
          this.submitbuttonElement?.click?.();
        }
      }),
    ];

    this.props.onData?.({
      key: 'custom_field_values',
      data: {
        submit: () => this?.submitbuttonElement?.click?.(),
      },
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setButtonRef = (element: HTMLButtonElement) => {
    if (element) {
      this.submitbuttonElement = element;
    }
  };

  handleOnChange = ({ formData }) => {
    const sanitizedFormData = {};

    forOwn(formData, (value, key) => {
      sanitizedFormData[key] = value === null ? undefined : value;
    });

    this.setState({ formData: sanitizedFormData }, () =>
      this.props.onChange?.()
    );
  };

  handleOnSubmit = ({ formData }) => {
    const sanitizedFormData = {};

    forOwn(formData, (value, key) => {
      sanitizedFormData[key] = value === null ? undefined : value;
    });

    this.setState({ formData: sanitizedFormData }, () =>
      this.props.onSubmit({
        key: 'custom_field_values',
        formData: this.state.formData,
      })
    );
  };

  handleOnError = (_errors) => {
    // empty
  };

  validate = (formData, errors) => {
    const { userCustomFieldsSchema } = this.props;

    if (!isNilOrError(userCustomFieldsSchema)) {
      const { schema, uiSchema } = userCustomFieldsSchema;
      const requiredFieldNames = get(schema, 'required', []);
      const disabledFieldNames = get(uiSchema, 'ui:disabled', []);
      const fieldNames = get(schema, 'properties', null) as object;
      const requiredErrorMessage = this.props.intl.formatMessage(
        messages.requiredError
      );
      const mustBeANumberMessage = this.props.intl.formatMessage(
        messages.mustBeANumber
      );

      errors['__errors'] = [];

      forOwn(fieldNames, (_value, fieldName) => {
        errors[fieldName]['__errors'] = [];
      });

      requiredFieldNames
        .filter((requiredFieldName) => {
          return (
            disabledFieldNames.includes(requiredFieldName) ||
            isNil(formData[requiredFieldName]) ||
            (!isBoolean(formData[requiredFieldName]) &&
              !Number.isInteger(formData[requiredFieldName]) &&
              isEmpty(formData[requiredFieldName])) ||
            (isBoolean(formData[requiredFieldName]) &&
              formData[requiredFieldName] === false)
          );
        })
        .forEach((requiredFieldName) => {
          errors[requiredFieldName].addError(requiredErrorMessage);
        });

      if (!isNilOrError(schema)) {
        Object.keys(fieldNames)
          .filter((fieldName) => {
            return (
              !isNil(formData[fieldName]) &&
              schema.properties[fieldName].type === 'number' &&
              !Number.isInteger(formData[fieldName])
            );
          })
          .forEach((numberFieldWithError) => {
            errors[numberFieldWithError].addError(mustBeANumberMessage);
          });
      }
      return errors;
    }
  };

  CustomInput = (props: FieldProps) => {
    const onChange = (value) => props.onChange(value);

    return (
      <InputContainer>
        <Input
          type="text"
          value={props.value}
          onChange={onChange}
          key={props.id}
          id={props.id}
          disabled={props.disabled}
        />
        {props.options.verificationLocked && (
          <StyledIconTooltip
            content={<FormattedMessage {...messages.blockedVerified} />}
            icon="lock"
          />
        )}
      </InputContainer>
    );
  };

  CustomTextarea = (props: FieldProps) => {
    const onChange = (value) => props.onChange(value);

    return (
      <InputContainer>
        <StyledTextArea
          onChange={onChange}
          rows={6}
          value={props.value}
          key={props.id}
          id={props.id}
          disabled={props.disabled}
        />
        {props.options.verificationLocked && (
          <StyledIconTooltip
            content={<FormattedMessage {...messages.blockedVerified} />}
            icon="lock"
          />
        )}
      </InputContainer>
    );
  };

  CustomSelect = (props: FieldProps) => {
    if (props.schema.type === 'string' || props.schema.type === 'number') {
      const selectedOption: IOption | null = props.value
        ? {
            value: props.value,
            label: get(
              props.options.enumOptions.find(
                (enumOption) => enumOption.value === props.value
              ),
              'label',
              null
            ),
          }
        : null;

      const onChange = (selectedOption: IOption) => {
        props?.onChange?.(selectedOption ? selectedOption.value : null);
      };

      return (
        <InputContainer>
          <StyledSelect
            value={selectedOption}
            options={props.options.enumOptions}
            onChange={onChange}
            key={props.id}
            id={props.id}
            disabled={props.disabled}
            aria-label={props.label}
            canBeEmpty={true}
          />
          {props.options.verificationLocked && (
            <StyledIconTooltip
              content={<FormattedMessage {...messages.blockedVerified} />}
              icon="lock"
            />
          )}
        </InputContainer>
      );
    }

    if (props.schema.type === 'array') {
      const selectedOptions: IOption[] | null =
        props.value && props.value.length > 0
          ? props.value.map((value) => ({
              value,
              label: get(
                props.options.enumOptions.find(
                  (enumOption) => enumOption.value === value
                ),
                'label',
                null
              ),
            }))
          : null;

      const onChange = (selectedOptions: IOption[]) => {
        props.onChange(
          selectedOptions
            ? selectedOptions.map((selectedOption) => selectedOption.value)
            : null
        );
      };

      return (
        <InputContainer>
          <StyledMultipleSelect
            value={selectedOptions}
            options={props.options.enumOptions}
            onChange={onChange}
            inputId={props.id}
            disabled={props.disabled}
            aria-label={props.label}
          />
          {props.options.verificationLocked && (
            <StyledIconTooltip
              content={<FormattedMessage {...messages.blockedVerified} />}
              icon="lock"
            />
          )}
        </InputContainer>
      );
    }

    return null;
  };

  CustomCheckbox = (props: FieldProps) => {
    const onChange = () =>
      props.onChange(isBoolean(props.value) ? !props.value : true);
    const { title } = props.schema;
    const id = props.id;

    if (isString(id)) {
      return (
        <>
          {title && (
            <StyledFormLabelValue noSpace htmlFor={id} labelValue={title} />
          )}
          <InputContainer>
            <Checkbox
              checked={isBoolean(props.value) ? props.value : false}
              onChange={onChange}
              label={props.schema.description || null}
              disabled={props.disabled}
            />
            {props.options.verificationLocked && (
              <StyledIconTooltip
                content={<FormattedMessage {...messages.blockedVerified} />}
                icon="lock"
              />
            )}
          </InputContainer>
        </>
      );
    }

    return null;
  };

  CustomDate = (props: FieldProps) => {
    const onChange = (value: moment.Moment | null) =>
      props.onChange(value ? value.format('YYYY-MM-DD') : null);

    return (
      <InputContainer>
        <StyledDateInput
          value={props.value ? moment(props.value, 'YYYY-MM-DD') : null}
          onChange={onChange}
          disabled={props.disabled}
        />
        {props.options.verificationLocked && (
          <StyledIconTooltip
            content={<FormattedMessage {...messages.blockedVerified} />}
            icon="lock"
          />
        )}
      </InputContainer>
    );
  };

  CustomFieldTemplate = (props: FieldProps) => {
    const { id, label, description, rawErrors, children, required } = props;
    const errors: any = uniq(rawErrors);

    if (props.hidden !== true) {
      const safeDescription =
        description &&
        get(description, 'props.description') &&
        description.props.description.length > 0;
      const descriptionJSX = safeDescription && (
        <div
          dangerouslySetInnerHTML={{ __html: description.props.description }}
        />
      );

      return (
        <StyledSectionField>
          {props.schema.type !== 'boolean' &&
            renderLabel(id, label, required, descriptionJSX)}

          {children}

          {errors &&
            errors.length > 0 &&
            errors.map((value, index) => {
              return <Error key={index} marginTop="10px" text={value} />;
            })}
        </StyledSectionField>
      );
    }

    return null;
  };

  ObjectFieldTemplate: any = (props: FieldProps) => {
    return (
      <>
        {props.properties.map((element, index) => (
          <div key={index}>{element.content}</div>
        ))}
      </>
    );
  };

  transformErrors = (errors) => {
    return errors
      .filter((error) => {
        return error.name === 'required';
      })
      .map((error) => ({
        ...error,
        message: this.props.intl.formatMessage(messages.requiredError),
      }));
  };

  render() {
    const { userCustomFieldsSchema, authUser } = this.props;
    const { formData } = this.state;

    if (!isNilOrError(userCustomFieldsSchema)) {
      const { schema, uiSchema } = userCustomFieldsSchema;
      const widgets: any = {
        TextWidget: this.CustomInput,
        TextareaWidget: this.CustomTextarea,
        SelectWidget: this.CustomSelect,
        CheckboxWidget: this.CustomCheckbox,
        DateWidget: this.CustomDate,
      };

      return (
        <Container>
          {schema && uiSchema && (
            <Form
              schema={schema}
              uiSchema={uiSchema}
              formData={formData || authUser.attributes.custom_field_values}
              widgets={widgets}
              FieldTemplate={this.CustomFieldTemplate as any}
              ObjectFieldTemplate={this.ObjectFieldTemplate}
              transformErrors={this.transformErrors}
              noHtml5Validate={true}
              liveValidate={false}
              showErrorList={false}
              validate={this.validate}
              onChange={this.handleOnChange}
              onSubmit={this.handleOnSubmit}
              onError={this.handleOnError}
            >
              <InvisibleSubmitButton ref={this.setButtonRef} />
            </Form>
          )}
        </Container>
      );
    }

    return null;
  }
}

function renderLabel(id, label, required, descriptionJSX) {
  if (label && label.length > 0) {
    return (
      <FormLabelValue
        htmlFor={id}
        labelValue={label}
        optional={!required}
        subtextValue={descriptionJSX}
      />
    );
  }
  return;
}

const Data = adopt<DataProps, InputProps>({
  userCustomFieldsSchema: <GetUserCustomFieldsSchema />,
});

const UserCustomFieldsFormWithHoc = injectIntl<Props>(UserCustomFieldsForm);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => (
      <UserCustomFieldsFormWithHoc {...inputProps} {...dataprops} />
    )}
  </Data>
);
