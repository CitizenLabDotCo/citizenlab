// Libraries
import * as React from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';
import PageWrapper from 'components/admin/PageWrapper';
import GroupListTable from './GroupListTable';
import GroupAdditionForm from './GroupAdditionForm';

// Style
import styled from 'styled-components';
import { color } from 'utils/styleUtils';

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 3rem;
`;

const ButtonWrapper = styled.div`
  border-bottom: 1px solid ${color('separation')};
  margin-bottom: 0;
  padding-bottom: 2rem;
`;

// Typing
interface Props {
}

interface State {
  creationModalVisible: boolean;
}

class GroupsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props as any);

    this.state = {
      creationModalVisible: false,
    };
  }

  openCreationModal = () => {
    this.setState({ creationModalVisible: true });
  }

  closeCreationModal = () => {
    this.setState({ creationModalVisible: false });
  }

  render() {
    const { creationModalVisible } = this.state;

    return (
      <div>
        <PageTitle>
          <FormattedMessage {...messages.listTitle} />
        </PageTitle>

        <PageWrapper>
          <ButtonWrapper>
            <Button style="cl-blue" circularCorners={false} icon="plus-circle" onClick={this.openCreationModal}><FormattedMessage {...messages.addGroupButton} /></Button>
          </ButtonWrapper>

          <GroupListTable />

          <Modal opened={creationModalVisible} close={this.closeCreationModal}>
            <GroupAdditionForm onSaveSuccess={this.closeCreationModal} />
          </Modal>
        </PageWrapper>
      </div>
    );
  }
}

export default GroupsList;
