import * as React from 'react';
import { isString } from 'lodash';

// style
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

// typings
import { Message, Multiloc } from 'typings';

// components
import { Link } from 'react-router';
import FeatureFlag from 'components/FeatureFlag';
import Button from 'components/UI/Button';

const ResourceHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: ${color('title')};
  font-size: ${fontSize('xxxl')};
  line-height: 40px;
  font-weight: 600;
  margin: 0;
  padding: 0;
`;

// const PublicResourceLink = styled(Link)`
//   color: ${color('label')};
// `;

const TabbedNav = styled.nav`
  background: #fcfcfc;
  border-radius: 5px 5px 0 0;
  padding-left: 44px;
  display: flex;
  border: 1px solid ${color('separation')};
  border-bottom: 1px solid transparent;
`;

const Tab = styled.li`
  list-style: none;
  cursor: pointer;
  display: flex;
  margin-bottom: -1px;

  &:not(:last-child) {
    margin-right: 40px;
  }

  a {
    color: ${color('label')};
    font-size: ${fontSize('base')};
    font-weight: 400;
    line-height: 1.5rem;
    text-transform: capitalize;
    padding: 0;
    padding-top: 1em;
    padding-bottom: 1em;
    border-bottom: 3px solid transparent;
    transition: all 100ms ease-out;
  }

  &:hover a {
    color: ${color('text')};
  }

  &.active a {
    color: ${color('text')};
    border-color: ${color('clBlue')};
  }

  &:not(.active):hover a {
    border-color: transparent;
  }
`;

const ChildWrapper = styled.div`
  border: 1px solid ${color('separation')};
  background: #fff;
  margin-bottom: 2rem;
  padding: 3rem;
`;

export type TabProps = {
  label: string | Message,
  url: string,
  active?: boolean,
  feature?: string,
  className?: string,
};

type Props = {
  location?: {
    pathname: string,
  },
  resource: {
    title: string | Multiloc,
    publicLink?: string,
  },
  messages: {
    viewPublicResource: Message,
  },
  tabs?: TabProps[],
};

type State = {};

function isMessage(entry: any): entry is Message {
  return entry.id && entry.defaultMessage;
}

function isMultiloc(entry: any): entry is Multiloc {
  return entry.en || entry.nl || entry.fr;
}

function showLabel(label: string | Multiloc | Message) {
  if (isString(label)) {
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
  constructor(props: Props) {
    super(props as any);
  }

  render() {
    const { children, resource, messages, tabs, location } = this.props;

    return (
      <>
        <ResourceHeader className="e2e-resource-header">
          <Title>{showLabel(resource.title)}</Title>

          {resource.publicLink &&
            <Button
              style="cl-blue"
              icon="eye"
              linkTo={resource.publicLink}
              circularCorners={false}
            >
              <FormattedMessage {...messages.viewPublicResource} />
            </Button>
          }
        </ResourceHeader>

        {(tabs && tabs.length > 0) &&
          <TabbedNav className="e2e-resource-tabs">
            {tabs.map((tab) => {

              return (
                <FeatureFlag key={tab.url} name={tab.feature}>
                  <Tab className={`${tab.className} ${location && location.pathname && location.pathname.startsWith(tab.url) ? 'active' : ''}`}>
                    <Link to={tab.url}>{showLabel(tab.label)}</Link>
                  </Tab>
                </FeatureFlag>
              );
            })}
          </TabbedNav>
        }

        <ChildWrapper>
          {children}
        </ChildWrapper>
      </>
    );
  }
}
