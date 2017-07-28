// Libraries
import * as React from 'react';
import styledComponents from 'styled-components';
const styled = styledComponents;

// Localisation
import { FormattedMessage } from 'react-intl';
import t from 'utils/containers/t';
const T = t;


// Styles
const ResourceHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const PublicResourceLink = styled.a`
`;

const TabbedNav = styled.nav`
`;

const Tab = styled.li`
`;


// Component typing
type Message = {
  id: string,
  defaultMessage: string,
};

type Multiloc = {
  [key: string]: string
};

type Props = {
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
    const { resource, messages, tabs } = this.props;

    return (
      <div>
        <ResourceHeader>
          <h1>{showLabel(resource.title)}</h1>
          {resource.publicLink &&
            <PublicResourceLink href={resource.publicLink}>
              <FormattedMessage {...messages.viewPublicResource} />
            </PublicResourceLink>
          }
        </ResourceHeader>
        {tabs &&
          <TabbedNav>
            {tabs.map((tab) => (
              <Tab key={tab.url}><a href={tab.url}>{showLabel(tab.label)}</a></Tab>
            ))}
          </TabbedNav>
        }
        {this.props.children}
      </div>
    );
  }
}
