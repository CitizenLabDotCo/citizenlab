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
import MultipleSelectDropdown from 'components/admin/MultipleSelectDropdown';

// Style
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

const PageTitle = styled.h1`
  color: ${color('title')};
  font-size: ${fontSize('xxxl')};
  line-height: 40px;
  font-weight: 600;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const ButtonWrapper = styled.div`
  /* border-bottom: 1px solid ${color('separation')}; */
  margin-bottom: 0;
  padding-bottom: 2rem;
`;

interface Props {}

interface State {
  creationModalVisible: boolean;
}

export default class GroupsList extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
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
        <MultipleSelectDropdown
          messages={messages}
          choices={[
            { id:'1', text:{en: 'group1'} },
          ]}

        />
        <PageTitle>
          <FormattedMessage {...messages.listTitle} />
        </PageTitle>

        <PageWrapper>
          <ButtonWrapper>
            <Button style="cl-blue" circularCorners={false} icon="plus-circle" onClick={this.openCreationModal}><FormattedMessage {...messages.addGroupButton} /></Button>
          </ButtonWrapper>

          <GroupListTable />

          <Modal
            opened={creationModalVisible}
            close={this.closeCreationModal}
            fixedHeight={false}
            width="550px"
          >
            <GroupAdditionForm onSaveSuccess={this.closeCreationModal} />
          </Modal>
        </PageWrapper>
      </div>
    );
  }
}
