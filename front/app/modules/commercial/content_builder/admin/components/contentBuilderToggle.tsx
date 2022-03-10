import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { Locale, Multiloc } from 'typings';
import Link from 'utils/cl-router/Link';
import { Toggle } from '@citizenlab/cl2-component-library';

type ContentBuilderToggleProps = {
  valueMultiloc: Multiloc | undefined | null;
  onChange: (description_multiloc: Multiloc, _locale: Locale) => void;
  label: string;
  labelTooltipText: string;
} & WithRouterProps;

const ContentBuilderToggle = ({
  location: { pathname },
  valueMultiloc,
  onChange,
  label,
  labelTooltipText,
}: ContentBuilderToggleProps) => {
  const [contentBuilderLinkVisible, setContentBuilderLinkVisible] =
    useState(false);
  const route = `${pathname}/content-builder`;
  const toggleContentBuilderLinkVisible = () => {
    setContentBuilderLinkVisible(!contentBuilderLinkVisible);
  };

  return (
    <>
      <Toggle
        checked={contentBuilderLinkVisible}
        label="Label"
        onChange={toggleContentBuilderLinkVisible}
      ></Toggle>
      {contentBuilderLinkVisible && <Link to={route}>Advanced Editor</Link>}
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

export default withRouter(ContentBuilderToggle);
