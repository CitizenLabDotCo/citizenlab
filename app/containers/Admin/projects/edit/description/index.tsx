import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// Services
import { updateProject } from 'services/projects';

// Resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';

// Components
import { Section, SectionField, SectionTitle, SectionSubtitle } from 'components/admin/Section';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Success from 'components/UI/Success';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';

// Styling
import styled from 'styled-components';

// Typing
import { Multiloc, Locale } from 'typings';

const Container = styled.div``;

const ButtonContainer = styled.div`
  display: flex;
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  descriptionPreviewMultiloc: Multiloc | null;
  descriptionMultiloc: Multiloc | null;
  touched: boolean;
  processing: boolean;
  success: boolean;
  errors: { [key: string]: any };
}

class ProjectDescription extends PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {

  constructor(props) {
    super(props);
    this.state = {
      descriptionPreviewMultiloc: null,
      descriptionMultiloc: null,
      touched: false,
      processing: false,
      success: false,
      errors: {}
    };
  }

  componentDidMount() {
    this.mapPropsToState();
  }

  componentDidUpdate(prevProps: Props) {
    if (isNilOrError(prevProps.project) && !isNilOrError(this.props.project)) {
      this.mapPropsToState();
    }
  }

  mapPropsToState = () => {
    const { project } = this.props;

    if (!isNilOrError(project)) {
      this.setState({
        descriptionPreviewMultiloc: project.attributes.description_preview_multiloc,
        descriptionMultiloc: project.attributes.description_multiloc,
      });
    }
  }

  handleDescriptionPreviewOnChange = (descriptionPreviewMultiloc: Multiloc, _locale: Locale) => {
    this.setState({
      descriptionPreviewMultiloc,
      touched: true,
      success: false
    });
  }

  handleDescriptionOnChange = (descriptionMultiloc: Multiloc, _locale: Locale) => {
    this.setState({
      descriptionMultiloc,
      touched: true,
      success: false
    });
  }

  validate = () => {
    const { tenantLocales } = this.props;
    const { descriptionPreviewMultiloc, descriptionMultiloc } = this.state;

    if (!isNilOrError(tenantLocales)) {
      // check that all fields have content for all tenant locales
      return tenantLocales.every(locale => !isEmpty(descriptionPreviewMultiloc?.[locale]) && !isEmpty(descriptionMultiloc?.[locale]));
    }

    return false;
  }

  handleOnSubmit = async () => {
    const { project } = this.props;
    const { processing, descriptionPreviewMultiloc, descriptionMultiloc } = this.state;

    if (!processing && this.validate() && !isNilOrError(project) && descriptionMultiloc && descriptionPreviewMultiloc) {
      this.setState({
        processing: true,
        success: false,
        errors: {}
      });

      try {
        await updateProject(project.id, {
          description_multiloc: descriptionMultiloc,
          description_preview_multiloc: descriptionPreviewMultiloc
        });
      } catch (errorResponse) {
        this.setState({
          processing: false,
          errors: errorResponse?.json?.errors || false,
          success: false
        });
      }

      this.setState({
        processing: false,
        success: true,
        touched: false,
        errors: {}
      });
    }
  }

  render() {
    const { intl: { formatMessage }, project } = this.props;
    const { descriptionPreviewMultiloc, descriptionMultiloc, processing, errors, success, touched } = this.state;

    if (!isNilOrError(project)) {
      return (
        <Container>
          <SectionTitle>
            <FormattedMessage {...messages.titleDescription} />
          </SectionTitle>
          <SectionSubtitle>
            <FormattedMessage {...messages.subtitleDescription} />
          </SectionSubtitle>

          <Section>
            <SectionField>
              <TextAreaMultilocWithLocaleSwitcher
                id="project-description-preview"
                valueMultiloc={descriptionPreviewMultiloc}
                onChange={this.handleDescriptionPreviewOnChange}
                label={formatMessage(messages.descriptionPreviewLabel)}
                labelTooltipText={formatMessage(messages.descriptionPreviewTooltip)}
                rows={5}
                maxCharCount={280}
              />
              <Error fieldName="description_preview_multiloc" apiErrors={errors?.description_preview_multiloc} />
            </SectionField>

            <SectionField>
              <QuillMultilocWithLocaleSwitcher
                id="project-description"
                valueMultiloc={descriptionMultiloc}
                onChange={this.handleDescriptionOnChange}
                label={formatMessage(messages.descriptionLabel)}
                labelTooltipText={formatMessage(messages.descriptionTooltip)}
              />
              <Error fieldName="description_multiloc" apiErrors={errors?.description_multiloc} />
            </SectionField>
          </Section>

          <ButtonContainer>
            <Button
              buttonStyle="admin-dark"
              onClick={this.handleOnSubmit}
              processing={processing}
              disabled={!touched || !this.validate()}
            >
              {success
                ? <FormattedMessage {...messages.saved} />
                : <FormattedMessage {...messages.save} />
              }
            </Button>

            {success &&
              <Success
                text={formatMessage(messages.saveSuccessMessage)}
                showBackground={false}
                showIcon={false}
              />
            }

            {!isEmpty(errors) &&
              <Error
                text={formatMessage(messages.errorMessage)}
                showBackground={false}
                showIcon={false}
              />
            }
          </ButtonContainer>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  tenantLocales: <GetTenantLocales />,
  project: ({ params, render }) => <GetProject projectId={params.projectId}>{render}</GetProject>
});

const ProjectDescriptionWithHOCs = injectIntl(ProjectDescription);

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectDescriptionWithHOCs {...inputProps} {...dataProps} />}
  </Data>
));
