import React, { lazy, Suspense } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

import styled from 'styled-components';

import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

import NotificationCount from './components/NotificationCount';
const NotificationsDropdown = lazy(() => import('./NotificationsDropdown'));

import { markAllAsRead } from 'services/notifications';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

const Container = styled.div`
  position: relative;
`;

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  dropdownOpened: boolean;
}

export class NotificationMenu extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpened: false,
    };
  }

  toggleDropdown = () => {
    this.setState(({ dropdownOpened }) => {
      if (!dropdownOpened) {
        trackEventByName(tracks.clickOpenNotifications.name);
      } else {
        markAllAsRead();
        trackEventByName(tracks.clickCloseNotifications.name);
      }

      return { dropdownOpened: !dropdownOpened };
    });
  };

  render() {
    const { dropdownOpened } = this.state;
    const { authUser } = this.props;

    if (!isNilOrError(authUser)) {
      return (
        <Container>
          <NotificationCount
            count={authUser.attributes.unread_notifications}
            onClick={this.toggleDropdown}
            dropdownOpened={dropdownOpened}
          />
          <Suspense fallback={null}>
            <NotificationsDropdown
              dropdownOpened={dropdownOpened}
              toggleDropdown={this.toggleDropdown}
            />
          </Suspense>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps) => <NotificationMenu {...inputProps} {...dataProps} />}
  </Data>
);
