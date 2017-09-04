export function stripHtml(html: string) {
   const tmp = document.createElement('DIV');
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || '';
}
