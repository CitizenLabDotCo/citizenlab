import React from 'react';
// components
import ProjectStatusPicker from './components/ProjectStatusPicker';
import ProjectNameInput from './components/ProjectNameInput';
import SlugInput from 'components/admin/SlugInput';
import ProjectTypePicker from './components/ProjectTypePicker';
import TopicInputs from './components/TopicInputs';
import GeographicAreaInputs from './components/GeographicAreaInputs';
import HeaderImageDropzone from './components/HeaderImageDropzone';
import ProjectImageDropzone from './components/ProjectImageDropzone';
import AttachmentsDropzone from './components/AttachmentsDropzone';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import {
  Section,
  SectionTitle,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import ParticipationContext, {
  IParticipationContextConfig,
} from '../participationContext';
import Outlet from 'components/Outlet';
import {
  StyledForm,
  ProjectType,
  StyledSectionField,
  ParticipationContextWrapper,
} from './components/styling';
import { withRouter, WithRouterProps } from 'utils/withRouter';
import useProject from 'hooks/useProject';
// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// animation
import CSSTransition from 'react-transition-group/CSSTransition';

import eventEmitter from 'utils/eventEmitter';

interface Props {}

const AdminProjectEditGeneral = ({
  params: { projectId },
}: Props & WithRouterProps) => {
  const project = useProject({ projectId });
  const onSubmit = (event: FormEvent<any>) => {
    event.preventDefault();

    const { projectType } = this.state;

    // if it's a new project of type continuous
    if (projectType === 'continuous') {
      eventEmitter.emit('getParticipationContext');
    } else {
      save();
    }
  };

  const save = async (
    participationContextConfig: IParticipationContextConfig | null = null
  ) => {
    await save.apply(this, [participationContextConfig]);
  };

  return (
    <StyledForm className="e2e-project-general-form" onSubmit={onSubmit}>
      <Section>
        {projectId && (
          <>
            <SectionTitle>
              <FormattedMessage {...messages.titleGeneral} />
            </SectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.subtitleGeneral} />
            </SectionDescription>
          </>
        )}

        <ProjectStatusPicker
          publicationStatus={publicationStatus}
          handleStatusChange={this.handleStatusChange}
        />

        <ProjectNameInput
          titleMultiloc={projectAttrs.title_multiloc}
          titleError={titleError}
          apiErrors={this.state.apiErrors}
          handleTitleMultilocOnChange={this.handleTitleMultilocOnChange}
        />

        {/* Only show this field when slug is already saved to project (i.e. not when creating a new project, which uses this form as well) */}
        {currentTenant && !isNilOrError(project) && project.attributes.slug && (
          <SlugInput
            slug={slug}
            resource="project"
            apiErrors={apiErrors}
            showSlugErrorMessage={showSlugErrorMessage}
            handleSlugOnChange={this.handleSlugOnChange}
          />
        )}

        <StyledSectionField>
          {!project ? (
            <ProjectTypePicker
              projectType={projectType}
              handleProjectTypeOnChange={this.handleProjectTypeOnChange}
            />
          ) : (
            <>
              <SubSectionTitle>
                <FormattedMessage {...messages.projectTypeTitle} />
              </SubSectionTitle>
              <ProjectType>
                {<FormattedMessage {...messages[projectType]} />}
              </ProjectType>
            </>
          )}

          {!project && (
            <CSSTransition
              classNames="participationcontext"
              in={projectType === 'continuous'}
              timeout={timeout}
              mountOnEnter={true}
              unmountOnExit={true}
              enter={true}
              exit={false}
            >
              <ParticipationContextWrapper>
                <ParticipationContext
                  onSubmit={this.handleParcticipationContextOnSubmit}
                  onChange={this.handleParticipationContextOnChange}
                  apiErrors={apiErrors}
                />
              </ParticipationContextWrapper>
            </CSSTransition>
          )}
        </StyledSectionField>

        {!isNilOrError(project) && projectType === 'continuous' && (
          <ParticipationContext
            projectId={project.id}
            onSubmit={this.handleParcticipationContextOnSubmit}
            onChange={this.handleParticipationContextOnChange}
            apiErrors={apiErrors}
          />
        )}

        <TopicInputs
          selectedTopicIds={selectedTopicIds}
          onChange={this.handleTopicsChange}
        />

        <GeographicAreaInputs
          areaType={areaType}
          areasOptions={areasOptions}
          areasValues={areasValues}
          handleAreaTypeChange={this.handleAreaTypeChange}
          handleAreaSelectionChange={this.handleAreaSelectionChange}
        />

        <Outlet
          id="app.components.AdminPage.projects.form.additionalInputs.inputs"
          projectAttrs={projectAttrs}
          onChange={this.handleFieldUpdate}
          authUser={authUser}
        />

        <HeaderImageDropzone
          projectHeaderImage={projectHeaderImage}
          handleHeaderOnAdd={this.handleHeaderOnAdd}
          handleHeaderOnRemove={this.handleHeaderOnRemove}
        />

        <ProjectImageDropzone
          projectImages={projectImages}
          handleProjectImagesOnAdd={this.handleProjectImagesOnAdd}
          handleProjectImageOnRemove={this.handleProjectImageOnRemove}
        />

        <AttachmentsDropzone
          projectFiles={projectFiles}
          apiErrors={apiErrors}
          handleProjectFileOnAdd={this.handleProjectFileOnAdd}
          handleProjectFileOnRemove={this.handleProjectFileOnRemove}
        />

        <SubmitWrapper
          loading={processing}
          status={submitState}
          messages={{
            buttonSave: messages.saveProject,
            buttonSuccess: messages.saveSuccess,
            messageError: messages.saveErrorMessage,
            messageSuccess: messages.saveSuccessMessage,
          }}
        />
      </Section>
    </StyledForm>
  );
};

export default withRouter(injectIntl(AdminProjectEditGeneral));
