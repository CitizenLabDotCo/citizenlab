import React from 'react';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

import { Form, Field, InjectedFormikProps } from 'formik';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikMultipleSelect from 'components/UI/FormikMultipleSelect';
import FormikToggle from 'components/UI/FormikToggle';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

// Typings
import { Multiloc } from 'typings';
import GetProjects from 'resources/GetProjects';
import { isNilOrError } from 'utils/helperUtils';
import localize, { injectedLocalized } from 'utils/localize';
import Label from 'components/UI/Label';
import GetTopics from 'resources/GetTopics';
import GetIdeaStatuses from 'resources/GetIdeaStatuses';
import FormikInput from 'components/UI/FormikInput';
import { InjectedIntlProps } from 'react-intl';


export interface Props {
}

export interface FormValues {
  title_multiloc: Multiloc;
  levels: string[];
  drop_empty: boolean;
  topics: string[];
  areas: string[];
  projects: string[];
  idea_statuses: string[];
  minimal_total_votes?: number;
  minimal_upvotes?: number;
  minimal_downvotes?: number;
  search?: string;
}

class AreaForm extends React.Component<InjectedFormikProps<Props & injectedLocalized & InjectedIntlProps, FormValues>> {

  levelsOptionList = () => (
    ['project', 'topic', 'area'].map(level => ({
      label: this.props.intl.formatMessage(messages[`level_${level}`]),
      value: level,
    }))
  )

  resourcesToOptionList = (resources: any) => {
    return resources && resources.map((resource: any) => ({
      label: this.props.localize(resource.attributes.title_multiloc),
      value: resource.id,
    }));
  }

  render() {
    const { isSubmitting, errors, isValid, touched } = this.props;

    return (
      <Form>

        <Section>

          <SectionTitle>
            <FormattedMessage {...messages.titleClusterInformation} />
          </SectionTitle>
          <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={<FormattedMessage {...messages.fieldTitle} />}
            />
            {touched.title_multiloc && <Error
              fieldName="title_multiloc"
              apiErrors={errors.title_multiloc}
            />}
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldLevels} />
            </Label>
            <Field
              name="levels"
              component={FormikMultipleSelect}
              options={this.levelsOptionList()}
            />
          </SectionField>

          <SectionField>
            <Field
              name="drop_empty"
              component={FormikToggle}
              label={<FormattedMessage {...messages.fieldDropEmpty} />}
            />
          </SectionField>

        </Section>

        <Section>

          <SectionTitle>
            <FormattedMessage {...messages.titleFilters} />
          </SectionTitle>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldProjects} />
            </Label>
            <GetProjects>
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
              <FormattedMessage {...messages.fieldIdeaStatus} />
            </Label>
            <GetIdeaStatuses>
              {(ideaStatuses) => (ideaStatuses && isNilOrError(ideaStatuses)) ? null : (
                <Field
                  name="ideaStatuses"
                  component={FormikMultipleSelect}
                  options={this.resourcesToOptionList(ideaStatuses)}
                />
              )}
            </GetIdeaStatuses>
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldSearch} />
            </Label>
            <Field
              name="search"
              component={FormikInput}
              type="text"
            />
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldMinimalTotalVotes} />
            </Label>
            <Field
              name="minimal_total_votes"
              component={FormikInput}
              type="number"
            />
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldMinimalUpvotes} />
            </Label>
            <Field
              name="minimal_upvotes"
              component={FormikInput}
              type="number"
            />
          </SectionField>


          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldMinimalDownvotes} />
            </Label>
            <Field
              name="minimal_downvotes"
              component={FormikInput}
              type="number"
            />
          </SectionField>

        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
        />

      </Form>
    );
  }
}

export default injectIntl(localize(AreaForm));
