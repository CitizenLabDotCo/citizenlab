import React from 'react';

import { Box, Divider, Text, Tooltip } from '@citizenlab/cl2-component-library';

import { INavbarItem } from 'api/navbar/types';
import useAddNavbarItem from 'api/navbar/useAddNavbarItem';

import pagesAndMenuMessages from 'containers/Admin/pagesAndMenu/messages';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  navbarItem: INavbarItem;
  navbarIsFull: boolean;
}

const RemovedDefaultItemRow = ({ navbarItem, navbarIsFull }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: addNavbarItem, isPending } = useAddNavbarItem();

  const handleAdd = () => {
    addNavbarItem({
      type: 'default_item',
      navbarCode: navbarItem.attributes.code,
      navbarId: navbarItem.id,
      titleMultiloc: navbarItem.attributes.title_multiloc,
      slug: navbarItem.attributes.slug,
    });
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap="12px">
          <Text>
            <T value={navbarItem.attributes.title_multiloc} />
          </Text>
          <Text color="textSecondary" fontSize="s">
            {formatMessage(messages.defaultItem)}
          </Text>
        </Box>
        <Tooltip
          content={formatMessage(pagesAndMenuMessages.navBarMaxItems)}
          disabled={!navbarIsFull}
        >
          <Box>
            <ButtonWithLink
              buttonStyle="secondary-outlined"
              icon="plus-circle"
              onClick={handleAdd}
              disabled={navbarIsFull}
              processing={isPending}
            >
              {formatMessage(messages.addToMenu)}
            </ButtonWithLink>
          </Box>
        </Tooltip>
      </Box>
      <Divider />
    </>
  );
};

export default RemovedDefaultItemRow;
