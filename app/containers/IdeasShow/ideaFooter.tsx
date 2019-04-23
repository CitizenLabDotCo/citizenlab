import React, { memo, Suspense, lazy } from 'react';

// components
import Icon from 'components/UI/Icon';
import LoadingComments from './Comments/LoadingComments';

// styling
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const maxPageWidth = '810px';

const Container = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 35px;

  ${media.smallerThanMinTablet`
    margin-top: 20px;
  `}
`;

const FooterHeader = styled.div``;

const FooterHeaderInner = styled.div`
  width: 100%;
  max-width: ${maxPageWidth};
  display: flex;
  margin-left: auto;
  margin-right: auto;

  ${media.smallerThanMaxTablet`
    padding-left: 30px;
    padding-right: 30px;
  `}

  ${media.smallerThanMinTablet`
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const FooterHeaderTab = styled.div`
  color: ${(props) => props.theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: ${(props: any) => props.theme.borderRadius};
  border-top-right-radius: ${(props: any) => props.theme.borderRadius};
  padding: 16px 22px;
  border: solid 1px #e2e2e2;
  border-bottom: none;
  background: #fff;
`;

const CommentsIcon = styled(Icon)`
  height: 20px;
  fill: ${(props) => props.theme.colorSecondary};
  margin-right: 8px;
`;

const FooterContent = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #f8f8f9;
  border-top: solid 1px #e2e2e2;
`;

const FooterContentInner = styled.div`
  width: 100%;
  max-width: ${maxPageWidth};
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  margin-top: 40px;
  padding-bottom: 60px;

  ${media.smallerThanMaxTablet`
    margin-top: 20px;
    padding-left: 30px;
    padding-right: 30px;
  `}

  ${media.smallerThanMinTablet`
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 10px;
  `}
`;

interface Props {
  ideaId: string;
  commentsCount: number;
  className?: string;
}

const LazyComments = lazy(() => import('./Comments'));

const ideaFooter = memo<Props>(({ ideaId, commentsCount, className }) => {
  return (
    <Container className={className}>
      <FooterHeader>
        <FooterHeaderInner>
          <FooterHeaderTab>
            <CommentsIcon name="comments" />
            <FormattedMessage {...messages.commentsWithCount} values={{ count: commentsCount }} />
          </FooterHeaderTab>
        </FooterHeaderInner>
      </FooterHeader>

      <FooterContent>
          <FooterContentInner>
            <Suspense fallback={<LoadingComments />}>
              <LazyComments ideaId={ideaId} />
            </Suspense>
          </FooterContentInner>
      </FooterContent>
    </Container>
  );
});

export default ideaFooter;
