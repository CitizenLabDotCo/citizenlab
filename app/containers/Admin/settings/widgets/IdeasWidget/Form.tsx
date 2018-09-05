import React, { PureComponent } from 'react';
import { Form, Field, InjectedFormikProps } from 'formik';

// Components
import FormikMultipleSelect from 'components/UI/FormikMultipleSelect';
import { Section, SubSection, SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';
import FormikInput from 'components/UI/FormikInput';
import Label from 'components/UI/Label';
import Collapse from 'components/admin/Collapse';
import FormikToggle from 'components/UI/FormikToggle';
import FormikColorPickerInput from 'components/UI/FormikColorPickerInput';
import FormikSelect from 'components/UI/FormikSelect';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import localize, { injectedLocalized } from 'utils/localize';
import messages from '../messages';

// Resources
import GetTopics from 'resources/GetTopics';
import GetProjects from 'resources/GetProjects';

// Utils
import { isNilOrError } from 'utils/helperUtils';
import { IProjectData } from 'services/projects';

export interface Props { }

export interface FormValues {
  width: number;
  height: number;
  siteBgColor: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  font: string | null;
  fontSize: number;
  relativeLink: string;
  showHeader: boolean;
  showLogo: boolean;
  headerText: string;
  headerSubText: string;
  showFooter: boolean;
  buttonText: string;
  sort: 'trending' | 'popular' | 'newest';
  topics: string[];
  projects: string[];
  limit: number;
}

interface State {
  openedCollapse: 'dimensions' | 'ideas' | 'style' | 'headerAndFooter' | null;
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

  sortOptions = () => {
    return [
      {
        value: 'trending',
        label: <FormattedMessage {...messages.sortTrending} />
      },
      {
        value: 'popular',
        label: <FormattedMessage {...messages.sortPopular} />
      },
      {
        value: 'new',
        label: <FormattedMessage {...messages.sortNewest} />
      },
    ];
  }

  relativeLinkOptions = (projects?: IProjectData[] | null) => {
    return [
      {
        value: '/',
        label: <FormattedMessage {...messages.homepage} />,
      },
      ...(!projects ? [] : projects.map((project) => ({
        value: `/projects/${project.attributes.slug}`,
        label: this.props.localize(project.attributes.title_multiloc),
      })))
    ];
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
          opened={openedCollapse === 'dimensions'}
          onToggle={this.handleCollapseToggle('dimensions')}
          label={<FormattedMessage {...messages.titleDimensions} />}
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

            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldFontSize} />
              </Label>
              <Field
                name="fontSize"
                component={FormikInput}
                type="number"
              />
              {touched.fontSize && <Error
                fieldName="fontSize"
                apiErrors={errors.fontSize as any}
              />}
            </SectionField>

          </Section>

        </Collapse>

        <Collapse
          opened={openedCollapse === 'style'}
          onToggle={this.handleCollapseToggle('style')}
          label={<FormattedMessage {...messages.titleStyle} />}
        >
          <Section>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldSiteBackgroundColor} />
              </Label>
              <Field
                name="siteBgColor"
                component={FormikColorPickerInput}
              />
              {touched.siteBgColor && <Error
                fieldName="siteBgColor"
                apiErrors={errors.siteBgColor as any}
              />}
            </SectionField>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldBackgroundColor} />
              </Label>
              <Field
                name="bgColor"
                component={FormikColorPickerInput}
              />
              {touched.bgColor && <Error
                fieldName="bgColor"
                apiErrors={errors.bgColor as any}
              />}
            </SectionField>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldTextColor} />
              </Label>
              <Field
                name="textColor"
                component={FormikColorPickerInput}
              />
              {touched.textColor && <Error
                fieldName="textColor"
                apiErrors={errors.textColor as any}
              />}
            </SectionField>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldAccentColor} />
              </Label>
              <Field
                name="accentColor"
                component={FormikColorPickerInput}
              />
              {touched.accentColor && <Error
                fieldName="accentColor"
                apiErrors={errors.accentColor as any}
              />}
            </SectionField>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldFont} />
              </Label>
              <Field
                name="font"
                component={FormikInput}
              />
              <p>
                <FormattedMessage
                  {...messages.fieldFontDescription}
                  values={{ googleFontsLink: <a href="https://fonts.google.com" target="_blank">Google Fonts</a> }}
                />
              </p>
              {touched.font && <Error
                fieldName="font"
                apiErrors={errors.font as any}
              />}
            </SectionField>
          </Section>
        </Collapse>

        <Collapse
          opened={openedCollapse === 'headerAndFooter'}
          onToggle={this.handleCollapseToggle('headerAndFooter')}
          label={<FormattedMessage {...messages.titleHeaderAndFooter} />}
        >
          <>
            <Section>

              <SectionField>
                <Label>
                  <FormattedMessage {...messages.fieldRelativeLink} />
                </Label>
                <GetProjects publicationStatuses={['published', 'archived']}>
                  {(projects) => (projects && isNilOrError(projects)) ? null : (
                    <Field
                      name="relativeLink"
                      component={FormikSelect}
                      options={this.relativeLinkOptions(projects.projectsList)}
                      clearable={false}
                      disabled={!values.showHeader && !values.showFooter}
                    />
                  )}
                </GetProjects>
                {touched.relativeLink && <Error
                  fieldName="relativeLink"
                  apiErrors={errors.relativeLink as any}
                />}
              </SectionField>

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
                <SubSection>
                  <SectionField>
                    <Field
                      name="showLogo"
                      component={FormikToggle}
                      label={<FormattedMessage {...messages.fieldShowLogo} />}
                    />
                    {touched.showLogo && <Error
                      fieldName="showLogo"
                      apiErrors={errors.showLogo as any}
                    />}
                  </SectionField>
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
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.fieldHeaderSubText} />
                  </Label>
                  <Field
                    name="headerSubText"
                    component={FormikInput}
                    type="text"
                  />
                  {touched.headerSubText && <Error
                    fieldName="headerSubText"
                    apiErrors={errors.headerSubText as any}
                  />}
                </SectionField>
                </SubSection>
              }

            </Section>

            <Section>
              <SectionField>
                <Field
                  name="showFooter"
                  component={FormikToggle}
                  label={<FormattedMessage {...messages.fieldShowFooter} />}
                />
                {touched.showFooter && <Error
                  fieldName="showFooter"
                  apiErrors={errors.showFooter as any}
                />}
              </SectionField>

              {values.showFooter &&
                <SubSection>
                  <SectionField>
                    <Label>
                      <FormattedMessage {...messages.fieldButtonText} />
                    </Label>
                    <Field
                      name="buttonText"
                      component={FormikInput}
                      type="text"
                    />
                    {touched.buttonText && <Error
                      fieldName="buttonText"
                      apiErrors={errors.buttonText as any}
                    />}
                  </SectionField>
                </SubSection>
              }
            </Section>
          </>

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
                <FormattedMessage {...messages.fieldSort} />
              </Label>
              <Field
                name="sort"
                component={FormikSelect}
                clearable={false}
                options={this.sortOptions()}
              />
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

      </Form>
    );
  }
}

export default localize(WidgetForm);
