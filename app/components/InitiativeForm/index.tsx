import * as React from 'react';
import { Form, FormikErrors, InjectedFormikProps, Field, FastField } from 'formik';
import { isEmpty } from 'lodash-es';
import { FormSection, FormSectionTitle, FormLabel } from 'components/UI/FormComponents';
import FormikInput from 'components/UI/FormikInput';

import messages from './messages';
import { SectionField } from 'components/admin/Section';
import FormikQuill from 'components/UI/QuillEditor/FormikQuill';
import FormikTopicsPicker from 'components/UI/FormikTopicsPicker';
import FormikLocationInput from 'components/UI/FomrikLocationInput';

export interface FormValues {
  title: string;
  body: string;
  topics: string[];
  position: string;
}

interface Props {
  onSave: () => void;
}

class InitiativeForm extends React.Component<InjectedFormikProps<Props, FormValues>> {
  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (isEmpty(values.title)) {
      errors.title = [{ error: 'blank' }] as any;
    }

    return errors;
  }

  render() {
    // const { isSubmitting, errors, isValid, touched } = this.props;
    console.log(this.props);

    return (
      <Form>
        <FormSection>
          <FormSectionTitle message={messages.formGeneralSectionTitle} />

          <SectionField>
            <FormLabel
              labelMessage={messages.titleLabel}
              subtextMessage={messages.titleLabelSubtext}
            >
              <Field
                name="title"
                component={FormikInput}
                required
                onBlur={this.props.onSave}
              />
            </FormLabel>
          </SectionField>

          <SectionField>
            <FormLabel
              labelMessage={messages.descriptionLabel}
              subtextMessage={messages.descriptionLabelSubtext}
            >
              <FastField
                name="description"
                component={FormikQuill}
                noVideos
                noAlign
                onBlur={this.props.onSave}
                required
              />
            </FormLabel>
          </SectionField>
        </FormSection>

        <FormSection>
          <FormSectionTitle message={messages.formDetailsSectionTitle} />

          <SectionField>
            <FormLabel
              labelMessage={messages.topicsLabel}
              subtextMessage={messages.topicsLabelSubtext}
              htmlFor="field-topic-multiple-picker"
            />
              <Field
                id="field-topic-multiple-picker"
                name="topics"
                component={FormikTopicsPicker}
                required
                max={2}
              />
          </SectionField>
          <SectionField>
            <FormLabel
              labelMessage={messages.locationLabel}
              subtextMessage={messages.locationLabelSubtext}
            >
              <Field
                name="position"
                component={FormikLocationInput}
              />
            </FormLabel>
          </SectionField>
        </FormSection>
      </Form>
    );
  }
}

export default InitiativeForm;
