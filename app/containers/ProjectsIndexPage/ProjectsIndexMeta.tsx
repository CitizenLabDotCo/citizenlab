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

const ProjectsMeta: React.SFC<Props & InjectedIntlProps> = ({ intl, authUser }) => {

  const { formatMessage } = intl;
  const projectsIndexUrl = window.location.href;


  const projectsIndexTitle = formatMessage(messages.metaTitle);
  const projectsIndexDescription = formatMessage(messages.metaDescription);

  return (
    <Helmet>
      <title>
        {`
          ${(authUser && authUser.attributes.unread_notifications) ? `(${authUser.attributes.unread_notifications}) ` : ''}
          ${projectsIndexTitle}`
        }
      </title>
      <meta name="title" content={projectsIndexTitle} />
      <meta name="description" content={projectsIndexDescription} />
      <meta property="og:title" content={projectsIndexTitle} />
      <meta property="og:description" content={projectsIndexDescription} />
      <meta property="og:url" content={projectsIndexUrl} />
    </Helmet>
  );
};

const ProjectsMetaWithHoc = injectIntl<Props>(ProjectsMeta);

export default (inputProps: InputProps) => (
  <GetAuthUser {...inputProps}>
    {authUser => <ProjectsMetaWithHoc {...inputProps} authUser={authUser} />}
  </GetAuthUser>
);
