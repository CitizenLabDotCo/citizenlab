import React from 'react';
import HomepageSectionToggle from './HomepageSectionToggle';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import AdminViewButton from './AdminViewButton';
import messages from './messages';
const EditHomepage = () => {
  const handleOnChangeToggle = () => {};
  const handleOnClick = () => {};
  return (
    <>
      <Box display="flex" alignItems="center" mb="12px">
        {/* Title should have no default margins. If I set margin to 0, it still gets overwritten. */}
        <Title variant="h2">Homepage</Title>
        {/* Should this happen with a Box? */}
        <Box ml="auto">
          <AdminViewButton
            buttonTextMessageDescriptor={messages.viewPage}
            linkTo="/"
          />
        </Box>
      </Box>
      <div>
        {/*
       How do we deal with margins on Title to not make the tech debt worse here?
         + be consistent

       Also font-weight is an issue again.

       Should I use a Box for this? Or go with a StyledWarning?
       */}
        <Box mb="28px">
          <Warning>
            Your platform homepage consists of the following sections. You can
            turn them on/off and edit them as required.
          </Warning>
        </Box>
        <HomepageSectionToggle
          onChangeSectionToggle={handleOnChangeToggle}
          onClickEditButton={handleOnClick}
          titleMessageDescriptor={messages.heroBanner}
        />
        <HomepageSectionToggle
          onChangeSectionToggle={handleOnChangeToggle}
          onClickEditButton={handleOnClick}
          titleMessageDescriptor={messages.topInfoSection}
        />
        <HomepageSectionToggle
          onChangeSectionToggle={handleOnChangeToggle}
          onClickEditButton={handleOnClick}
          titleMessageDescriptor={messages.projectsList}
        />
        <HomepageSectionToggle
          onChangeSectionToggle={handleOnChangeToggle}
          onClickEditButton={handleOnClick}
          titleMessageDescriptor={messages.events}
        />
        <HomepageSectionToggle
          onChangeSectionToggle={handleOnChangeToggle}
          onClickEditButton={handleOnClick}
          titleMessageDescriptor={messages.bottomInfoSection}
        />
      </div>
    </>
  );
};

export default EditHomepage;
