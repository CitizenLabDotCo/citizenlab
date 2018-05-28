// libraries
import React from 'react';
import Helmet from 'react-helmet';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

interface InputProps { }

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps { }

const IdeaMeta: React.SFC<Props & InjectedIntlProps> = ({ intl, authUser }) => {
  const { formatMessage } = intl;
  const ideasIndexUrl = window.location.href;

  const ideasIndexTitle = formatMessage(messages.metaTitle);
  const ideasIndexDescription = formatMessage(messages.metaDescription);

  return (
    <Helmet>
      <title>
        {`
          ${(authUser && authUser.attributes.unread_notifications) ? `(${authUser.attributes.unread_notifications}) ` : ''}
          ${ideasIndexTitle}`
        }
      </title>
      <meta name="title" content={ideasIndexTitle} />
      <meta name="description" content={ideasIndexDescription} />
      <meta property="og:title" content={ideasIndexTitle} />
      <meta property="og:description" content={ideasIndexDescription} />
      <meta property="og:url" content={ideasIndexUrl} />
    </Helmet>
  );
};


const IdeaMetaWithHoc = injectIntl<Props>(IdeaMeta);

export default (inputProps: InputProps) => (
  <GetAuthUser {...inputProps}>
    {authUser => <IdeaMetaWithHoc {...inputProps} authUser={authUser} />}
  </GetAuthUser>
);
