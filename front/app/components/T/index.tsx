import React, { createElement } from 'react';

import { trim } from 'lodash-es';
import { Multiloc } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { getLocalizedWithFallback } from 'utils/i18n';

type children = (localizedText: string) => JSX.Element | null;

type Props = {
  value: Multiloc | null | undefined;
  as?: string;
  className?: string;
  children?: children;
  maxLength?: number;
  supportHtml?: boolean;
  graphql?: boolean;
  onClick?: () => void;
  wrapInDiv?: boolean;
  /** fallback string if undefined multiloc, missing locale or empty string */
  fallback?: string;
  innerRef?: React.RefObject<HTMLDivElement>;
};

const wrapTextInDiv = (text: string) => `<div>${text}</div>`;

const T = (props: Props) => {
  const locale = useLocale();
  const currentTenantLocales = useAppConfigurationLocales();

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (locale && currentTenantLocales) {
    const {
      value,
      as,
      children,
      maxLength,
      className,
      supportHtml,
      onClick,
      wrapInDiv,
      fallback,
      innerRef,
    } = props;

    const localizedText = getLocalizedWithFallback(
      value,
      locale,
      currentTenantLocales,
      maxLength,
      fallback
    );

    if (trim(localizedText) === '') {
      return null;
    }

    if (children) {
      return children(localizedText);
    }

    if (supportHtml) {
      return createElement(as || 'span', {
        className,
        onClick,
        ref: innerRef,
        dangerouslySetInnerHTML: {
          __html: wrapInDiv ? wrapTextInDiv(localizedText) : localizedText,
        },
      });
    } else {
      // eslint-disable-next-line react/no-children-prop
      return createElement(as || 'span', {
        className,
        onClick,
        ref: innerRef,
        children: wrapInDiv ? wrapTextInDiv(localizedText) : localizedText,
      });
    }
  }

  return null;
};

export default T;
