import React, { useEffect, useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// Typings
import { Locale, Multiloc } from 'typings';

// Style
import styled from 'styled-components';

// Hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

// Utils
import Link from 'utils/cl-router/Link';
import { fontSizes } from 'utils/styleUtils';

// Components
import { Toggle, IconTooltip, Box } from '@citizenlab/cl2-component-library';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import {
  addContentBuilderLayout,
  PROJECT_DESCRIPTION_CODE,
} from 'modules/commercial/content_builder/services/contentBuilder';

// Messages
import messages from '../../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// Helpers
import { isNilOrError } from 'utils/helperUtils';

type ContentBuilderToggleProps = {
  valueMultiloc: Multiloc | undefined | null;
  onChange: (description_multiloc: Multiloc, _locale: Locale) => void;
  label: string;
  labelTooltipText: string;
  onMount: () => void;
} & WithRouterProps &
  InjectedIntlProps;

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

  useEffect(() => {
    if (!featureEnabled) return;
    onMount();
  }, [onMount, featureEnabled]);

  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [contentBuilderLinkVisible, setContentBuilderLinkVisible] =
    useState(false);
  const route = `/admin/content-builder/projects/${params.projectId}/description`;
  const toggleContentBuilderLinkVisible = () => {
    setContentBuilderLinkVisible(!contentBuilderLinkVisible);
  };

  if (!featureEnabled) {
    return null;
  }

  const addNewLayout = async (projectId: string) => {
    if (!isNilOrError(locale)) {
      try {
        setLoading(true);
        const json = '{}';
        await addContentBuilderLayout(
          { projectId, code: PROJECT_DESCRIPTION_CODE },
          { craftjs_jsonmultiloc: { [locale]: JSON.parse(json) } }
        );
      } catch {
        // Do nothing
      }
      setLoading(false);
    }
  };

  return (
    <Box data-testid="contentBuilderToggle">
      <Box display="flex" gap="12px">
        <StyledToggle
          checked={contentBuilderLinkVisible}
          label={formatMessage(messages.toggleLabel)}
          onChange={toggleContentBuilderLinkVisible}
        />
        <StyledIconTooltip content={formatMessage(messages.toggleTooltip)} />
      </Box>
      {contentBuilderLinkVisible && (
        <StyledLink to={route}>{formatMessage(messages.linkText)}</StyledLink>
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
