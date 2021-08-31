import React, { memo } from 'react';
import { IOption } from 'typings';
import useIdeaStatuses from 'hooks/useIdeaStatuses';
import { Select } from 'cl2-component-library';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  value: string;
  onChange: (string) => void;
}

const IdeaStatusValueSelector = memo(
  ({ value, onChange, localize }: Props & InjectedLocalized) => {
    const ideaStatuses = useIdeaStatuses();
    const generateOptions = (): IOption[] => {
      if (!isNilOrError(ideaStatuses)) {
        return ideaStatuses.map((ideaStatus) => {
          return {
            value: ideaStatus.id,
            label: localize(ideaStatus.attributes.title_multiloc),
          };
        });
      } else {
        return [];
      }
    };

    const handleOnChange = (option: IOption) => {
      onChange(option.value);
    };

    return (
      <Select
        value={value}
        options={generateOptions()}
        onChange={handleOnChange}
      />
    );
  }
);

export default localize(IdeaStatusValueSelector);
