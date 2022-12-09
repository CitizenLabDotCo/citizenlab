import React, { useEffect, useState } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// Typings
import { Locale, Multiloc } from 'typings';

// Style
import styled from 'styled-components';

// Hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useContentBuilderLayout from '../../../hooks/useContentBuilder';

// Utils
import Link from 'utils/cl-router/Link';
import { fontSizes } from 'utils/styleUtils';

// Components
import { Toggle, IconTooltip, Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import {
  addContentBuilderLayout,
  PROJECT_DESCRIPTION_CODE,
} from 'modules/commercial/content_builder/services/contentBuilder';

// Messages
import messages from '../../messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

// Helpers
import { isNil, isNilOrError } from 'utils/helperUtils';

type ContentBuilderToggleProps = {
  valueMultiloc: Multiloc | undefined | null;
  onChange: (description_multiloc: Multiloc, _locale: Locale) => void;
  label: string;
  labelTooltipText: string;
  onMount: () => void;
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

const ContentBuilderToggle = ({
  params,
  intl: { formatMessage },
  valueMultiloc,
  onChange,
  label,
  labelTooltipText,
  onMount,
}: ContentBuilderToggleProps) => {
  const featureEnabled = useFeatureFlag({ name: 'content_builder' });
  const contentBuilderLayout = useContentBuilderLayout({
    projectId: `${params.projectId}`,
    code: PROJECT_DESCRIPTION_CODE,
  });
  const route = `/admin/content-builder/projects/${params.projectId}/description`;
  const [contentBuilderLinkVisible, setContentBuilderLinkVisible] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    if (!featureEnabled) return;
    onMount();
  }, [onMount, featureEnabled]);

  useEffect(() => {
    if (!isNilOrError(contentBuilderLayout)) {
      const contentBuilderEnabled =
        contentBuilderLayout.data.attributes.enabled;
      setContentBuilderLinkVisible(contentBuilderEnabled);
    }
  }, [contentBuilderLayout]);

  if (!featureEnabled) {
    return null;
  }

  const toggleContentBuilderLinkVisible = () => {
    toggleLayoutEnabledStatus(!contentBuilderLinkVisible);
    setContentBuilderLinkVisible(!contentBuilderLinkVisible);
  };

  const toggleLayoutEnabledStatus = async (enabled: boolean) => {
    try {
      await addContentBuilderLayout(
        { projectId: params.projectId, code: PROJECT_DESCRIPTION_CODE },
        { enabled }
      );
    } catch {
      // Do nothing
    }
  };

  return (
    <Box data-testid="contentBuilderToggle">
      {!isNil(contentBuilderLayout) && (
        <Box display="flex" gap="12px">
          <StyledToggle
            id="e2e-toggle-enable-content-builder"
            checked={!!contentBuilderLinkVisible}
            label={formatMessage(messages.toggleLabel)}
            onChange={toggleContentBuilderLinkVisible}
          />
          <StyledIconTooltip content={formatMessage(messages.toggleTooltip)} />
        </Box>
      )}
      {contentBuilderLinkVisible && (
        <>
          <StyledLink id="e2e-content-builder-link" to={route}>
            {formatMessage(messages.linkText)}
          </StyledLink>
          <Box mt="10px">
            <Warning>{formatMessage(messages.layoutBuilderWarning)}</Warning>
          </Box>
        </>
      )}
      {!contentBuilderLinkVisible && (
        <QuillMultilocWithLocaleSwitcher
          id="project-description"
          valueMultiloc={valueMultiloc}
          onChange={onChange}
          label={label}
          labelTooltipText={labelTooltipText}
          withCTAButton
        />
      )}
    </Box>
  );
};

export default injectIntl(withRouter(ContentBuilderToggle));
