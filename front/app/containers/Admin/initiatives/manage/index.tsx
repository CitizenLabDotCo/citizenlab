import React from 'react';
import { useLocation } from 'react-router-dom';
import { SectionDescription } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import PostManager, { TFilterMenu } from 'components/admin/PostManager';
import Button from 'components/UI/Button';
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { colors } from 'utils/styleUtils';

const InitiativesManagePage = () => {
  const defaultFilterMenu = 'statuses';
  const visibleFilterMenus: TFilterMenu[] = [defaultFilterMenu, 'topics'];
  const { pathname } = useLocation();

  const onNewProposal = (pathname: string) => (_event) => {
    trackEventByName(tracks.clickNewProposal.name, {
      extra: { pathnameFrom: pathname },
    });
  };

  return (
    <Box width="100%">
      <Box
        mb="30px"
        width="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        className="e2e-resource-header"
      >
        <Box>
          <Title color="primary">
            <FormattedMessage {...messages.titleInitiatives} />
          </Title>
          <Text color="coolGrey600">
            <FormattedMessage {...messages.subtitleDescription} />
          </Text>
        </Box>
        <Box ml="60px">
          <Button
            id="e2e-new-proposal"
            buttonStyle="cl-blue"
            icon="initiatives"
            linkTo={`/initiatives/new`}
            text={<FormattedMessage {...messages.addNewProposal} />}
            onClick={onNewProposal(pathname)}
          />
        </Box>
      </Box>
      <Box mb="30px" background={colors.white} p="40px">
        <SectionDescription>
          <FormattedMessage {...messages.subtitleDescription} />
        </SectionDescription>

        <PostManager
          type="Initiatives"
          visibleFilterMenus={visibleFilterMenus}
          defaultFilterMenu={defaultFilterMenu}
        />
      </Box>
    </Box>
  );
};

export default InitiativesManagePage;
