import React, { PureComponent } from 'react';
import { Form, Field, InjectedFormikProps } from 'formik';

// Components
import FormikMultipleSelect from 'components/UI/FormikMultipleSelect';
import { Section, SubSection, SectionField } from 'components/admin/Section';
import { default as ErrorxBox } from 'components/UI/Error';
import FormikInput from 'components/UI/FormikInput';
import { Label } from 'cl2-component-library';
import Collapse from 'components/UI/Collapse';
import FormikToggle from 'components/UI/FormikToggle';
import FormikColorPickerInput from 'components/UI/FormikColorPickerInput';
import FormikSelect from 'components/UI/FormikSelect';

// I18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from '../messages';

// Resources
import GetTopics from 'resources/GetTopics';
import GetProjects from 'resources/GetProjects';

// Utils
import { isNilOrError } from 'utils/helperUtils';
import { IProjectData } from 'services/projects';

// Styling
import styled from 'styled-components';

const StyledCollapse = styled(Collapse)`
  flex: 1;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const StyledSection = styled(Section)`
  width: 100%;
  max-width: 500px;
  padding: 20px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ddd;
  background: #fff;
`;

export interface Props {}

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

class WidgetForm extends PureComponent<
  InjectedFormikProps<
    Props & InjectedIntlProps & InjectedLocalized,
    FormValues
  >,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      openedCollapse: null,
    };
  }

  resourcesToOptionList = (resources) => {
    return (
      resources &&
      resources.map((resource) => ({
        label: this.props.localize(resource.attributes.title_multiloc),
        value: resource.id,
      }))
    );
  };

  sortOptions = () => {
    return [
      {
        value: 'trending',
        label: this.props.intl.formatMessage(messages.sortTrending),
      },
      {
        value: 'popular',
        label: this.props.intl.formatMessage(messages.sortPopular),
      },
      {
        value: 'new',
        label: this.props.intl.formatMessage(messages.sortNewest),
      },
    ];
  };

  relativeLinkOptions = (projects?: IProjectData[] | null) => {
    return [
      {
        value: '/',
        label: this.props.intl.formatMessage(messages.homepage),
      },
      ...(!projects
        ? []
        : projects.map((project) => ({
            value: `/projects/${project.attributes.slug}`,
            label: this.props.localize(project.attributes.title_multiloc),
          }))),
    ];
  };

  handleCollapseToggle = (collapse) => () => {
    this.setState({
      openedCollapse: this.state.openedCollapse === collapse ? null : collapse,
    });
  };

  handleSubmit = () => {
    this.props.handleSubmit();
  };

  render() {
    const { errors, touched, values } = this.props;
    const { openedCollapse } = this.state;

    return (
      <Form>
        <StyledCollapse
          opened={openedCollapse === 'dimensions'}
          onToggle={this.handleCollapseToggle('dimensions')}
          label={<FormattedMessage {...messages.titleDimensions} />}
        >
          <StyledSection>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldWidth} />
              </Label>
              <Field name="width" component={FormikInput} type="number" />
              {touched.width && (
                <ErrorxBox fieldName="width" apiErrors={errors.width as any} />
              )}
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldHeight} />
              </Label>
              <Field name="height" component={FormikInput} type="number" />
              {touched.height && (
                <ErrorxBox
                  fieldName="height"
                  apiErrors={errors.height as any}
                />
              )}
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldFontSize} />
              </Label>
              <Field name="fontSize" component={FormikInput} type="number" />
              {touched.fontSize && (
                <ErrorxBox
                  fieldName="fontSize"
                  apiErrors={errors.fontSize as any}
                />
              )}
            </SectionField>
          </StyledSection>
        </StyledCollapse>

        <StyledCollapse
          opened={openedCollapse === 'style'}
          onToggle={this.handleCollapseToggle('style')}
          label={<FormattedMessage {...messages.titleStyle} />}
        >
          <StyledSection>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldSiteBackgroundColor} />
              </Label>
              <Field name="siteBgColor" component={FormikColorPickerInput} />
              {touched.siteBgColor && (
                <ErrorxBox
                  fieldName="siteBgColor"
                  apiErrors={errors.siteBgColor as any}
                />
              )}
            </SectionField>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldBackgroundColor} />
              </Label>
              <Field name="bgColor" component={FormikColorPickerInput} />
              {touched.bgColor && (
                <ErrorxBox
                  fieldName="bgColor"
                  apiErrors={errors.bgColor as any}
                />
              )}
            </SectionField>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldTextColor} />
              </Label>
              <Field name="textColor" component={FormikColorPickerInput} />
              {touched.textColor && (
                <ErrorxBox
                  fieldName="textColor"
                  apiErrors={errors.textColor as any}
                />
              )}
            </SectionField>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldAccentColor} />
              </Label>
              <Field name="accentColor" component={FormikColorPickerInput} />
              {touched.accentColor && (
                <ErrorxBox
                  fieldName="accentColor"
                  apiErrors={errors.accentColor as any}
                />
              )}
            </SectionField>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldFont} />
              </Label>
              <Field name="font" component={FormikInput} />
              <p>
                <FormattedMessage
                  {...messages.fieldFontDescription}
                  values={{
                    googleFontsLink: (
                      <a href="https://fonts.google.com" target="_blank">
                        Google Fonts
                      </a>
                    ),
                  }}
                />
              </p>
              {touched.font && (
                <ErrorxBox fieldName="font" apiErrors={errors.font as any} />
              )}
            </SectionField>
          </StyledSection>
        </StyledCollapse>

        <StyledCollapse
          opened={openedCollapse === 'headerAndFooter'}
          onToggle={this.handleCollapseToggle('headerAndFooter')}
          label={<FormattedMessage {...messages.titleHeaderAndFooter} />}
        >
          <>
            <StyledSection>
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.fieldRelativeLink} />
                </Label>
                <GetProjects publicationStatuses={['published', 'archived']}>
                  {(projects) =>
                    projects && isNilOrError(projects) ? null : (
                      <Field
                        name="relativeLink"
                        component={FormikSelect}
                        options={this.relativeLinkOptions(
                          projects.projectsList
                        )}
                        clearable={false}
                        disabled={!values.showHeader && !values.showFooter}
                      />
                    )
                  }
                </GetProjects>
                {touched.relativeLink && (
                  <ErrorxBox
                    fieldName="relativeLink"
                    apiErrors={errors.relativeLink as any}
                  />
                )}
              </SectionField>

              <SectionField>
                <Field
                  name="showHeader"
                  component={FormikToggle}
                  label={<FormattedMessage {...messages.fieldShowHeader} />}
                />
                {touched.showHeader && (
                  <ErrorxBox
                    fieldName="showHeader"
                    apiErrors={errors.showHeader as any}
                  />
                )}
              </SectionField>

              {values.showHeader && (
                <SubSection>
                  <SectionField>
                    <Field
                      name="showLogo"
                      component={FormikToggle}
                      label={<FormattedMessage {...messages.fieldShowLogo} />}
                    />
                    {touched.showLogo && (
                      <ErrorxBox
                        fieldName="showLogo"
                        apiErrors={errors.showLogo as any}
                      />
                    )}
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
                    {touched.headerText && (
                      <ErrorxBox
                        fieldName="headerText"
                        apiErrors={errors.headerText as any}
                      />
                    )}
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
                    {touched.headerSubText && (
                      <ErrorxBox
                        fieldName="headerSubText"
                        apiErrors={errors.headerSubText as any}
                      />
                    )}
                  </SectionField>
                </SubSection>
              )}
            </StyledSection>

            <StyledSection>
              <SectionField>
                <Field
                  name="showFooter"
                  component={FormikToggle}
                  label={<FormattedMessage {...messages.fieldShowFooter} />}
                />
                {touched.showFooter && (
                  <ErrorxBox
                    fieldName="showFooter"
                    apiErrors={errors.showFooter as any}
                  />
                )}
              </SectionField>

              {values.showFooter && (
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
                    {touched.buttonText && (
                      <ErrorxBox
                        fieldName="buttonText"
                        apiErrors={errors.buttonText as any}
                      />
                    )}
                  </SectionField>
                </SubSection>
              )}
            </StyledSection>
          </>
        </StyledCollapse>

        <StyledCollapse
          opened={openedCollapse === 'ideas'}
          onToggle={this.handleCollapseToggle('ideas')}
          label={<FormattedMessage {...messages.titleInputSelection} />}
        >
          <StyledSection>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldProjects} />
              </Label>
              <GetProjects publicationStatuses={['published', 'archived']}>
                {(projects) =>
                  projects && isNilOrError(projects) ? null : (
                    <Field
                      name="projects"
                      component={FormikMultipleSelect}
                      options={this.resourcesToOptionList(
                        projects.projectsList
                      )}
                    />
                  )
                }
              </GetProjects>
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldTopics} />
              </Label>
              <GetTopics>
                {(topics) =>
                  topics && isNilOrError(topics) ? null : (
                    <Field
                      name="topics"
                      component={FormikMultipleSelect}
                      options={this.resourcesToOptionList(topics)}
                    />
                  )
                }
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
                <FormattedMessage {...messages.fieldInputsLimit} />
              </Label>
              <Field name="limit" component={FormikInput} type="number" />
              {touched.limit && (
                <ErrorxBox fieldName="limit" apiErrors={errors.limit as any} />
              )}
            </SectionField>
          </StyledSection>
        </StyledCollapse>
      </Form>
    );
  }
}

export default injectIntl(localize(WidgetForm));
