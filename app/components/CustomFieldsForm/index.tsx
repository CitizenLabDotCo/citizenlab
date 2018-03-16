import * as React from 'react';
import * as Rx from 'rxjs';
import * as moment from 'moment';
import { isBoolean, forOwn, get, uniq, isNil, isEmpty } from 'lodash';

// libraries
import Form, { FieldProps } from 'react-jsonschema-form';

// services
import { localeStream } from 'services/locale';
import { customFieldsSchemaForUsersStream } from 'services/userCustomFields';

// components
import Label from 'components/UI/Label';
import TextArea from 'components/UI/TextArea';
import Input from 'components/UI/Input';
import DateInput from 'components/UI/DateInput';
import Select from 'components/UI/Select';
import MultipleSelect from 'components/UI/MultipleSelect';
import Checkbox from 'components/UI/Checkbox';
import { SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typings
import { Locale, IOption } from 'typings';

const Container = styled.div``;

const InvisibleSubmitButton = styled.button`
  visibility: hidden;
`;

const Description = styled.div`
  width: 100%;
  color: #333;
  font-size: 14px;
  line-height: 20px;
  margin: 0;
  margin-bottom: 10px;
  padding: 0;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CheckboxDescription = styled(Description)`
  cursor: pointer;
  padding-left: 10px;
  user-select: none;
  margin: 0;
`;

interface Props {
  formData?: object;
  onSubmit?: (arg: any) => void;
  onChange?: (arg: any) => void;
}

interface State {
  locale: Locale | null;
  schema: object | null;
  uiSchema: object | null;
}

class CustomFieldsForm extends React.PureComponent<Props & InjectedIntlProps, State> {
  submitbuttonElement: HTMLButtonElement | null;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      schema: null,
      uiSchema: null
    };
    this.submitbuttonElement = null;
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const customFieldsSchemaForUsersStream$ = customFieldsSchemaForUsersStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        customFieldsSchemaForUsersStream$
      ).subscribe(([locale, customFields]) => {
        this.setState({
          locale,
          schema: customFields['json_schema_multiloc'],
          uiSchema: customFields['ui_schema_multiloc']
        });
      }),

      eventEmitter.observeEvent('customFieldsSubmitEvent').subscribe(() => {
        if (this.submitbuttonElement) {
          this.submitbuttonElement.click();
        }
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  setButtonRef = (element: HTMLButtonElement) => {
    if (element) {
      this.submitbuttonElement = element;
    }
  }

  handleOnChange = ({ formData }) => {
    if (this.props.onChange) {
      const sanitizedFormData = {};

      forOwn(formData, (value, key) => {
        sanitizedFormData[key] = (value === null ? undefined : value);
      });

      this.props.onChange(sanitizedFormData);
    }
  }

  handleOnSubmit = ({ formData }) => {
    if (this.props.onSubmit) {
      const sanitizedFormData = {};

      forOwn(formData, (value, key) => {
        sanitizedFormData[key] = (value === null ? undefined : value);
      });

      this.props.onSubmit(sanitizedFormData);
    }
  }

  handleOnError = (_errors) => {
    // empty
  }

  validate = (formData, errors) => {
    const { schema, locale } = this.state;
    const requiredFieldNames = get(schema, `${locale}.required`, []);
    const fieldNames = get(schema, `${locale}.properties`, null);
    const requiredErrorMessage = this.props.intl.formatMessage(messages.requiredError);

    errors['__errors'] = [];

    forOwn(fieldNames, (_value, fieldName) => {
      errors[fieldName]['__errors'] = [];
    });

    requiredFieldNames.filter((requiredFieldName) => {
      return (isNil(formData[requiredFieldName]) 
              || (!isBoolean(formData[requiredFieldName]) && isEmpty(formData[requiredFieldName])) 
              || (isBoolean(formData[requiredFieldName]) && formData[requiredFieldName] === false)
      );
    }).forEach((requiredFieldName) => {
      errors[requiredFieldName].addError(requiredErrorMessage);
    });

    return errors;
  }

  CustomInput = (props: FieldProps) => {
    const onChange = (value) => props.onChange(value);

    return (
      <Input
        type="text"
        value={props.value}
        onChange={onChange}
        key={props.id}
      />
    );
  }

  CustomTextarea = (props: FieldProps) => {
    const onChange = (value) => props.onChange(value);

    return (
      <TextArea
        onChange={onChange}
        rows={6}
        value={props.value}
        key={props.id}
      />
    );
  }

  CustomSelect = (props: FieldProps) => {
    if (props.schema.type === 'string') {
      const selectedOption: IOption | null = (props.value ? {
        value: props.value,
        label: (props.value ? props.options.enumOptions.find(enumOption => enumOption.value === props.value).label : null)
      } : null);

      const onChange = (selectedOption: IOption) => {
        props.onChange((selectedOption ? selectedOption.value : null));
      };

      return (
        <Select
          clearable={true}
          searchable={false}
          value={selectedOption}
          options={props.options.enumOptions}
          onChange={onChange}
          key={props.id}
        />
      );
    }

    if (props.schema.type === 'array') {
      const selectedOptions: IOption[] | null = ((props.value && props.value.length > 0) ? props.value.map(value => ({
        value,
        label: props.options.enumOptions.find(enumOption => enumOption.value === value).label
      })) : null);

      const onChange = (selectedOptions: IOption[]) => {
        props.onChange((selectedOptions ? selectedOptions.map(selectedOption => selectedOption.value) : null));
      };

      return (
        <MultipleSelect
          value={selectedOptions}
          options={props.options.enumOptions}
          onChange={onChange}
        />
      );
    }

    return null;
  }

  CustomCheckbox = (props: FieldProps) => {
    const onChange = () => props.onChange((isBoolean(props.value) ? !props.value : true));

    return (
      <>
        <Label>{props.schema.title}</Label>
        <CheckboxContainer>
          <Checkbox
            size="22px"
            checked={(isBoolean(props.value) ? props.value : false)}
            toggle={onChange}
          />
          {props.schema.description &&
            <CheckboxDescription onClick={onChange}>
              {props.schema.description}
            </CheckboxDescription>
          }
        </CheckboxContainer>
      </>
    );
  }

  CustomDate = (props: FieldProps) => {
    const onChange = (value: moment.Moment | null) => props.onChange(value ? value.format('YYYY-MM-DD') : null);

    return (
      <DateInput
        value={(props.value ? moment(props.value, 'YYYY-MM-DD') : null)}
        onChange={onChange}
      />
    );
  }

  CustomFieldTemplate: any = (props: FieldProps) => {
    const { id, label, description, rawErrors, children } = props;
    const errors: any = uniq(rawErrors);

    if (props.hidden !== true) {
      return (
        <SectionField>
          {(props.schema.type !== 'boolean') &&
            <>
              {label && label.length > 0 &&
                <Label htmlFor={id}>{label}</Label>
              }

              {description && description.props && description.props.description && description.props.description.length > 0 &&
                <Description>{description}</Description>
              }
            </>
          }

          {children}

          {errors && errors.length > 0 && errors.map((value, index) => {
            return (<Error key={index} marginTop="10px" text={value} />);
          })}
        </SectionField>
      );
    }

    return null;
  }

  ObjectFieldTemplate: any = (props: FieldProps) => {
    return (
      <>
        {props.properties.map((element, index) => <div key={index}>{element.content}</div>)}
      </>
    );
  }

  transformErrors = (errors) => {
    return errors.filter((error) => {
      return error.name === 'required';
    }).map((error) => ({
      ...error,
      message: this.props.intl.formatMessage(messages.requiredError)
    }));
  }

  render() {
    const { locale, schema, uiSchema } = this.state;

    const widgets: any = {
      TextWidget: this.CustomInput,
      TextareaWidget: this.CustomTextarea,
      SelectWidget: this.CustomSelect,
      CheckboxWidget: this.CustomCheckbox,
      DateWidget: this.CustomDate,
    };

    return (
      <Container className={this.props['className']}>
        {locale && schema && uiSchema &&
          <Form
            schema={schema[locale]}
            uiSchema={uiSchema[locale]}
            formData={this.props.formData}
            widgets={widgets}
            FieldTemplate={this.CustomFieldTemplate}
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
            <InvisibleSubmitButton innerRef={this.setButtonRef} />
          </Form>
        }
      </Container>
    );
  }
}

export default injectIntl<Props>(CustomFieldsForm);
