import React, { useEffect, useState } from 'react';

import {
  Toggle,
  IconTooltip,
  Box,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import { SupportedLocale, Multiloc } from 'typings';

import { ContentBuildableType } from 'api/content_builder/types';
import useAddContentBuilderLayout from 'api/content_builder/useAddContentBuilderLayout';
import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/DescriptionBuilder/messages';

import NewLabel from 'components/UI/NewLabel';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { injectIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import { useParams } from 'utils/router';

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

const StyledLink = typedStyled(Link)`
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
  const { data: descriptionBuilderLayout } = useContentBuilderLayout(
    contentBuildableType,
    contentBuildableId,
    featureEnabled
  );

  const [descriptionBuilderEnabled, setDescriptionBuilderEnabled] = useState<
    boolean | null
  >(null);
  const { mutateAsync: addDescriptionBuilderLayout } =
    useAddContentBuilderLayout();

  useEffect(() => {
    if (descriptionBuilderLayout) {
      setDescriptionBuilderEnabled(
        descriptionBuilderLayout.data.attributes.enabled
      );
    }
  }, [descriptionBuilderLayout]);

  if (!featureEnabled) {
    return null;
  }

  const linkProps =
    contentBuildableType === 'project'
      ? ({
          to: '/admin/description-builder/projects/$projectId/description',
          params: { projectId: contentBuildableId },
        } as const)
      : ({
          to: '/admin/description-builder/folders/$folderId/description',
          params: { folderId: contentBuildableId },
        } as const);

  // Once a description is on the Content Builder it is edited there exclusively:
  // the toggle locks ON and can no longer be switched back to the WYSIWYG
  // editor. Descriptions not yet on the Content Builder keep the toggle and the
  // WYSIWYG editor until they are migrated.
  const enableDescriptionBuilder = async () => {
    setDescriptionBuilderEnabled(true);
    await addDescriptionBuilderLayout({
      contentBuildableId,
      contentBuildableType,
      enabled: true,
    });
  };

  return (
    <Box data-testid="descriptionBuilderToggle">
      <Box
        className="intercom-product-tour-project-description-builder-toggle"
        display="flex"
        gap="12px"
      >
        <StyledToggle
          id="e2e-toggle-enable-project-description-builder"
          checked={!!descriptionBuilderEnabled}
          disabled={!!descriptionBuilderEnabled}
          label={formatMessage(messages.toggleLabel)}
          onChange={enableDescriptionBuilder}
        />
        <StyledIconTooltip content={formatMessage(messages.toggleTooltip)} />
        <NewLabel ml="4px" expiryDate={new Date('2026-01-01')} />
      </Box>

      {descriptionBuilderEnabled ? (
        <StyledLink id="e2e-project-description-builder-link" {...linkProps}>
          {formatMessage(messages.linkText)}
        </StyledLink>
      ) : (
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
