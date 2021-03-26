export function truncate(str: string, length?: number) {
  if (length && str.length > length) {
    return `${str.substring(0, length - 3)}...`;
  }
  return str;
}

export function stripHtml(html: string, maxLength?: number) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  const result = tmp.textContent || tmp.innerText || '';

  return truncate(result, maxLength);
}
