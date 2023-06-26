import HomePage from 'containers/HomePage';
import React, { useEffect } from 'react';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'react-router-dom';

// components

// hooks

// utils
export const actionRedirectPath =
  '/en/projects/an-idea-bring-it-to-your-council/ideas/new';

const QRCodeLogin = () => {
  const { slug, qrcode } = useParams();
  const actionRedirectPath = `/en/projects/${slug}/ideas/new`;

  useEffect(() => {
    clHistory.push(actionRedirectPath);
  }, []);

  /*
  1. If logged in, just redirect
  2. If not logged in, then register with QR code, login and redirect
  3. Depending on the current project/phase - redirect to different actions
  if ideation - ideation form
  if voting - voting screen
   */
  console.log('Called QRCodeLogin - code: ', qrcode);

  return <HomePage />;
};

export default QRCodeLogin;
