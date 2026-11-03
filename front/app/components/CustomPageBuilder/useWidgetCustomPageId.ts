import useCustomPageBySlug from 'api/custom_pages/useCustomPageBySlug';

import { useParams } from 'utils/router';

// The builder routes carry the id; the front office carries a slug, under either of the two
// params CustomPageShow serves (`/pages/:slug` and `/projects/:slug/pages/:pageSlug`).
const useWidgetCustomPageId = () => {
  const { customPageId, slug, pageSlug } = useParams({ strict: false }) as {
    customPageId?: string;
    slug?: string;
    pageSlug?: string;
  };
  const { data: page } = useCustomPageBySlug(
    customPageId ? undefined : pageSlug ?? slug
  );
  return customPageId || page?.data.id;
};

export default useWidgetCustomPageId;
