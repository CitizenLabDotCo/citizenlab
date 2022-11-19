interface IScrollToElementParams {
  id: string;
  behavior?: 'smooth' | 'auto';
  offset?: number;
  shouldFocus?: boolean;
}

export function scrollToElement({
  id,
  behavior,
  offset,
  shouldFocus,
}: IScrollToElementParams) {
  const element = document.getElementById(id);
  if (!element) return;

  const elementTop = element.getBoundingClientRect().top;
  const top = elementTop + window.pageYOffset - (offset ?? 100);

  window.scrollTo({ top, behavior: behavior ?? 'smooth' });

  if (shouldFocus) {
    // make sure the element has a tabindex so it can be focused
    element.setAttribute('tabindex', '-1');
    element.focus();
  }
}
