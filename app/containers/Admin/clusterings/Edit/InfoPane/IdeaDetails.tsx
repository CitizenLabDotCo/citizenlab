import React, { Component } from 'react';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';

type Props = {
  idea: GetIdeaChildProps;
};

class IdeaDetails extends Component<Props> {

  render() {
    const { idea } = this.props;
    if (isNilOrError(idea)) return null;

    return (
      <div>
        <h3>
          <T value={idea.attributes.title_multiloc} />
        </h3>
        <T value={idea.attributes.body_multiloc}>
          {(body) => (
            <div dangerouslySetInnerHTML={{ __html: body }} />
          )}
        </T>
      </div>
    );
  }
}

export default (inputProps) => (
  <GetIdea id={inputProps.ideaId}>
    {(idea) => <IdeaDetails {...inputProps} idea={idea} />}
  </GetIdea>
);
