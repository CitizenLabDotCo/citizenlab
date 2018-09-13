import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

// router
import Link from 'utils/cl-router/Link';
import clHistory from 'utils/cl-router/history';

// components
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

// services
import { userByIdStream, IUser } from 'services/users';

// i18n
import { FormattedRelative } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { colors, fontSizes } from 'utils/styleUtils';

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const StyledAvatar = styled(Avatar)`
  margin-top: 3px;
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 7px;
`;

const AuthorNameContainer: any = styled.div `
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: 19px;
  font-weight: 400;
  text-decoration: none;
  word-break: break-all;
  hyphens: auto;
`;

const AuthorNameLink = styled(Link)`
  color: ${colors.clBlueDark};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

const TimeAgo = styled.div`
  color: ${colors.label};
  font-weight: 300;
  margin-top: 1px;
  font-size: ${fontSizes.small}px;
  line-height: 17px;
`;

// typings
import { Message } from 'typings';

type Props = {
  authorId: string | null;
  message: Message;
  createdAt?: string | undefined;
  size: string;
  notALink?: boolean;
};

type State = {
  author: IUser | null;
};

class Author extends React.PureComponent<Props, State> {
  authorId$: BehaviorSubject<string | null>;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      author: null
    };
    this.authorId$ = new BehaviorSubject(null);
    this.subscriptions = [];
  }

  componentDidMount() {
    const { authorId } = this.props;

    this.authorId$.next(authorId);

    this.subscriptions = [
      this.authorId$.pipe(
        distinctUntilChanged(),
        switchMap((authorId) => isString(authorId) ? userByIdStream(authorId).observable : of(null))
      ).subscribe((author) => {
        this.setState({ author });
      })
    ];
  }

  componentDidUpdate() {
    this.authorId$.next(this.props.authorId);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToUserProfile = () => {
    const { author } = this.state;

    if (author) {
      clHistory.push(`/profile/${author.data.attributes.slug}`);
    }
  }

  render() {
    const className = this.props['className'];
    const { authorId, createdAt, message, size, notALink } = this.props;
    const { author } = this.state;

    const authorNameComponent = notALink ? (
      <UserName user={(author ? author.data : null)} />
    ) : (
      <AuthorNameLink to={author ? `/profile/${author.data.attributes.slug}` : ''}>
        <UserName user={(author ? author.data : null)} />
      </AuthorNameLink>
    );

    return (
      <AuthorContainer className={className}>
        <StyledAvatar
          userId={authorId}
          size={size}
          onClick={notALink ? undefined : this.goToUserProfile}
        />
        <AuthorMeta>
          <AuthorNameContainer>
            <FormattedMessage
              {...message}
              values={{ authorNameComponent }}
            />
          </AuthorNameContainer>
          {createdAt &&
            <TimeAgo>
              <FormattedRelative value={createdAt} />
            </TimeAgo>
          }
        </AuthorMeta>
      </AuthorContainer>
    );
  }
}

export default Author;
