import React, { useState } from 'react';
// import { useTheme } from 'styled-components';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Input } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocale from 'hooks/useLocale';

// constants
import { pagesAndMenuBreadcrumb } from '../../../breadcrumbs';

// types
import { Multiloc } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { validateSlug } from 'utils/textUtils';
import { forOwn } from 'lodash-es';

const StyledInputMultiloc = styled(InputMultilocWithLocaleSwitcher)`
  width: 497px;
  margin-bottom: 40px;
`;

const StyledSlugInput = styled(Input)`
  margin-bottom: 20px;
  width: 497px;
`;

export const SlugPreview = styled.div`
  margin-bottom: 20px;
  font-size: ${fontSizes.base}px;
`;

const CreateCustomPage = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc>({});
  const [slug, setSlug] = useState<string | null>(null);
  const [titleErrors, setTitleErrors] = useState<Multiloc>({});
  const [isSlugValid, setIsSlugValid] = useState<boolean>(true);
  const appConfig = useAppConfiguration();
  const locale = useLocale();

  const handleTitleMultilocOnChange = (titleMultiloc: Multiloc) => {
    const errors = {};

    forOwn(titleMultiloc, (title, locale) => {
      if (!title || title.length === 0) {
        errors[locale] = 'broken';
      }
    });

    setTitleMultiloc(titleMultiloc);
    setTitleErrors(errors);
  };

  const handleSlugOnChange = (slug: string) => {
    setSlug(slug);
    setIsSlugValid(validateSlug(slug));
  };

  if (isNilOrError(appConfig)) return null;

  const previewUrl = `${appConfig.data.attributes.host}/${locale}/pages/${slug}`;

  return (
    <SectionFormWrapper
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: formatMessage(messages.createCustomPage),
        },
      ]}
      title={formatMessage(messages.pageTitle)}
      stickyMenuContents={
        <SubmitWrapper
          status={'enabled'}
          buttonStyle="primary"
          // to be changed
          loading={false}
          // to be changed
          onClick={() => {}}
          messages={{
            buttonSave: messages.saveButton,
            buttonSuccess: messages.buttonSuccess,
            messageSuccess: messages.messageSuccess,
            messageError: messages.error,
          }}
        />
      }
    >
      <StyledInputMultiloc
        id="project-title"
        type="text"
        valueMultiloc={titleMultiloc}
        label={<FormattedMessage {...messages.titleLabel} />}
        onChange={handleTitleMultilocOnChange}
        errorMultiloc={titleErrors}
        labelTooltipText={<FormattedMessage {...messages.titleTooltip} />}
      />
      <StyledSlugInput
        id="custom-page-slug"
        type="text"
        label={<FormattedMessage {...messages.slugLabel} />}
        onChange={handleSlugOnChange}
        value={slug}
        // to be changed
        error={!isSlugValid ? 'slug error' : null}
        labelTooltipText={<FormattedMessage {...messages.slugTooltip} />}
      />
      <SlugPreview>
        <b>{formatMessage(messages.resultingURL)}</b>: {previewUrl}
      </SlugPreview>
    </SectionFormWrapper>
  );
};

export default injectIntl(CreateCustomPage);
