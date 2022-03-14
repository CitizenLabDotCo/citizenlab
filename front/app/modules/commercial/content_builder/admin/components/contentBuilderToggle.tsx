import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import React, { useEffect, useState } from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { withRouter, WithRouterProps } from 'react-router';
import { Locale, Multiloc } from 'typings';
import Link from 'utils/cl-router/Link';
import { Toggle, IconTooltip, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

type ContentBuilderToggleProps = {
  valueMultiloc: Multiloc | undefined | null;
  onChange: (description_multiloc: Multiloc, _locale: Locale) => void;
  label: string;
  labelTooltipText: string;
  toggleLabel: string;
  toggleTooltipText: string;
  linkText: string;
  onMount: () => void;
} & WithRouterProps;

const ContentBuilderToggle = ({
  location: { pathname },
  valueMultiloc,
  onChange,
  label,
  labelTooltipText,
  toggleLabel,
  toggleTooltipText,
  linkText,
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

  return (
    <>
      <StyledBox>
        <StyledToggle
          checked={contentBuilderLinkVisible}
          label={toggleLabel}
          onChange={toggleContentBuilderLinkVisible}
        />
        <StyledIconTooltip content={toggleTooltipText} />
      </StyledBox>
      {contentBuilderLinkVisible && (
        <StyledLink to={route} data-testid="builderLink">
          {linkText}
        </StyledLink>
      )}
      {!contentBuilderLinkVisible && (
        <>
          <QuillMultilocWithLocaleSwitcher
            data-testid={'quillEditor'}
            id="project-description"
            valueMultiloc={valueMultiloc}
            onChange={onChange}
            label={label}
            labelTooltipText={labelTooltipText}
            withCTAButton
          />
        </>
      )}
    </>
  );
};

export default withRouter(ContentBuilderToggle);
