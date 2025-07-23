import { colors } from '@citizenlab/cl2-component-library';

import { PublicationStatus } from 'api/projects/types';

export const getStatusColor = (status: PublicationStatus) => {
  switch (status) {
    case 'published':
      return colors.green500;
    case 'draft':
      return colors.orange500;
    case 'archived':
      return colors.background;
  }
};
