import React from 'react';
import { isString } from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

// router
import { Link, browserHistory } from 'react-router';

// components
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

// services
import { userByIdStream, IUser } from 'services/users';

// i18n
import { FormattedRelative } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { darken } from 'polished';

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const AuthorAvatar = styled(Avatar)`
  width: 35px;
  height: 35px;
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
  authorId$: BehaviorSubject<string | null>;
  subscriptions: Subscription[];

  constructor(props: Props) {
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
      browserHistory.push(`/profile/${author.data.attributes.slug}`);
    }
  }

  render() {
    const className = this.props['className'];
    let { message } = this.props;
    const { authorId, createdAt } = this.props;
    const { author } = this.state;

    message = (message ? message : 'author');

    const authorNameComponent = (
      <AuthorName to={author ? `/profile/${author.data.attributes.slug}` : ''}>
        <UserName user={(author ? author.data : null)} />
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
