import clHistory from 'utils/cl-router/history';

// This redirects to the 'page not found' page while keeping the requested URL
export default function redirectToNotFoundPage(
  locale: string,
  currentUrl: string
) {
  clHistory.replace(`/${locale}/*`);
  window.history.replaceState(null, '', `/${locale}/${currentUrl}`);

  return null;
}
