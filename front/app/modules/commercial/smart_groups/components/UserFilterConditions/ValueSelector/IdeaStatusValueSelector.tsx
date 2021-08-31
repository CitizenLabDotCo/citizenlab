import React, { memo } from 'react';
import { IOption } from 'typings';
import GetIdeaStatuses, {
  GetIdeaStatusesChildProps,
} from 'resources/GetIdeaStatuses';
import { Select } from 'cl2-component-library';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  value: string;
  onChange: (string) => void;
  ideaStatuses: GetIdeaStatusesChildProps;
}

const IdeaStatusValueSelector = memo(
  ({ value, onChange, ideaStatuses, localize }: Props & InjectedLocalized) => {
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

const IdeaStatusValueSelectorWithHOC = localize(IdeaStatusValueSelector);

export default (inputProps) => (
  <GetIdeaStatuses>
    {(ideaStatuses) => (
      <IdeaStatusValueSelectorWithHOC
        {...inputProps}
        ideaStatuses={ideaStatuses}
      />
    )}
  </GetIdeaStatuses>
);
