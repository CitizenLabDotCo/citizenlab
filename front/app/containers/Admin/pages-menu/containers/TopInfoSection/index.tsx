import React, { useState, useEffect } from 'react';
import { useTheme } from 'styled-components';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import Error from 'components/UI/Error';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { Multiloc, CLError } from 'typings';

// constants
import { pagesAndMenuBreadcrumb, homeBreadcrumb } from '../../breadcrumbs';

// services and hooks
import useHomepageSettings from 'hooks/useHomepageSettings';
import { updateHomepageSettings } from 'services/homepageSettings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

const TopInfoSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const homepageSettings = useHomepageSettings();
  const theme: any = useTheme();

  const [topInfoSectionMultiloc, setTopInfoSectionMultiloc] = useState<
    Multiloc | null | undefined
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);

  useEffect(() => {
    if (!isNilOrError(homepageSettings)) {
      setTopInfoSectionMultiloc(
        homepageSettings.data.attributes.top_info_section_multiloc
      );
    }
  }, [homepageSettings]);

  const handleCustomSectionMultilocOnChange = (
    multilocFromEditor: Multiloc
  ) => {
    setTopInfoSectionMultiloc(multilocFromEditor);
  };

  const onSave = async () => {
    setIsLoading(true);
    try {
      if (topInfoSectionMultiloc) {
        await updateHomepageSettings({
          top_info_section_multiloc: topInfoSectionMultiloc,
        });
      }
      setIsLoading(false);
    } catch (error) {
      if (isCLErrorJSON(error)) {
        setApiErrors(error.json.errors);
      } else {
        setApiErrors(error);
      }
      setIsLoading(false);
    }
  };

  return (
    <SectionFormWrapper
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: formatMessage(homeBreadcrumb.label),
          linkTo: homeBreadcrumb.linkTo,
        },
        { label: formatMessage(messages.topInfoPageTitle) },
      ]}
      title={formatMessage(messages.topInfoPageTitle)}
      stickyMenuContents={
        <Button disabled={isLoading} onClick={onSave}>
          <FormattedMessage {...messages.topInfoSaveButton} />
        </Button>
      }
    >
      <Box maxWidth={`${theme.maxPageWidth - 100}px`} mb="24px">
        <QuillMultilocWithLocaleSwitcher
          id="custom-section"
          label={formatMessage(messages.topInfoContentEditorTitle)}
          labelTooltipText={formatMessage(messages.topInfoDescription)}
          valueMultiloc={topInfoSectionMultiloc}
          onChange={handleCustomSectionMultilocOnChange}
          withCTAButton
        />
      </Box>
      <Error apiErrors={apiErrors} />
    </SectionFormWrapper>
  );
};

export default injectIntl(TopInfoSection);
