import React, { useState } from 'react';
// import { useTheme } from 'styled-components';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Box, Input } from '@citizenlab/cl2-component-library';

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
  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
  const [slug, setSlug] = useState<string>('');
  const appConfig = useAppConfiguration();
  const locale = useLocale();

  const handleTitleMultilocOnChange = (titleMultiloc: Multiloc) => {
    setTitleMultiloc(titleMultiloc);
  };

  const handleSlugOnChange = (slug: string) => {
    setSlug(slug);
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
          label: 'Create custom page',
        },
      ]}
      title={formatMessage(messages.pageTitle)}
      stickyMenuContents={
        <SubmitWrapper
          status={'enabled'}
          buttonStyle="primary"
          loading={false}
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
        // errorMultiloc={titleError}
        labelTooltipText={<FormattedMessage {...messages.titleTooltip} />}
      />
      <StyledSlugInput
        id="custom-page-slug"
        type="text"
        label={<FormattedMessage {...messages.slugLabel} />}
        onChange={handleSlugOnChange}
        value={slug}
        labelTooltipText={<FormattedMessage {...messages.titleLabel} />}
      />
      <SlugPreview>
        <b>{formatMessage(messages.resultingURL)}</b>: {previewUrl}
      </SlugPreview>
      <Box mb="40px" />
    </SectionFormWrapper>
  );
};

export default injectIntl(CreateCustomPage);
