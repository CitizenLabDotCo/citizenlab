import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import React, { useState } from 'react';
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
}: ContentBuilderToggleProps) => {
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

  return (
    <>
      <StyledBox>
        <Toggle
          checked={contentBuilderLinkVisible}
          label={toggleLabel}
          onChange={toggleContentBuilderLinkVisible}
        ></Toggle>
        <IconTooltip content={toggleTooltipText} />
      </StyledBox>
      {contentBuilderLinkVisible && (
        <Link to={route} data-testid="builderLink">
          {linkText}
        </Link>
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
