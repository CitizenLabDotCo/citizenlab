import React, { createElement } from 'react';
import { Multiloc } from 'typings';
import { getLocalizedWithFallback } from 'utils/i18n';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

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
  ref?: React.RefObject<HTMLDivElement>;
};

const wrapTextInDiv = (text: string) => `<div>${text}</div>`;

const T = (props: Props) => {
  const innerRef = React.createRef();
  const locale = useLocale();
  const currentTenantLocales = useAppConfigurationLocales();

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
    } = props;

    const localizedText = getLocalizedWithFallback(
      value,
      locale,
      currentTenantLocales,
      maxLength,
      fallback
    );

    if (children) {
      return (children as children)(localizedText);
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
