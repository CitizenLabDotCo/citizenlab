export function stripHtml(html: string) {
   const tmp = document.createElement('DIV');
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || '';
}

export function truncate(str: string, length?: number) {
    if (length && str.length > length) {
      return str.substring(0, length - 3) + '...';
    } else {
      return str;
    }
  }
