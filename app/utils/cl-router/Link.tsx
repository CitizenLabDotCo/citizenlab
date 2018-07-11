// Libraries
import React from 'react';
// tslint:disable-next-line:no-vanilla-routing
import { Link as RouterLink, LinkProps } from 'react-router';
import { LocationDescriptor } from 'history';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import updateLocationDescriptor from './updateLocationDescriptor';

// Typings
export interface Props extends LinkProps {
  to: LocationDescriptor;
}
export interface State {}

export class Link extends React.PureComponent<Props & {locale: GetLocaleChildProps}, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { to, locale, ...otherProps } = this.props;
    const descriptor = updateLocationDescriptor(to, locale);
    return (<RouterLink to={descriptor} {...otherProps} />);
  }
}

export default (props: Props) => (
  <GetLocale>{(locale) => (<Link {...props} locale={locale} />)}</GetLocale>
);
