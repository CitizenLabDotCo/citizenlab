import React, { PureComponent } from 'react';
import { Form, Field, InjectedFormikProps } from 'formik';

// Components
import FormikMultipleSelect from 'components/UI/FormikMultipleSelect';
import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import FormikInput from 'components/UI/FormikInput';
import Label from 'components/UI/Label';

// I18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import localize, { injectedLocalized } from 'utils/localize';
import messages from '../messages';

// Resources
import GetTopics from 'resources/GetTopics';
import GetProjects from 'resources/GetProjects';

// Utils
import { isNilOrError } from 'utils/helperUtils';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

export interface Props { }

export interface FormValues {
  topics: string[];
  projects: string[];
  limit: number;
}

class WidgetForm extends PureComponent<InjectedFormikProps<Props & injectedLocalized & InjectedIntlProps, FormValues>> {

  resourcesToOptionList = (resources) => {
    return resources && resources.map((resource) => ({
      label: this.props.localize(resource.attributes.title_multiloc),
      value: resource.id,
    }));
  }

  render() {
    const { errors, touched, isValid, isSubmitting } = this.props;

    return (
      <Form>

        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.titleIdeasFilters} />
          </SectionTitle>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldProjects} />
            </Label>
            <GetProjects publicationStatuses={['published', 'archived']}>
              {(projects) => (projects && isNilOrError(projects)) ? null : (
                <Field
                  name="projects"
                  component={FormikMultipleSelect}
                  options={this.resourcesToOptionList(projects.projectsList)}
                />
              )}
            </GetProjects>
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldTopics} />
            </Label>
            <GetTopics>
              {(topics) => (topics && isNilOrError(topics)) ? null : (
                <Field
                  name="topics"
                  component={FormikMultipleSelect}
                  options={this.resourcesToOptionList(topics)}
                />
              )}
            </GetTopics>
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldLimit} />
            </Label>
            <Field
              name="limit"
              component={FormikInput}
              type="number"
            />
            {touched.limit && <Error
              fieldName="limit"
              apiErrors={errors.limit as any}
            />}
          </SectionField>

        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
        />

      </Form>
    );
  }
}

export default injectIntl(localize(WidgetForm));
