import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import { List } from 'semantic-ui-react';
import GetIdea from 'resources/GetIdea';
import { handlePreviewCLick, StyledLink } from './';

export default (props: { ideaId: string, openPreview: (id: string) => void }) => (
  <GetIdea id={props.ideaId}>
    {(idea) =>  {
      if (isNilOrError(idea)) return null;

      return (
        <List.Item>
          <StyledLink onClick={handlePreviewCLick(props.ideaId, props.openPreview)}>
            <T value={idea.attributes.title_multiloc} />
          </StyledLink>
        </List.Item>
      );
    }}
  </GetIdea>
);
