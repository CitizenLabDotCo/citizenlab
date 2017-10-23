import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// style
import styled from 'styled-components';

// localisation
import { FormattedMessage } from 'react-intl';
import T from 'components/T';

// typings
import { Message, Multiloc } from 'typings';

// components
import { Link } from 'react-router';

const ResourceHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 35px;
  line-height: 35px;
  font-weight: 500;
  margin: 0;
  padding: 0;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
`;

const PublicResourceLink = styled(Link)``;

const TabbedNav = styled.nav`
  background: #fcfcfc;
  border-radius: 5px 5px 0 0;
  padding-left: 44px;
  display: flex;
  border-bottom: 1px solid #eaeaea;
`;

const Tab = styled.li`
  list-style: none;
  cursor: pointer;
  display: flex;
  margin-bottom: -1px;

  &:not(:last-child) {
    margin-right: 50px;
  }

  a {
    color: #999;
    font-size: 18px;
    font-weight: 400;
    line-height: 22px;
    text-transform: capitalize;
    padding: 0;
    padding-top: 20px;
    padding-bottom: 18px;
    border-bottom: 2px solid transparent;
    transition: all 100ms ease-out;
  }

  &:hover a {
    color: #333;
  }

  &.active a {
    color: #333;
    border-color: #d60065;
  }

  &:not(.active):hover a {
    border-color: transparent;
  }
`;

const ChildWrapper = styled.div`
  background: #fff;
  margin-bottom: 2rem;
  padding: 3rem;
`;

type Props = {
  location?: {
    pathname: string,
  },
  resource: {
    title: string | Multiloc,
    publicLink?: string,
  },
  messages: {
    viewPublicResource: Message,
  },
  tabs?: {
    label: string | Message,
    url: string,
    active?: boolean
  }[],
};

type State = {

};

function isMessage(entry: any): entry is Message {
  return entry.id && entry.defaultMessage;
}

function isMultiloc(entry: any): entry is Multiloc {
  return entry.en || entry.nl || entry.fr;
}

function showLabel(label: string | Multiloc | Message) {
  if (_.isString(label)) {
    return label;
  } else if (isMessage(label)) {
    return <FormattedMessage {...label} />;
  } else if (isMultiloc(label)) {
    return <T value={label} />;
  } else {
    return '';
  }
}

export default class TabbedResource extends React.PureComponent<Props, State> {
  render() {
    const { resource, messages, tabs, location } = this.props;

    return (
      <div>
        <ResourceHeader>
          <Title>{showLabel(resource.title)}</Title>

          {resource.publicLink &&
            <PublicResourceLink to={resource.publicLink}>
              <FormattedMessage {...messages.viewPublicResource} />
            </PublicResourceLink>
          }
        </ResourceHeader>
        {tabs &&
          <TabbedNav>
            {tabs.map((tab) => (
              <Tab key={tab.url} className={location && location.pathname && location.pathname === tab.url ? 'active' : ''}>
                <Link to={tab.url}>{showLabel(tab.label)}</Link>
              </Tab>
            ))}
          </TabbedNav>
        }
        <ChildWrapper>{this.props.children}</ChildWrapper>
      </div>
    );
  }
}
