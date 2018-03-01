import * as React from 'react';
import * as Rx from 'rxjs';
import * as moment from 'moment';
import { isBoolean } from 'lodash';

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
// import Error from 'components/UI/Error';

// utils
// import eventEmitter from 'utils/eventEmitter';

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
  onChange: (arg: any) => void;
}

interface State {
  locale: Locale | null;
  schema: object | null;
  uiSchema: object | null;
}

export default class CustomFieldsForm extends React.PureComponent<Props, State> {
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
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  setButtonRef = (element: HTMLButtonElement) => {
    if (element) {
      this.submitbuttonElement = element;
      // this.submitbuttonElement.click();
    }
  }

  handleOnChange = (value) => {
    this.props.onChange(value);
  }

  handleOnSubmit = (_value) => {
    console.log('submit!');
  }

  render() {
    const { locale, schema, uiSchema } = this.state;

    const CustomInput = (props: FieldProps) => {
      const onChange = (value) => props.onChange(value);

      return (
        <Input
          type="text"
          value={props.value}
          onChange={onChange}
        />
      );
    };

    const CustomTextarea = (props: FieldProps) => {
      const onChange = (value) => props.onChange(value);

      return (
        <TextArea
          onChange={onChange}
          rows={6}
          value={props.value}
        />
      );
    };

    const CustomSelect = (props: FieldProps) => {
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
    };

    const CustomCheckbox = (props: FieldProps) => {
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
    };

    const CustomDate = (props: FieldProps) => {
      const onChange = (value: moment.Moment | null) => props.onChange(value ? value.format('YYYY-MM-DD') : null);

      return (
        <DateInput 
          value={(props.value ? moment(props.value, 'YYYY-MM-DD') : null)}
          onChange={onChange}
        />
      );
    };

    const widgets: any = {
      TextWidget: CustomInput,
      TextareaWidget: CustomTextarea,
      SelectWidget: CustomSelect,
      CheckboxWidget: CustomCheckbox,
      DateWidget: CustomDate
    };

    const CustomFieldTemplate: any = (props: FieldProps) => {
      const { id, label, description, errors, children } = props;

      return (
        <SectionField>
          {(props.schema.type !== 'boolean') &&
            <>
              <Label htmlFor={id}>{label}</Label>

              {description &&
                <Description>{description}</Description>
              }
            </>
          }
          {children}
          {errors}
        </SectionField>
      );
    };

    const ObjectFieldTemplate: any = (props: FieldProps) => {
      return (
        <>
          {props.properties.map((element, index) => <div key={index}>{element.content}</div>)}
        </>
      );
    };

    return (
      <Container className={this.props['className']}>
        {locale && schema && uiSchema &&
          <Form 
            schema={schema[locale]}
            uiSchema={uiSchema[locale]}
            widgets={widgets}
            FieldTemplate={CustomFieldTemplate}
            ObjectFieldTemplate={ObjectFieldTemplate}
            noHtml5Validate={true}
            onChange={this.handleOnChange}
            onSubmit={this.handleOnSubmit}
          >
            <InvisibleSubmitButton innerRef={this.setButtonRef} />
          </Form>
        }
      </Container>
    );
  }
}
