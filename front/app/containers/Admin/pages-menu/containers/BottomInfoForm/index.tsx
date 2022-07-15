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

const BottomInfoForm = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const homepageSettings = useHomepageSettings();
  const theme: any = useTheme();

  const [bottomInfoSectionMultilocState, setBottomInfoSectionMultilocState] =
    useState<Multiloc | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);

  useEffect(() => {
    if (!isNilOrError(homepageSettings)) {
      setBottomInfoSectionMultilocState(
        homepageSettings.data.attributes.bottom_info_section_multiloc
      );
    }
  }, [homepageSettings]);

  const handleCustomSectionMultilocOnChange = (
    bottomInfoMultiloc: Multiloc
  ) => {
    setBottomInfoSectionMultilocState(bottomInfoMultiloc);
  };

  const onSave = async () => {
    setIsLoading(true);
    try {
      if (bottomInfoSectionMultilocState) {
        await updateHomepageSettings({
          bottom_info_section_multiloc: bottomInfoSectionMultilocState,
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
        { label: formatMessage(messages.bottomInfoPageTitle) },
      ]}
      title={formatMessage(messages.bottomInfoPageTitle)}
      stickyMenuContents={
        <Button disabled={isLoading} onClick={onSave}>
          <FormattedMessage {...messages.bottomInfoSaveButton} />
        </Button>
      }
    >
      <Box maxWidth={`${theme.maxPageWidth - 100}px`} mb="24px">
        <QuillMultilocWithLocaleSwitcher
          id="custom-section"
          label={formatMessage(messages.bottomInfoContentEditorTitle)}
          labelTooltipText={formatMessage(messages.bottomInfoDescription)}
          valueMultiloc={bottomInfoSectionMultilocState}
          onChange={handleCustomSectionMultilocOnChange}
          withCTAButton
        />
      </Box>
      <Error apiErrors={apiErrors} />
    </SectionFormWrapper>
  );
};

export default injectIntl(BottomInfoForm);
