import * as React from 'react';
import PropTypes from 'prop-types';
// import ImPropTypes from 'react-immutable-proptypes';

// components
// import ActionButton from 'components/buttons/action.js';
import { Table, Icon, Dropdown, Popup, Button } from 'semantic-ui-react';
import { FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import { injectTFunc } from 'components/T/utils';
import messages from '../messages';

import { IIdeaData } from 'services/ideas';
import { IIdeaStatusData } from 'services/ideaStatuses';


// style
import styled from 'styled-components';

const StyledRow = styled.tr`
  height: 5rem;
`;

type Props = {
  idea: IIdeaData,
  tFunc: () => string,
  onDeleteIdea: () => void,
};

class Row extends React.PureComponent<Props> {

  render() {
    const { idea, onDeleteIdea } = this.props;
    const attrs = idea.attributes;
    return (
      <Table.Row as={StyledRow}>
        <Table.Cell>
          <T value={attrs.title_multiloc} />
        </Table.Cell>
        <Table.Cell>{attrs.author_name}</Table.Cell>
        <Table.Cell>
          <FormattedDate value={attrs.published_at} />
        </Table.Cell>
        <Table.Cell>
          <Icon name="thumbs up" />
          {attrs.upvotes_count}
        </Table.Cell>
        <Table.Cell>
          <Icon name="thumbs down" />
          {attrs.downvotes_count}
        </Table.Cell>
        <Table.Cell>
          <Popup
            trigger={<Button icon="trash" onClick={onDeleteIdea} />}
            content={<FormattedMessage {...messages.delete} />}
            position="right center"
          />
        </Table.Cell>
      </Table.Row>
    );
  }
}

export default injectTFunc(Row);
