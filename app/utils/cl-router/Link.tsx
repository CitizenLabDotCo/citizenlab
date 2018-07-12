// Libraries
import React, { PureComponent } from 'react';
// tslint:disable-next-line:no-vanilla-routing
import { Link as RouterLink, LinkProps } from 'react-router';
import { LocationDescriptor } from 'history';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import updateLocationDescriptor from './updateLocationDescriptor';

interface InputProps extends LinkProps {
  to: LocationDescriptor;
}

interface DataProps {
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

export class Link extends PureComponent<Props, State> {
  render() {
    const { to, locale, ...otherProps } = this.props;
    const descriptor = updateLocationDescriptor(to, locale);
    return (<RouterLink to={descriptor} {...otherProps} />);
  }
}

export default (inputProps: InputProps) => (
  <GetLocale>
    {locale => <Link {...inputProps} locale={locale} />}
  </GetLocale>
);
