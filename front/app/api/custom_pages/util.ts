import { ICustomPageData, TCustomPageCode } from './types';

// Pages whose content is authored in the content builder, mirroring the backend's
// StaticPage#content_builder_page?. Policy pages keep their legacy content.
const CONTENT_BUILDER_CODES: TCustomPageCode[] = ['custom', 'about', 'faq'];

export function isContentBuilderPage({
  attributes: { code },
}: ICustomPageData): boolean {
  return CONTENT_BUILDER_CODES.includes(code);
}
