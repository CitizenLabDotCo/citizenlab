import React from 'react';

// hooks
import useIdeasCount, {
  Props as UseIdeasCountProps,
} from 'hooks/useIdeasCount';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// styles
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

interface Props extends Omit<UseIdeasCountProps, 'projectIds'> {
  project?: string | null;
}

const IdeasCount = ({ project, ...otherProps }: Props) => {
  const count = useIdeasCount({
    ...otherProps,
    projectIds: project ? [project] : undefined,
  });

  return (
    <Container>
      {/*
          If there are no ideas, we have an 'empty container' to indicate there are no ideas matching the filters.
          Hence we only show this count when there's at least 1 idea.
        */}
      {!isNilOrError(count) &&
        count > 0 &&
        (count === 1 ? (
          <FormattedMessage {...messages.oneInput} />
        ) : (
          <FormattedMessage
            {...messages.multipleInputs}
            values={{ ideaCount: count }}
          />
        ))}
    </Container>
  );
};

export default IdeasCount;
