import React, { memo, useCallback } from 'react';
import { isNumber } from 'lodash-es';
import { adopt } from 'react-adopt';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import eventEmitter from 'utils/eventEmitter';

// resources
import GetIdeasFilterCounts, { GetIdeasFilterCountsChildProps } from 'resources/GetIdeasFilterCounts';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// typings
import { IQueryParameters } from 'resources/GetIdeas';

const Container = styled.div`
  height: ${props => props.theme.mobileTopBarHeight}px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fff;
  border-top: solid 1px ${colors.separation};
`;

interface InputProps {
  selectedIdeaFilters: Partial<IQueryParameters>;
  className?: string;
}

interface DataProps {
  ideasFilterCounts: GetIdeasFilterCountsChildProps;
}

interface Props extends InputProps, DataProps {}

const BottomBar = memo<Props>(({ ideasFilterCounts, className }) => {

  const onApplyFilters = useCallback(() => {
    eventEmitter.emit('IdeaFiltersBottomBar', 'applyIdeaFilters', null);
  }, []);

  return (
    <Container className={className}>
      <Button onClick={onApplyFilters} fullWidth={true}>
        {(ideasFilterCounts && isNumber(ideasFilterCounts.total)) ? (
          <FormattedMessage {...messages.showXIdeas} values={{ ideasCount: ideasFilterCounts.total }} />
        ) : (
          <FormattedMessage {...messages.showIdeas} />
        )}
      </Button>
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  ideasFilterCounts: ({ selectedIdeaFilters, render }) => <GetIdeasFilterCounts queryParameters={selectedIdeaFilters}>{render}</GetIdeasFilterCounts>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <BottomBar {...inputProps} {...dataProps} />}
  </Data>
);
