import React, { FormEvent, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc } from 'typings';

import { Visibility } from 'api/projects/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import generalMessages from 'containers/Admin/projects/project/general/messages';

import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import validateTitle from 'utils/validateTitle';

import { FIND_OPTIONS, Listed, OPEN_OPTIONS } from '../../visibilityOptions';
import visibilityMessages from '../../visibilityOptions/messages';
import ProjectContextPickers from '../ProjectContextPickers';
import { SpaceAndFolderId } from '../ProjectSetupForm/ProjectContextSection/types';

import ChoiceRadio from './ChoiceRadio';
import FormSection from './FormSection';
import GroupsPicker from './GroupsPicker';
import messages from './messages';

export interface NewProjectValues extends SpaceAndFolderId {
  title_multiloc: Multiloc;
  listed: boolean;
  visible_to: Visibility;
  groupIds: string[];
}

interface Props {
  id: string;
  failed: boolean;
  apiErrors: CLErrors;
  onSubmit: (values: NewProjectValues) => void;
}

const NewProjectForm = ({ id, failed, apiErrors, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const locales = useAppConfigurationLocales();

  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc>({});
  const [titleError, setTitleError] = useState<Multiloc | null>(null);
  const [context, setContext] = useState<SpaceAndFolderId>({
    space_id: null,
    folder_id: null,
  });
  const [listed, setListed] = useState<Listed>('listed');
  const [visibleTo, setVisibleTo] = useState<Visibility>('admins');
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [groupsError, setGroupsError] = useState(false);

  if (!locales) return null;

  const handleTitleChange = (titleMultiloc: Multiloc) => {
    setTitleMultiloc(titleMultiloc);
    setTitleError(null);
  };

  const handleGroupsChange = (groupIds: string[]) => {
    setGroupIds(groupIds);
    setGroupsError(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const error = validateTitle(
      locales,
      titleMultiloc,
      formatMessage(
        locales.length === 1
          ? messages.titleRequiredSingleLocale
          : messages.titleRequired
      )
    );
    const hasTitleError = Object.keys(error).length > 0;
    const hasGroupsError = visibleTo === 'groups' && groupIds.length === 0;

    setTitleError(hasTitleError ? error : null);
    setGroupsError(hasGroupsError);
    if (hasTitleError || hasGroupsError) return;

    onSubmit({
      title_multiloc: titleMultiloc,
      listed: listed === 'listed',
      visible_to: visibleTo,
      groupIds: visibleTo === 'groups' ? groupIds : [],
      ...context,
    });
  };

  return (
    <Box
      as="form"
      id={id}
      onSubmit={handleSubmit}
      display="flex"
      flexDirection="column"
      gap="24px"
      className="intercom-projects-new-project-name"
    >
      <Box>
        <InputMultilocWithLocaleSwitcher
          id="e2e-project-title-setting-field"
          type="text"
          variant="bo"
          valueMultiloc={titleMultiloc}
          onChange={handleTitleChange}
          placeholder={formatMessage(messages.titlePlaceholder)}
          ariaLabel={formatMessage(generalMessages.projectName)}
          errorMultiloc={titleError}
          autoFocus
        />
        <Error
          fieldName="title_multiloc"
          apiErrors={apiErrors.title_multiloc}
        />
      </Box>

      <FormSection label={formatMessage(messages.context)}>
        <ProjectContextPickers
          spaceId={context.space_id}
          folderId={context.folder_id}
          projectInRoot
          onChange={setContext}
        />
      </FormSection>

      <FormSection label={formatMessage(visibilityMessages.publishWhoCanFind)}>
        {FIND_OPTIONS.map((option) => (
          <ChoiceRadio<Listed>
            key={option.value}
            name="new-project-find"
            option={option}
            currentValue={listed}
            onChange={setListed}
          />
        ))}
      </FormSection>

      <FormSection label={formatMessage(visibilityMessages.publishWhoCanOpen)}>
        {OPEN_OPTIONS.map((option) => (
          <ChoiceRadio<Visibility>
            key={option.value}
            name="new-project-open"
            option={option}
            currentValue={visibleTo}
            onChange={setVisibleTo}
          />
        ))}
        {visibleTo === 'groups' && (
          <GroupsPicker
            groupIds={groupIds}
            showError={groupsError}
            onChange={handleGroupsChange}
          />
        )}
      </FormSection>

      {failed && <Error text={formatMessage(messages.createError)} />}
    </Box>
  );
};

export default NewProjectForm;
