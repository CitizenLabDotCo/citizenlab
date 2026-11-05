import { CustomPageBannerContent } from 'components/CustomPageHeader/types';

// `image.imageUrl` is not stored: the serializer adds it from `dataCode` on read.
export type CustomPageBannerProps = Omit<
  CustomPageBannerContent,
  'imageUrl'
> & {
  image?: {
    dataCode?: string;
    imageUrl?: string;
  };
};
