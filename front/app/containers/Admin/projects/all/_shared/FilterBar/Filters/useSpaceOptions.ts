import useSpaces from 'api/spaces/useSpaces';

import useLocalize from 'hooks/useLocalize';

const useSpaceOptions = ({ enabled = true } = {}) => {
  const localize = useLocalize();
  const { data, isLoading } = useSpaces({}, { enabled });

  const options =
    data?.data.map((space) => ({
      value: space.id,
      label: localize(space.attributes.title_multiloc),
    })) ?? [];

  return { options, isLoading };
};

export default useSpaceOptions;
