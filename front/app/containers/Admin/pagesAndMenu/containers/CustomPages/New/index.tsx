import React, { useState } from 'react';
// import { useTheme } from 'styled-components';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import SlugInput, {
  TApiErrors as SlugInputApiErrors,
} from 'components/admin/SlugInput';
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

const StyledSlugInput = styled(SlugInput)`
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
  const [isSlugValid, setIsSlugValid] = useState(false);
  const [apiErrors, _setApiErrors] = useState<SlugInputApiErrors>(null);
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

  return (
    <SectionFormWrapper
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: 'Create custom page',
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
        inputFieldId="custom-page-slug"
        onSlugChange={handleSlugOnChange}
        slug={slug}
        previewUrlWithoutSlug={`${appConfig.data.attributes.host}/${locale}/pages`}
        showSlugErrorMessage={!isSlugValid}
        apiErrors={apiErrors}
      />
    </SectionFormWrapper>
  );
};

export default injectIntl(CreateCustomPage);
