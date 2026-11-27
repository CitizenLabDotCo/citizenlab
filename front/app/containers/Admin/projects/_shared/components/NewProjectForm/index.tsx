import React, { FormEvent, useState } from 'react';

import { CLErrors, Multiloc } from 'typings';

import Banner from 'design-system/Banner';
import RadioGroup from 'design-system/RadioGroup';

import { Visibility } from 'api/projects/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';


import MultilocTextField from 'components/admin/MultilocFields/MultilocTextField';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import useLanguageGroup from 'components/admin/MultilocFields/useLanguageGroup';

import { useIntl } from 'utils/cl-intl';
import validateTitle from 'utils/validateTitle';

import { FIND_OPTIONS, Listed, OPEN_OPTIONS } from '../../visibilityOptions';
import visibilityMessages from '../../visibilityOptions/messages';
import ChoiceRadio from '../ChoiceRadio';
import ProjectContextPickers from '../ProjectContextPickers';
import { SpaceAndFolderId } from '../ProjectSetupForm/ProjectContextSection/types';

import FormSection from './FormSection';
import GroupsPicker from './GroupsPicker';
import messages from './messages';
import styles from './NewProjectForm.module.css';
import 'design-system/tokens.css';

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
  const apiErrorText = useApiErrorText();

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
  const titleGroup = useLanguageGroup(
    [
      {
        value: titleMultiloc,
        name: formatMessage(messages.projectTitleField),
        required: true,
      },
    ],
    { ownCheck: true }
  );

  if (!locales) return null;

  const handleTitleChange = (titleMultiloc: Multiloc) => {
    setTitleMultiloc(titleMultiloc);
    setTitleError(null);
  };

  const handleGroupsChange = (groupIds: string[]) => {
    setGroupIds(groupIds);
    setGroupsError(false);
  };

  const handleListedChange = (value: string) => {
    const option = FIND_OPTIONS.find((option) => option.value === value);
    if (option) setListed(option.value);
  };

  const handleVisibleToChange = (value: string) => {
    const option = OPEN_OPTIONS.find((option) => option.value === value);
    if (option) setVisibleTo(option.value);
  };

  const titleApiErrorText = apiErrorText(
    apiErrors.title_multiloc,
    'title_multiloc'
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // In the new back office, the line under the title names the languages left.
    const languagesDone = titleGroup.check();
    const error = languagesDone
      ? validateTitle(
          locales,
          titleMultiloc,
          formatMessage(
            locales.length === 1
              ? messages.titleRequiredSingleLocale
              : messages.titleRequired
          )
        )
      : {};
    const hasTitleError = Object.keys(error).length > 0;
    const hasGroupsError = visibleTo === 'groups' && groupIds.length === 0;

    setTitleError(hasTitleError ? error : null);
    setGroupsError(hasGroupsError);
    if (!languagesDone || hasTitleError || hasGroupsError) return;

    onSubmit({
      title_multiloc: titleMultiloc,
      listed: listed === 'listed',
      visible_to: visibleTo,
      groupIds: visibleTo === 'groups' ? groupIds : [],
      ...context,
    });
  };

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={`intercom-projects-new-project-name ${styles.form}`}
    >
      <div className={styles.titleField}>
        <MultilocTextField
          id="e2e-project-title-setting-field"
          group={titleGroup}
          label={formatMessage(messages.projectTitleLabel)}
          valueMultiloc={titleMultiloc}
          onChange={handleTitleChange}
          placeholder={titleGroup.placeholder(
            messages.titlePlaceholderInLanguage,
            messages.titlePlaceholder
          )}
          errorMessage={
            titleGroup.selectedLocale && titleError?.[titleGroup.selectedLocale]
          }
        />
        {titleApiErrorText && <Banner tone="error">{titleApiErrorText}</Banner>}
      </div>

      <FormSection label={formatMessage(messages.context)}>
        <ProjectContextPickers
          spaceId={context.space_id}
          folderId={context.folder_id}
          projectInRoot
          onChange={setContext}
        />
      </FormSection>

      <RadioGroup
        label={formatMessage(visibilityMessages.publishWhoCanFind)}
        name="new-project-find"
        value={listed}
        onChange={handleListedChange}
      >
        {FIND_OPTIONS.map((option) => (
          <ChoiceRadio
            key={option.value}
            value={option.value}
            title={formatMessage(option.label)}
            description={formatMessage(option.description)}
          />
        ))}
      </RadioGroup>

      <div className={styles.section}>
        <RadioGroup
          label={formatMessage(visibilityMessages.publishWhoCanSee)}
          name="new-project-open"
          value={visibleTo}
          onChange={handleVisibleToChange}
        >
          {OPEN_OPTIONS.map((option) => (
            <ChoiceRadio
              key={option.value}
              value={option.value}
              title={formatMessage(option.label)}
              description={formatMessage(option.description)}
            />
          ))}
        </RadioGroup>
        {visibleTo === 'groups' && (
          <GroupsPicker
            groupIds={groupIds}
            showError={groupsError}
            onChange={handleGroupsChange}
          />
        )}
      </div>

      {failed && (
        <Banner tone="error">{formatMessage(messages.createError)}</Banner>
      )}
    </form>
  );
};

export default NewProjectForm;
