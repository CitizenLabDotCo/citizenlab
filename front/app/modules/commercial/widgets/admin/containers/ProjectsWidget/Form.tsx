import React, { useState } from 'react';

import { Label } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
import GetProjects from 'resources/GetProjects';

import { IProjectData } from 'api/projects/types';
import useProjectFolders from 'api/project_folders/useProjectFolders';

import useLocalize from 'hooks/useLocalize';

import { SectionField } from 'components/admin/Section';
import Input from 'components/HookForm/Input';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import Select from 'components/HookForm/Select';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';
import SharedFormSections from '../WidgetBuilder/SharedFormSections';
import { SharedFormValues } from '../WidgetBuilder/shared';
import { StyledCollapse, StyledSection } from '../WidgetBuilder/styles';

interface FormValues extends SharedFormValues {
  projects: string[];
  folders: string[];
  sort: 'platform_order' | 'newest' | 'ending_soon' | 'most_participants';
  limit: number;
}

const ProjectsWidgetForm = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const methods = useFormContext();
  const [openedCollapse, setOpenedCollapse] = useState<string | null>(null);
  const { data: projectFolders } = useProjectFolders({});

  const handleCollapseToggle = (section: string) => {
    setOpenedCollapse(openedCollapse === section ? null : section);
  };

  const resourcesToOptionList = (resources) => {
    return (
      resources &&
      resources.map((resource) => ({
        label: localize(resource.attributes.title_multiloc),
        value: resource.id,
      }))
    );
  };

  const sortOptions = () => [
    {
      value: 'platform_order',
      label: formatMessage(messages.projectSortPlatformOrder),
    },
    { value: 'newest', label: formatMessage(messages.projectSortNewest) },
    {
      value: 'ending_soon',
      label: formatMessage(messages.projectSortEndingSoon),
    },
    {
      value: 'most_participants',
      label: formatMessage(messages.projectSortMostParticipants),
    },
  ];

  const relativeLinkOptions = (projects?: IProjectData[] | null) => [
    { value: '/', label: formatMessage(messages.homepage) },
    ...(!projects
      ? []
      : projects.map((project) => ({
          value: `/projects/${project.attributes.slug}`,
          label: localize(project.attributes.title_multiloc),
        }))),
  ];

  const selectedProjects: string[] = methods.watch('projects') || [];
  const hasSelectedProjects = selectedProjects.length > 0;

  // TODO: Consider filtering to only published folders (like with projects),
  // or folders visible to everyone (then we also need to change this for projects).
  const folderOptions = projectFolders
    ? resourcesToOptionList(projectFolders.data)
    : [];

  return (
    <>
      <SharedFormSections
        openedCollapse={openedCollapse}
        onToggleCollapse={handleCollapseToggle}
      />

      <StyledCollapse
        opened={openedCollapse === 'content'}
        onToggle={() => handleCollapseToggle('content')}
        label={<FormattedMessage {...messages.titleContent} />}
      >
        <StyledSection>
          <SectionField>
            <Label htmlFor="projects">
              <FormattedMessage {...messages.fieldProjects} />
            </Label>
            <GetProjects publicationStatuses={['published']}>
              {(projects) =>
                projects && isNilOrError(projects) ? null : (
                  <MultipleSelect
                    name="projects"
                    options={resourcesToOptionList(projects)}
                  />
                )
              }
            </GetProjects>
          </SectionField>
          <SectionField>
            <Label htmlFor="folders">
              <FormattedMessage {...messages.fieldFolders} />
            </Label>
            <MultipleSelect name="folders" options={folderOptions} />
          </SectionField>
          <SectionField>
            <Select
              name="sort"
              label={<FormattedMessage {...messages.fieldSort} />}
              options={sortOptions()}
            />
          </SectionField>
          {!hasSelectedProjects && (
            <SectionField>
              <Input
                type="number"
                label={formatMessage(messages.fieldProjectsLimit)}
                name="limit"
              />
            </SectionField>
          )}
          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldDestinationLink} />
            </Label>
            <GetProjects publicationStatuses={['published', 'archived']}>
              {(projects) =>
                projects && isNilOrError(projects) ? null : (
                  <Select
                    name="relativeLink"
                    options={relativeLinkOptions(projects)}
                    disabled={
                      !methods.getValues('showHeader') &&
                      !methods.getValues('showFooter')
                    }
                  />
                )
              }
            </GetProjects>
          </SectionField>
        </StyledSection>
      </StyledCollapse>
    </>
  );
};

export default ProjectsWidgetForm;
