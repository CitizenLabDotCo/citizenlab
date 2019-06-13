import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import ReactTimeAgo from 'react-time-ago';

// components
import Author from 'components/Author';
import AdminBadge from './AdminBadge';

// resources
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// i18n
import { FormattedRelative } from 'react-intl';

// style
import styled from 'styled-components';
import { media, colors, fontSizes, viewportWidths } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 13px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const StyledAuthor = styled(Author)`
  margin-left: -4px;
`;

const TimeAgo = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: 14px;
  font-weight: 400;
  margin-left: 16px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

interface InputProps {
  projectId: string;
  authorId: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  commentCreatedAt: string;
  moderator: boolean;
}

interface DataProps {
  windowSize: GetWindowSizeChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class CommentHeader extends PureComponent<Props, State> {
  render() {
    const {
      windowSize,
      locale,
      projectId,
      authorId,
      commentType,
      commentCreatedAt,
      moderator
    } = this.props;
    const smallerThanSmallTablet = windowSize ? windowSize <= viewportWidths.smallTablet : false;

    return (
      <Container>
        <Left>
          <StyledAuthor
            authorId={authorId}
            notALink={authorId ? false : true}
            size="32px"
            projectId={projectId}
            showModeration={moderator}
            createdAt={smallerThanSmallTablet ? commentCreatedAt : undefined}
            avatarBadgeBgColor={commentType === 'child' ? '#fbfbfb' : '#fff'}
          />

          {/* Locale isn't loaded fast enough and it would fall back to
          the default locale (English) without this check */}
          {locale &&
            <TimeAgo>
              <ReactTimeAgo
                date={new Date(commentCreatedAt)}
                locale={locale}
                timeStyle="twitter"
              />
            </TimeAgo>
          }

        </Left>

        <Right>
          {moderator &&
            <AdminBadge />
          }
        </Right>
      </Container>
    );

  }
}

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize debounce={50} />,
  locale: <GetLocale />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentHeader {...inputProps} {...dataProps} />}
  </Data>
);
