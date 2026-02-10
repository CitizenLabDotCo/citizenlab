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

import { ContentBuildableType } from 'api/content_builder/types';
import useAddContentBuilderLayout from 'api/content_builder/useAddContentBuilderLayout';
import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/DescriptionBuilder/messages';

import NewLabel from 'components/UI/NewLabel';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import Warning from 'components/UI/Warning';

import { injectIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { useParams } from 'utils/router';

// Messages

type DescriptionBuilderToggleProps = {
  valueMultiloc: Multiloc | undefined | null;
  onChange: (description_multiloc: Multiloc, _locale: SupportedLocale) => void;
  contentBuildableType: ContentBuildableType;
  label: string;
} & WrappedComponentProps;

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
  intl: { formatMessage },
  valueMultiloc,
  onChange,
  contentBuildableType,
  label,
}: DescriptionBuilderToggleProps) => {
  const params = useParams({ strict: false }) as Record<string, string>;
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });

  const contentBuildableId =
    contentBuildableType === 'folder'
      ? params.projectFolderId
      : params.projectId;
  const { data: DescriptionBuilderLayout } = useContentBuilderLayout(
    contentBuildableType,
    contentBuildableId,
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
      contentBuildableId,
      contentBuildableType,
      enabled,
    });
  };

  const route =
    `/admin/description-builder/${contentBuildableType}s/${contentBuildableId}/description` as RouteType;

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
        <NewLabel ml="4px" expiryDate={new Date('2026-01-01')} />
      </Box>

      {descriptionBuilderLinkVisible && (
        <>
          <StyledLink id="e2e-project-description-builder-link" to={route}>
            {formatMessage(messages.linkText)}
          </StyledLink>
          <Box mt="10px">
            <Warning>
              {formatMessage(
                contentBuildableType === 'folder'
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

export default injectIntl(DescriptionBuilderToggle);
