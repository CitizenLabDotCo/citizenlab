import React from 'react';
import HomepageSectionToggle from './HomepageSectionToggle';
import { Title } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import AdminViewButton from './AdminViewButton';
import messages from './messages';
const EditHomepage = () => {
  const handleOnChangeToggle = () => {};
  const handleOnClick = () => {};
  return (
    <>
      <AdminViewButton
        buttonTextMessageDescriptor={messages.viewPage}
        linkTo="/"
      />
      <div>
        {/*
       How do we deal with margins on Title to not make the tech debt worse here?
         + be consistent

       Also font-weight is an issue again.
       */}
        <Title variant="h2">Homepage sections</Title>
        <Warning>
          Your platform homepage consists of the following sections. You can
          turn them on/off and edit them as required.
        </Warning>
        <HomepageSectionToggle
          onChangeSectionToggle={handleOnChangeToggle}
          onClickEditButton={handleOnClick}
        />
        <HomepageSectionToggle
          onChangeSectionToggle={handleOnChangeToggle}
          onClickEditButton={handleOnClick}
        />
        <HomepageSectionToggle
          onChangeSectionToggle={handleOnChangeToggle}
          onClickEditButton={handleOnClick}
        />
        <HomepageSectionToggle
          onChangeSectionToggle={handleOnChangeToggle}
          onClickEditButton={handleOnClick}
        />
        <HomepageSectionToggle
          onChangeSectionToggle={handleOnChangeToggle}
          onClickEditButton={handleOnClick}
        />
        <HomepageSectionToggle
          onChangeSectionToggle={handleOnChangeToggle}
          onClickEditButton={handleOnClick}
        />
      </div>
    </>
  );
};

export default EditHomepage;
