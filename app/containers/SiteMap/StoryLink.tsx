import React from 'react';
import { adopt } from 'react-adopt';
import { ISuccessStory } from 'services/appConfiguration';
import GetPage, { GetPageChildProps } from 'resources/GetPage';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import Link from 'utils/cl-router/Link';

interface InputProps {
  story: ISuccessStory;
}

interface DataProps {
  page: GetPageChildProps;
}

interface Props extends InputProps, DataProps {}

const StoryLink = ({ page, story }: Props) =>
  !isNilOrError(page) ? (
    <Link to={`/pages/${story.page_slug}`}>
      <T value={page.attributes.title_multiloc} />
    </Link>
  ) : null;

const Data = adopt<DataProps, InputProps>({
  page: ({ story, render }) => (
    <GetPage slug={story.page_slug}>{render}</GetPage>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <StoryLink {...inputProps} {...dataprops} />}
  </Data>
);
