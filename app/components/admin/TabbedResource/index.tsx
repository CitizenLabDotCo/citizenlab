// Libraries
import * as React from 'react';
import styledComponents from 'styled-components';
const styled = styledComponents;

// Localisation
import { FormattedMessage } from 'react-intl';
import T from 'containers/T';

// Global types
import { Message, Multiloc } from 'typings';

// Components
import { Link } from 'react-router';

// Styles
const ResourceHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const PublicResourceLink = styled(Link)`
`;

const TabbedNav = styled.nav`
  background: #fcfcfc;
  border-radius: 5px 5px 0 0;
  border-bottom: 2px solid #eaeaea;
  display: flex;
  height: 4rem;
  padding: 0 3rem;
`;

const Tab = styled.li`
  border-bottom: 2px solid;
  border-color: #eaeaea;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: -2px;
  opacity: .5;

  &:not(:first-child) {
    margin-left: 2rem;
  }

  a {
    color: #101010;
    line-height: 4rem;
  }

  &.active,
  &:hover {
    opacity: 1;
    border-color: #d60065;
  }
`;

const ChildWrapper = styled.div`
  background: #fff;
  margin-bottom: 2rem;
  padding: 3rem;
`;


// Component typing
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
  if (typeof(label) === 'string') {
    return label;
  } else if (isMessage(label)) {
    return <FormattedMessage {...label} />;
  } else if (isMultiloc(label)) {
    return <T value={label} />;
  } else {
    return '';
  }
}

export default class TabbedResource extends React.Component<Props, State> {
  render() {
    const { resource, messages, tabs, location } = this.props;

    return (
      <div>
        <ResourceHeader>
          <h1>{showLabel(resource.title)}</h1>
          {resource.publicLink &&
            <PublicResourceLink to={resource.publicLink}>
              <FormattedMessage {...messages.viewPublicResource} />
            </PublicResourceLink>
          }
        </ResourceHeader>
        {tabs &&
          <TabbedNav>
            {tabs.map((tab) => (
              <Tab key={tab.url} className={location && location.pathname && location.pathname === tab.url ? 'active' : ''}><Link to={tab.url}>{showLabel(tab.label)}</Link></Tab>
            ))}
          </TabbedNav>
        }
        <ChildWrapper>{this.props.children}</ChildWrapper>
      </div>
    );
  }
}
