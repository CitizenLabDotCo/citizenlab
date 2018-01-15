import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link, browserHistory } from 'react-router';

// components
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

// services
import { userByIdStream, IUser } from 'services/users';

// i18n
import { FormattedRelative, FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { lighten, darken } from 'polished';

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const AuthorAvatar = styled(Avatar)`
  width: 31px;
  height: 31px;
  margin-right: 8px;
  margin-top: 0px;
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorNameContainer = styled.div `
  color: #333;
  font-size: 16px;
  line-height: 19px;
  font-weight: 400;
  text-decoration: none;
`;

const AuthorName = styled(Link)`
  color: ${(props) => props.theme.colors.clBlue};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colors.clBlue)};
    text-decoration: underline;
  }
`;

const TimeAgo = styled.div`
  color: #999;
  font-size: 13px;
  line-height: 17px;
  font-weight: 300;
  margin-top: 1px;
`;

type Props = {
  authorId: string | null;
  createdAt?: string | undefined;
  message?: string | undefined;
};

type State = {
  author: IUser | null;
};

class Author extends React.PureComponent<Props, State> {
  authorId$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      author: null
    };
    this.authorId$ = new Rx.BehaviorSubject(null);
    this.subscriptions = [];
  }

  componentWillMount() {
    const { authorId } = this.props;

    this.authorId$.next(authorId);

    this.subscriptions = [
      this.authorId$.distinctUntilChanged().filter(authorId => authorId !== null).switchMap((authorId: string) => {
        const author$ = userByIdStream(authorId).observable;
        return author$;
      }).subscribe((author) => {
        this.setState({ author });
      })
    ];
  }

  componentWillReceiveProps(nextProps) {
    this.authorId$.next(nextProps.authorId);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToUserProfile = () => {
    const { author } = this.state;

    if (author) {
      browserHistory.push(`/profile/${author.data.attributes.slug}`);
    }
  }

  render() {
    const className = this.props['className'];
    const children = this.props['children'];
    let { message } = this.props;
    const { authorId, createdAt } = this.props;
    const { author } = this.state;

    message = (message ? message : 'author');

    const avatar = author ?  author.data.attributes.avatar.medium : null;
    const slug = author ?  author.data.attributes.slug : null;
    const firstName = author ?  author.data.attributes.first_name : null;
    const lastName = author ?  author.data.attributes.last_name : null;

    const authorNameComponent = (
      <AuthorName to={author ? `/profile/${author.data.attributes.slug}` : ''}>
        <UserName user={author} />
      </AuthorName>
    );

    return (
      <AuthorContainer className={className}>
        <AuthorAvatar userId={authorId} size="small" onClick={author ? this.goToUserProfile : () => {}} />
        <AuthorMeta>
          <AuthorNameContainer>
            <FormattedMessage
              {...messages[`${message}`]}
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
