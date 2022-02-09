import React, { useState } from 'react';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { Input, Box, Icon, Spinner } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Checkbox from 'components/UI/Checkbox';
import CheckboxWithPartialCheck from 'components/UI/CheckboxWithPartialCheck';
import { CSSTransition } from 'react-transition-group';

// resources
import { adopt } from 'react-adopt';
import GetProjects, {
  GetProjectsChildProps,
  PublicationStatus,
} from 'resources/GetProjects';

// hooks
import useLocalize from 'hooks/useLocalize';
import useProjectFolders from 'modules/commercial/project_folders/hooks/useProjectFolders';

// services
import { addInsightsView } from 'modules/commercial/insights/services/insightsViews';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// typings
import { CLErrors } from 'typings';

const Title = styled.h1`
  text-align: center;
  font-size: ${fontSizes.xxl}px;
`;

const Description = styled.p`
  text-align: center;
  padding-top: 10px;
  font-size: ${fontSizes.base}px;
`;

interface DataProps {
  projects: GetProjectsChildProps;
}

interface InputProps {
  closeCreateModal: () => void;
}

const timeout = 400;

const ArrowIcon = styled(Icon)`
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  transform: rotate(90deg);
  transition: all 0.2s linear;
  margin-left: 5px;

  &.open {
    transform: rotate(0deg);
  }
`;

const AnimatedFieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;
  opacity: 0;
  display: none;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: opacity, height;

  &.collapse-enter {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;
    display: block;

    &.collapse-enter-active {
      opacity: 1;
      max-height: 350px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-enter-done {
    opacity: 1;
    overflow: visible;
    display: block;
  }

  &.collapse-exit {
    opacity: 1;
    max-height: 350px;
    overflow: hidden;
    display: block;

    &.collapse-exit-active {
      opacity: 0;
      max-height: 0px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-exit-done {
    display: none;
  }
`;

const StyledCheckboxWithPartialCheck = styled(CheckboxWithPartialCheck)`
  label {
    font-size: ${fontSizes.small}px;
    color: ${colors.adminTextColor};
  }
`;

export const CreateInsightsView = ({
  projects,
  closeCreateModal,
}: DataProps & InputProps) => {
  const localize = useLocalize();
  const { projectFolders } = useProjectFolders({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CLErrors | undefined>();

  const [name, setName] = useState<string | null>();
  const onChangeName = (value: string) => {
    setName(value);
    setErrors(undefined);
  };

  const [selectedProjectsIds, setSelectedProjectsIds] = useState<string[]>([]);
  const [expandedFoldersIds, setExpandedFoldersIds] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (name && selectedProjectsIds.length) {
      setLoading(true);
      try {
        const result = await addInsightsView({
          name,
          data_sources: selectedProjectsIds.map((projectId) => ({
            origin_id: projectId,
          })),
        });
        if (!isNilOrError(result)) {
          closeCreateModal();
          clHistory.push(`/admin/insights/${result.data.id}`);
        }
      } catch (errors) {
        setErrors(errors.json.errors);
        setLoading(false);
      }
    }
  };

  const toggleSelectProject = (projectId: string) => {
    if (selectedProjectsIds.includes(projectId)) {
      setSelectedProjectsIds(
        selectedProjectsIds.filter((id) => id !== projectId)
      );
    } else {
      setSelectedProjectsIds([...selectedProjectsIds, projectId]);
    }
  };
  const toggleExpandFolder = (folderId: string) => {
    if (expandedFoldersIds.includes(folderId)) {
      setExpandedFoldersIds(expandedFoldersIds.filter((id) => id !== folderId));
    } else {
      setExpandedFoldersIds([...expandedFoldersIds, folderId]);
    }
  };

  // const toggleSelectFolder = (folderId: string) => {

  // Folders to display
  const folders = !isNilOrError(projectFolders)
    ? projectFolders
        .map((folder) => ({
          id: folder.id,
          folderName: localize(folder.attributes.title_multiloc),
          folderProjects: !isNilOrError(projects.projectsList)
            ? projects.projectsList.filter(
                (project) => project.attributes.folder_id === folder.id
              )
            : [],
        }))
        .filter((folder) => folder.folderProjects.length > 0)
    : [];

  return (
    <Box
      w="100%"
      maxWidth="450px"
      m="40px auto"
      color={colors.adminTextColor}
      data-testid="insightsCreateModal"
    >
      <Title>
        <FormattedMessage {...messages.createModalTitle} />
      </Title>
      <Description>
        <FormattedMessage {...messages.createModalDescription} />
      </Description>
      <Box as="form" mt="50px">
        <SectionField>
          <Input
            type="text"
            id="view_name"
            value={name}
            onChange={onChangeName}
            label={<FormattedMessage {...messages.createModalNameLabel} />}
          />
          {errors && <Error apiErrors={errors['name']} fieldName="view_name" />}
        </SectionField>
        <Box>
          {!projects.projectsList && <Spinner />}
          {projects.projectsList?.map((project) =>
            project.attributes.folder_id ? null : (
              <Box
                key={project.id}
                py="15px"
                borderBottom={`1px solid ${colors.separation}`}
              >
                <Checkbox
                  size="20px"
                  onChange={() => toggleSelectProject(project.id)}
                  label={localize(project.attributes.title_multiloc)}
                  checked={selectedProjectsIds.includes(project.id)}
                />
              </Box>
            )
          )}
          {folders.map((folder) => (
            <Box key={folder.id}>
              <Box
                py="15px"
                borderBottom={`1px solid ${colors.separation}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <StyledCheckboxWithPartialCheck
                  id={folder.id}
                  size="20px"
                  onChange={() => toggleSelectProject(folder.id)}
                  label={folder.folderName}
                  checked={
                    folder.folderProjects?.every((project) =>
                      selectedProjectsIds.includes(project.id)
                    )
                      ? true
                      : folder.folderProjects?.some((project) =>
                          selectedProjectsIds.includes(project.id)
                            ? 'mixed'
                            : false
                        )
                  }
                />
                <Button
                  onClick={() => toggleExpandFolder(folder.id)}
                  buttonStyle="text"
                  type="button"
                  ariaExpanded={expandedFoldersIds.includes(folder.id)}
                  py="0px"
                >
                  {expandedFoldersIds.includes(folder.id) ? (
                    <FormattedMessage {...messages.createModalCollapse} />
                  ) : (
                    <FormattedMessage {...messages.createModalExpand} />
                  )}
                  <ArrowIcon
                    name="dropdown"
                    className={
                      expandedFoldersIds.includes(folder.id) ? 'open' : ''
                    }
                    ariaHidden
                  />
                </Button>
              </Box>
              <Box>
                <CSSTransition
                  classNames="collapse"
                  in={expandedFoldersIds.includes(folder.id)}
                  appear={expandedFoldersIds.includes(folder.id)}
                  timeout={timeout}
                  mounOnEnter={false}
                  unmountOnExit={false}
                  enter={true}
                  exit={true}
                >
                  <AnimatedFieldset>
                    {folder.folderProjects?.map((project) => (
                      <Box key={project.id} py="15px" ml="36px">
                        <Checkbox
                          id={project.id}
                          size="20px"
                          onChange={() => toggleSelectProject(project.id)}
                          label={localize(project.attributes.title_multiloc)}
                          checked={selectedProjectsIds.includes(project.id)}
                        />
                      </Box>
                    ))}
                  </AnimatedFieldset>
                </CSSTransition>
              </Box>
            </Box>
          ))}
        </Box>
        <Box display="flex" justifyContent="center" mt="60px">
          <Button
            processing={loading}
            disabled={!name || selectedProjectsIds.length === 0}
            onClick={handleSubmit}
            bgColor={colors.adminTextColor}
          >
            <FormattedMessage {...messages.createModalSaveView} />
          </Button>
          <Button onClick={closeCreateModal} buttonStyle="secondary" ml="5px">
            <FormattedMessage {...messages.createModalCancel} />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const publicationStatuses: PublicationStatus[] = [
  'published',
  'archived',
  'draft',
];

const Data = adopt<DataProps>({
  projects: (
    <GetProjects
      publicationStatuses={publicationStatuses}
      filterCanModerate={true}
    />
  ),
});

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps: DataProps) => (
      <CreateInsightsView {...dataProps} {...inputProps} />
    )}
  </Data>
);
