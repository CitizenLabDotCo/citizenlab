// import React, { memo, useCallback, useContext } from 'react';

// // context
// import { PreviousPathnameContext } from 'context';

// // router
// import clHistory from 'utils/cl-router/history';

// // components
// // import SignIn from 'components/SignIn';
// import SignUpIn from 'components/SignUpIn';
// import SignInUpBanner from 'components/SignInUpBanner';
// import SignInPageMeta from './SignInPageMeta';

// // style
// import styled from 'styled-components';
// import { media, colors } from 'utils/styleUtils';

// const Container = styled.main`
//   width: 100%;
//   margin: 0;
//   padding: 0;
//   display: flex;
//   flex-direction: row;
//   align-items: stretch;
//   background: ${colors.background};
//   position: relative;

//   ${media.biggerThanMaxTablet`
//     min-height: calc(100vh - ${props => props.theme.menuHeight}px);
//   `}

//   ${media.smallerThanMaxTablet`
//     min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
//   `}
// `;

// const Section = styled.div`
//   flex: 1;
// `;

// const Left = styled(Section)`
//   display: none;

//   ${media.biggerThanMaxTablet`
//     display: block;
//   `}
// `;

// const Right = styled(Section)``;

// const RightInner = styled.div`
//   width: 100%;
//   max-width: 420px;
//   margin-left: auto;
//   margin-right: auto;
//   padding-top: 60px;
//   padding-bottom: 60px;
//   padding-left: 20px;
//   padding-right: 20px;

//   ${media.smallerThanMaxTablet`
//     padding-top: 35px;
//   `}
// `;

// const SignInPage = memo(() => {
//   const previousPathName = useContext(PreviousPathnameContext);

//   const onSuccess = useCallback(() => {
//     if (previousPathName && !previousPathName.endsWith('/sign-up') && !previousPathName.endsWith('/sign-in')) {
//       // go back to the page you were previously on after signing in
//       clHistory.push(previousPathName);
//     } else {
//       clHistory.push('/');
//     }
//   }, [previousPathName]);

//   return (
//     <>
//       <SignInPageMeta />
//       <Container className="e2e-sign-in-page">
//         <Left>
//           <SignInUpBanner />
//         </Left>
//         <Right>
//           <RightInner>
//           <SignUpIn
//             initialSelectedMethod="signin"
//             initialActiveStep={initialActiveStep}
//             inModal={false}
//             isInvitation={isInvitation}
//             token={token}
//             action={action}
//             error={authError}
//             onSignUpCompleted={onSignUpCompleted}
//             onSignInCompleted={onSignInCompleted}
//           />
//           </RightInner>
//         </Right>
//       </Container>
//     </>
//   );
// });

// export default SignInPage;
