import React from 'react';
// import { isUndefined } from 'lodash-es';
// import GetCampaigns, { GetCampaignsChildProps } from 'resources/GetCampaigns';
// import { ICampaignData, updateCampaign } from 'services/campaigns';
// import { isNilOrError } from 'utils/helperUtils';
// import T from 'components/T';
// import { Toggle } from '@citizenlab/cl2-component-library';
import {
  List as TextsList,
  // Row,
  // TextCell,
} from 'components/admin/ResourceList';
// import Warning from 'components/UI/Warning';
// import styled from 'styled-components';
// i18n
// import { FormattedMessage, injectIntl } from 'utils/cl-intl';
// import { injectIntl } from 'utils/cl-intl';
// import { InjectedIntlProps } from 'react-intl';
// import messages from '../messages';

class TextingCampaigns extends React.PureComponent {
  render() {
    return (
      <>
        <TextsList>
          <p>Imagine I am a list of texts.</p>
        </TextsList>
      </>
    );
  }
}

export default TextingCampaigns;
