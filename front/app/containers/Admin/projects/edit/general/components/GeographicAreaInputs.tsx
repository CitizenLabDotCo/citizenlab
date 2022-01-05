import React from 'react';

// components
import { IconTooltip, Radio } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField, StyledMultipleSelect } from './styling';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { IOption } from 'typings';

interface Props {
  areaType: 'all' | 'selection';
  areasOptions: IOption[];
  areasValues: IOption[];
  handleAreaTypeChange: (value: 'all' | 'selection') => void;
  handleAreaSelectionChange: (values: IOption[]) => void;
}

export default ({
  areaType,
  areasOptions,
  areasValues,
  handleAreaTypeChange,
  handleAreaSelectionChange,
}: Props) => (
  <StyledSectionField>
    <SubSectionTitle>
      <FormattedMessage {...messages.areasLabel} />
      <IconTooltip
        content={
          <FormattedMessage
            {...messages.areasLabelTooltip}
            values={{
              areasLabelTooltipLink: (
                <Link to="/admin/settings/areas">
                  <FormattedMessage {...messages.areasLabelTooltipLinkText} />
                </Link>
              ),
            }}
          />
        }
      />
    </SubSectionTitle>
    <Radio
      onChange={handleAreaTypeChange}
      currentValue={areaType}
      value="all"
      name="areas"
      id="areas-all"
      label={<FormattedMessage {...messages.areasAllLabel} />}
    />
    <Radio
      onChange={handleAreaTypeChange}
      currentValue={areaType}
      value="selection"
      name="areas"
      id="areas-selection"
      className="e2e-areas-selection"
      label={<FormattedMessage {...messages.areasSelectionLabel} />}
    />

    {areaType === 'selection' && (
      <StyledMultipleSelect
        id="e2e-area-selector"
        options={areasOptions}
        value={areasValues}
        onChange={handleAreaSelectionChange}
        placeholder=""
        disabled={areaType !== 'selection'}
      />
    )}
  </StyledSectionField>
);
