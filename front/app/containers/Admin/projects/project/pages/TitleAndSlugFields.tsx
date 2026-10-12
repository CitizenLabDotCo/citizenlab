import React from 'react';

import { useWatch } from 'react-hook-form';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { ICustomPageData } from 'api/custom_pages/types';
import { IProjectData } from 'api/projects/types';

import useLocale from 'hooks/useLocale';

import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import SlugInput from 'components/HookForm/SlugInput';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  project: IProjectData;
  page?: ICustomPageData;
}

// The slug only exists once the page does, so it is edited but never entered at creation.
const TitleAndSlugFields = ({ project, page }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { data: appConfiguration } = useAppConfiguration();
  const slug = useWatch<{ slug?: string }>({ name: 'slug' });

  const previewUrl =
    slug && appConfiguration
      ? `${appConfiguration.data.attributes.host}/${locale}/projects/${project.attributes.slug}/pages/${slug}`
      : null;

  return (
    <>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          name="title_multiloc"
          label={formatMessage(messages.titleLabel)}
        />
      </SectionField>
      {page && (
        <SectionField>
          <SlugInput
            slug={slug}
            showWarningMessage={slug !== page.attributes.slug}
            previewUrl={previewUrl}
          />
        </SectionField>
      )}
    </>
  );
};

export default TitleAndSlugFields;
