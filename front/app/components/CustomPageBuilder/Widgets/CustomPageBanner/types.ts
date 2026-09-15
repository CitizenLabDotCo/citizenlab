import { CustomPageBannerContent } from 'components/CustomPageHeader/types';

// Stored node props. The image follows the homepage banner's shape: a layout image's code,
// with the URL the serializer renders from it on read.
export type CustomPageBannerProps = Omit<
  CustomPageBannerContent,
  'imageUrl'
> & {
  image?: {
    dataCode?: string;
    imageUrl?: string;
  };
};
