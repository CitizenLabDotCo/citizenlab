import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// components
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
// import ErrorMessage from 'components/UI/Error';
import SectionFormWrapper from './SectionFormWrapper';
import { Box, Button } from '@citizenlab/cl2-component-library';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// importing messages from the old location for now,
// should be moved before feature is merged
import messages from '../settings/customize/messages';

// typings
import { Multiloc } from 'typings';

// resources
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';
// import { isCLErrorJSON } from 'utils/errorUtils';
import { updateAppConfiguration } from 'services/appConfiguration';

export const MultilocFormWrapper = styled(Box)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
`;

const HomepageCustomizableSection = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const appConfig = useAppConfiguration();
  const [homePageInfoMultilocState, setHomePageInfoMultilocState] = useState<
    Multiloc | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  // const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();

  useEffect(() => {
    if (!isNilOrError(appConfig)) {
      setHomePageInfoMultilocState(
        appConfig.data.attributes.homepage_info_multiloc
      );
    }
  }, [appConfig]);

  const handleCustomSectionMultilocOnChange = (
    homepageInfoPageMultiloc: Multiloc
  ) => {
    setHomePageInfoMultilocState(homepageInfoPageMultiloc);
  };

  const onSave = async () => {
    setIsLoading(true);
    try {
      await updateAppConfiguration({
        homepage_info_multiloc: homePageInfoMultilocState,
      });
      setIsLoading(false);
    } catch (error) {
      // if (isCLErrorJSON(error)) {
      //   setIsLoading(false);
      //   setApiErrors(error.json.errors);
      // }
    }
  };

  return (
    <SectionFormWrapper
      breadcrumbs={[
        { label: 'Pages and Menu', linkTo: 'admin' },
        { label: 'Home', linkTo: 'admin' },
        { label: 'Bottom Info Section', linkTo: 'admin' },
      ]}
      title="Bottom Info Section"
      stickyMenuContents={
        <Button disabled={isLoading} onClick={() => onSave()}>
          Save Bottom Info Form
        </Button>
      }
    >
      <>
        <MultilocFormWrapper mb="24px">
          <QuillMultilocWithLocaleSwitcher
            id="custom-section"
            label={formatMessage(messages.customSectionLabel)}
            labelTooltipText={formatMessage(
              messages.homePageCustomizableSectionTooltip
            )}
            valueMultiloc={homePageInfoMultilocState}
            onChange={handleCustomSectionMultilocOnChange}
            withCTAButton
          />
        </MultilocFormWrapper>
        {/* <ErrorMessage apiErrors={apiErrors} /> */}
      </>
    </SectionFormWrapper>
  );
};

export default injectIntl(HomepageCustomizableSection);
