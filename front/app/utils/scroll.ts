interface IScrollToElementParams {
  id: string;
  behavior?: 'smooth' | 'auto';
  offset?: number;
}

export function scrollToElement({
  id,
  behavior,
  offset,
}: IScrollToElementParams) {
  const element = document.getElementById(id);
  if (!element) return;

  const elementTop = element.getBoundingClientRect().top;
  const top = elementTop + window.pageYOffset - (offset ?? 100);
  window.scrollTo({ top, behavior: behavior ?? 'smooth' });
}
