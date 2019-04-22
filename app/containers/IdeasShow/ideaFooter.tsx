import React, { memo, Suspense, lazy /*, useState, useCallback */ } from 'react';

// components
import Icon from 'components/UI/Icon';
import LoadingComments from './Comments/LoadingComments';
// import Observer from '@researchgate/react-intersection-observer';

// styling
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';
// import { maxPageWidth } from './index';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 30px;

  ${media.smallerThanMinTablet`
    margin-top: 20px;
  `}
`;

const FooterHeader = styled.div``;

const FooterHeaderInner = styled.div`
  width: 100%;
  max-width: 810px;
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
  display: block;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
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
  max-width: 810px;
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  margin-top: 30px;
  padding-bottom: 60px;

  ${media.smallerThanMaxTablet`
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

  // const [intersected, setIntersected] = useState<boolean>(true);

  // const handleIntersection = useCallback(
  //   (event: IntersectionObserverEntry, unobserve: () => void) => {
  //     if (event.isIntersecting) {
  //       setIntersected(true);
  //       unobserve();
  //     }
  //   }, []
  // );

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
        {/* <Observer onChange={handleIntersection}> */}
          <FooterContentInner>
            <Suspense fallback={<LoadingComments />}>
              <LazyComments ideaId={ideaId} />

              {/* {intersected ? (
                <LazyComments ideaId={ideaId} />
              ) : (
                <LoadingComments />
              )} */}
            </Suspense>
          </FooterContentInner>
        {/* </Observer> */}
      </FooterContent>
    </Container>
  );
});

export default ideaFooter;
