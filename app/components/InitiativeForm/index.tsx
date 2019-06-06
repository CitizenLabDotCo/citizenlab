import * as React from 'react';
import { Multiloc } from 'typings';
import { Form, FormikErrors, InjectedFormikProps, Field } from 'formik';
import { isEmpty, values as getValues, every } from 'lodash-es';
import { FormSection, FormSectionTitle, FormLabel } from './FormComponents';
// import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikInput from 'components/UI/FormikInput';
// import FormikSelect from 'components/UI/FormikSelect';
// import Error from 'components/UI/Error';
// import { Section, SectionField, SectionTitle } from 'components/admin/Section';
// import { Form, Field, FastField, InjectedFormikProps, FormikErrors } from 'formik';
// import Label from 'components/UI/Label';
// import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
// import { Multiloc } from 'typings';
// import styled from 'styled-components';
// // i18n
// import { InjectedIntlProps } from 'react-intl';
// import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { SectionField } from 'components/admin/Section';

export interface FormValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

interface Props {}

class InitiativeForm extends React.Component<InjectedFormikProps<Props, FormValues>> {
  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }

    return errors;
  }

  // renderFormikQuillMultiloc = (props) => {
  //   return (
  //     <FormikQuillMultiloc
  //       label={<FormattedMessage {...messages.fieldBody} />}
  //       labelTooltip={<InfoTooltip {...messages.nameVariablesInfo} />}
  //       noVideos
  //       noAlign
  //       {...props}
  //     />
  //   );
  // }

  render() {
    // const { isSubmitting, errors, isValid, touched } = this.props;

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
              />
            </FormLabel>
          </SectionField>
        </FormSection>
      </Form>
    );
  }
}

export default InitiativeForm;
