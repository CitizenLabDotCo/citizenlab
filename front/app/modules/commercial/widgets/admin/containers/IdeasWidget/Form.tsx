import React, { useState } from 'react';

import { Label } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
import GetProjects from 'resources/GetProjects';
import GetTopics from 'resources/GetTopics';

import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { SectionField } from 'components/admin/Section';
import Input from 'components/HookForm/Input';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import Select from 'components/HookForm/Select';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';
import SharedFormSections from '../WidgetBuilder/SharedFormSections';
import { StyledCollapse, StyledSection } from '../WidgetBuilder/styles';

const IdeasWidgetForm = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const methods = useFormContext();
  const [openedCollapse, setOpenedCollapse] = useState<string | null>(null);

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
    { value: 'trending', label: formatMessage(messages.sortTrending) },
    { value: 'popular', label: formatMessage(messages.sortPopular) },
    { value: 'new', label: formatMessage(messages.sortNewest) },
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
            <GetProjects publicationStatuses={['published', 'archived']}>
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
            <Label htmlFor="topics">
              <FormattedMessage {...messages.fieldTopics} />
            </Label>
            <GetTopics>
              {(topics) =>
                topics && isNilOrError(topics) ? null : (
                  <MultipleSelect
                    name="topics"
                    options={resourcesToOptionList(topics)}
                  />
                )
              }
            </GetTopics>
          </SectionField>
          <SectionField>
            <Select
              name="sort"
              label={<FormattedMessage {...messages.fieldSort} />}
              options={sortOptions()}
            />
          </SectionField>
          <SectionField>
            <Input
              type="number"
              label={<FormattedMessage {...messages.fieldInputsLimit} />}
              name="limit"
            />
          </SectionField>
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

export default IdeasWidgetForm;
