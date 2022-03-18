import React, { useEffect, useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// Typings
import { Locale, Multiloc } from 'typings';

// Style
import styled from 'styled-components';

// Hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// Utils
import Link from 'utils/cl-router/Link';

// Components
import { Toggle, IconTooltip, Box } from '@citizenlab/cl2-component-library';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

// Messages
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

type ContentBuilderToggleProps = {
  valueMultiloc: Multiloc | undefined | null;
  onChange: (description_multiloc: Multiloc, _locale: Locale) => void;
  label: string;
  labelTooltipText: string;
  onMount: () => void;
} & WithRouterProps &
  InjectedIntlProps;

const StyledBox = styled(Box)`
  display: flex;
  gap: 10px;
`;

const StyledToggle = styled(Toggle)`
  margin-bottom: 30px;
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-bottom: 30px;
`;

const StyledLink = styled(Link)`
  margin-top: -10px;
`;

const ContentBuilderToggle = ({
  location: { pathname },
  intl: { formatMessage },
  valueMultiloc,
  onChange,
  label,
  labelTooltipText,
  onMount,
}: ContentBuilderToggleProps) => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });

  useEffect(() => {
    if (!featureEnabled) return;
    onMount();
  }, [onMount, featureEnabled]);

  const [contentBuilderLinkVisible, setContentBuilderLinkVisible] =
    useState(false);
  const route = `${pathname}/content-builder`;
  const toggleContentBuilderLinkVisible = () => {
    setContentBuilderLinkVisible(!contentBuilderLinkVisible);
  };

  return (
    <>
      <StyledBox>
        <StyledToggle
          checked={contentBuilderLinkVisible}
          label={formatMessage(messages.toggleLabel)}
          onChange={toggleContentBuilderLinkVisible}
        />
        <StyledIconTooltip content={formatMessage(messages.toggleTooltip)} />
      </StyledBox>
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
    </>
  );
};

export default injectIntl(withRouter(ContentBuilderToggle));
