import React, { useEffect, useState } from 'react';

import {
  Toggle,
  IconTooltip,
  Box,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import { RouteType } from 'routes';
import styled from 'styled-components';
import { SupportedLocale, Multiloc } from 'typings';

import useAddContentBuilderLayout from 'api/content_builder/useAddContentBuilderLayout';
import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/DescriptionBuilder/messages';

import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import Warning from 'components/UI/Warning';

import { injectIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// Messages

type DescriptionBuilderToggleProps = {
  valueMultiloc: Multiloc | undefined | null;
  onChange: (description_multiloc: Multiloc, _locale: SupportedLocale) => void;
  modelType?: 'project' | 'folder';
  label: string;
} & WithRouterProps &
  WrappedComponentProps;

const StyledToggle = styled(Toggle)`
  margin-bottom: 30px;
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-bottom: 30px;
`;

const StyledLink = styled(Link)`
  margin-top: -10px;
  font-size: ${fontSizes.base}px;
`;

const DescriptionBuilderToggle = ({
  params,
  intl: { formatMessage },
  valueMultiloc,
  onChange,
  modelType,
  label,
}: DescriptionBuilderToggleProps) => {
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });

  const modelId =
    modelType === 'folder' ? params.projectFolderId : params.projectId;
  const { data: DescriptionBuilderLayout } = useContentBuilderLayout(
    modelId,
    modelType,
    featureEnabled
  );

  const [descriptionBuilderLinkVisible, setDescriptionBuilderLinkVisible] =
    useState<boolean | null>(null);
  const { mutateAsync: addDescriptionBuilderLayout } =
    useAddContentBuilderLayout();

  useEffect(() => {
    if (DescriptionBuilderLayout) {
      const DescriptionBuilderEnabled =
        DescriptionBuilderLayout.data.attributes.enabled;
      setDescriptionBuilderLinkVisible(DescriptionBuilderEnabled);
    }
  }, [DescriptionBuilderLayout]);

  if (!featureEnabled) {
    return null;
  }

  const toggledescriptionBuilderLinkVisible = () => {
    toggleLayoutEnabledStatus(!descriptionBuilderLinkVisible);
    setDescriptionBuilderLinkVisible(!descriptionBuilderLinkVisible);
  };

  const toggleLayoutEnabledStatus = async (enabled: boolean) => {
    await addDescriptionBuilderLayout({
      modelId,
      modelType,
      enabled,
    });
  };

  const route =
    `/admin/description-builder/${modelType}s/${modelId}/description` as RouteType;

  return (
    <Box data-testid="descriptionBuilderToggle">
      <Box
        className="intercom-product-tour-project-description-builder-toggle"
        display="flex"
        gap="12px"
      >
        <StyledToggle
          id="e2e-toggle-enable-project-description-builder"
          checked={!!descriptionBuilderLinkVisible}
          label={formatMessage(messages.toggleLabel)}
          onChange={toggledescriptionBuilderLinkVisible}
        />
        <StyledIconTooltip content={formatMessage(messages.toggleTooltip)} />
      </Box>

      {descriptionBuilderLinkVisible && (
        <>
          <StyledLink id="e2e-project-description-builder-link" to={route}>
            {formatMessage(messages.linkText)}
          </StyledLink>
          <Box mt="10px">
            <Warning>
              {formatMessage(
                modelType === 'folder'
                  ? messages.folderLayoutBuilderWarning
                  : messages.projectLayoutBuilderWarning
              )}
            </Warning>
          </Box>
        </>
      )}
      {!descriptionBuilderLinkVisible && (
        <QuillMultilocWithLocaleSwitcher
          id="e2e-project-description-multiloc-module-active"
          valueMultiloc={valueMultiloc}
          onChange={onChange}
          label={label}
          withCTAButton
        />
      )}
    </Box>
  );
};

export default injectIntl(withRouter(DescriptionBuilderToggle));
