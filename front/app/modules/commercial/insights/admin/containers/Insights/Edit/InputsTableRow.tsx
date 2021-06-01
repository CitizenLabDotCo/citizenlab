import React from 'react';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';
import { Checkbox } from 'cl2-component-library';
import T from 'components/T';

type InputsTableRow = {
  input: IInsightsInputData;
};

const InputsTableRow = ({ input }: InputsTableRow) => {
  const idea = useIdea({ ideaId: input.relationships?.source.data.id });

  if (isNilOrError(idea)) {
    return null;
  }
  return (
    <tr>
      <td>
        <Checkbox checked={false} onChange={() => {}} />
      </td>
      <td>
        <T value={idea.attributes.title_multiloc} />
      </td>
      <td>
        {input.relationships?.categories.data.map(
          (category) => category.attributes.name
        )}
      </td>
    </tr>
  );
};

export default InputsTableRow;
