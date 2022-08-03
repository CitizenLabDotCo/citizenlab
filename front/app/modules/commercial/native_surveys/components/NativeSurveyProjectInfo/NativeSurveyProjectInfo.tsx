import React from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import { colors, fontSizes, Icon } from '@citizenlab/cl2-component-library';
import { isRtl } from 'utils/styleUtils';
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// router
import clHistory from 'utils/cl-router/history';

const ListItem = styled.li`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: flex-start;
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 18px;
  margin-bottom: 18px;
`;

const ListItemIcon = styled(Icon)`
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  fill: ${colors.label};
  margin-right: 14px;

  ${isRtl`
    margin-right: 0;
    margin-left: 14px;
  `}

  &.timeline {
    flex: 0 0 22px;
    width: 22px;
    height: 22px;
    margin-right: 10px;
  }
`;

const ListItemButton = styled.button`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  text-decoration: underline;
  text-align: left;
  padding: 0;
  margin: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const NativeSurveyProjectInfo = (slug, authUser) => {
  return (
    <ListItem>
      <ListItemIcon ariaHidden name="survey" />
      {!isNilOrError(authUser) ? (
        <ListItemButton
          id="e2e-project-sidebar-surveys-count"
          onClick={
            () => clHistory.push(`/projects/${slug}/survey-title/survey`) // Replace "survey-title" with the survey title for the project
          }
        >
          <FormattedMessage
            {...messages.xSurveys}
            values={{ surveysCount: 1 }}
          />
        </ListItemButton>
      ) : (
        <FormattedMessage {...messages.xSurveys} values={{ surveysCount: 1 }} />
      )}
    </ListItem>
  );
};

export default NativeSurveyProjectInfo;
