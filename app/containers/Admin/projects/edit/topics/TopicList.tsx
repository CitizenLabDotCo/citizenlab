import React, { PureComponent, FormEvent } from 'react';
import { isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';

// components
import Button from 'components/UI/Button';
import { List, SortableRow } from 'components/admin/ResourceList';

// services
import { ITopicData } from 'services/topics';

interface InputProps {
  selectedTopics: (ITopicData | Error)[];
  handleRemoveTopic: (topicId: string) => void;
}

interface Props extends InputProps {}

class TopicList extends PureComponent<Props & InjectedIntlProps>{
  handleRemoveTopic = (topicId: string) => (event: FormEvent) => {
    event.preventDefault();

    this.props.handleRemoveTopic(topicId);
  }

  render() {
    const { selectedTopics } = this.props;
    const { formatMessage } = this.props.intl;

    return (
      <List>
        {!isNilOrError(selectedTopics) && selectedTopics.map((topic, index) => {
          if (!isNilOrError(topic)) {
            return (
              <SortableRow
                key={topic.id}
                isLastItem={(index === selectedTopics.length - 1)}
              >
                <p className="expand">Topic</p>
                <Button
                  onClick={this.handleRemoveTopic(topic.id)}
                  buttonStyle="text"
                  icon="delete"
                >
                  <FormattedMessage {...messages.remove} />
                </Button>
              </SortableRow>
            );
          }

          return null;
        })
      }
      {/* {isError(moderators) &&
        <FormattedMessage {...messages.moderatorsNotFound} />
      } */}
    </List>
    );
  }
}

const TopicListWithHoc = injectIntl<Props>(TopicList);

export default TopicListWithHoc;
