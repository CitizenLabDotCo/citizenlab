import React, { PureComponent } from 'react';
import { Form, Field, InjectedFormikProps } from 'formik';

// Components
import FormikMultipleSelect from 'components/UI/FormikMultipleSelect';
import { Section, SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';
import FormikInput from 'components/UI/FormikInput';
import Label from 'components/UI/Label';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import localize, { injectedLocalized } from 'utils/localize';
import messages from '../messages';

// Resources
import GetTopics from 'resources/GetTopics';
import GetProjects from 'resources/GetProjects';

// Utils
import { isNilOrError } from 'utils/helperUtils';
import Collapse from 'components/admin/Collapse';
import FormikToggle from 'components/UI/FormikToggle';
import Button from 'components/UI/Button';

export interface Props { }

export interface FormValues {
  width: number;
  height: number;
  showHeader: boolean;
  headerText: string;
  topics: string[];
  projects: string[];
  limit: number;
}

interface State {
  openedCollapse: 'ideas' | 'style' | 'headerAndFooter' | null;
}

class WidgetForm extends PureComponent<InjectedFormikProps<Props & injectedLocalized, FormValues>, State> {

  constructor(props) {
    super(props);
    this.state = {
      openedCollapse: null,
    };
  }
  resourcesToOptionList = (resources) => {
    return resources && resources.map((resource) => ({
      label: this.props.localize(resource.attributes.title_multiloc),
      value: resource.id,
    }));
  }

  handleCollapseToggle = (collapse) => () => {
    this.setState({
      openedCollapse: this.state.openedCollapse === collapse ? null : collapse,
    });
  }

  handleSubmit = () => {
    this.props.handleSubmit();
  }

  render() {
    const { errors, touched, values } = this.props;
    const { openedCollapse } = this.state;

    return (
      <Form>

        <Collapse
          opened={openedCollapse === 'style'}
          onToggle={this.handleCollapseToggle('style')}
          label={<FormattedMessage {...messages.titleStyle} />}
        >
          <Section>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldWidth} />
              </Label>
                <Field
                  name="width"
                  component={FormikInput}
                  type="number"
                />
              {touched.width && <Error
                fieldName="width"
                apiErrors={errors.width as any}
              />}
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldHeight} />
              </Label>
              <Field
                name="height"
                component={FormikInput}
                type="number"
              />
              {touched.height && <Error
                fieldName="height"
                apiErrors={errors.height as any}
              />}
            </SectionField>

          </Section>

        </Collapse>

        <Collapse
          opened={openedCollapse === 'headerAndFooter'}
          onToggle={this.handleCollapseToggle('headerAndFooter')}
          label={<FormattedMessage {...messages.titleHeaderAndFooter} />}
        >
          <Section>

            <SectionField>
              <Field
                name="showHeader"
                component={FormikToggle}
                label={<FormattedMessage {...messages.fieldShowHeader} />}
              />
              {touched.showHeader && <Error
                fieldName="showHeader"
                apiErrors={errors.showHeader as any}
              />}
            </SectionField>

            {values.showHeader &&
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.fieldHeaderText} />
                </Label>
                <Field
                  name="headerText"
                  component={FormikInput}
                  type="text"
                />
                {touched.headerText && <Error
                  fieldName="headerText"
                  apiErrors={errors.headerText as any}
                />}
              </SectionField>
            }

          </Section>

        </Collapse>

        <Collapse
          opened={openedCollapse === 'ideas'}
          onToggle={this.handleCollapseToggle('ideas')}
          label={<FormattedMessage {...messages.titleIdeaContent} />}
        >
          <Section>

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

        </Collapse>

        <Button
          fullWidth={false}
          onClick={this.handleSubmit}
        >
          <FormattedMessage {...messages.updatePreview} />
        </Button>

      </Form>
    );
  }
}

export default localize(WidgetForm);
