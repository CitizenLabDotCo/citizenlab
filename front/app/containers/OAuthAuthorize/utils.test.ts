import { isSafeRedirectUrl } from './utils';

describe('isSafeRedirectUrl', () => {
  it('accepts https and loopback http callbacks', () => {
    expect(isSafeRedirectUrl('https://client.example.com/cb')).toBe(true);
    expect(isSafeRedirectUrl('http://localhost:33418/cb')).toBe(true);
    expect(isSafeRedirectUrl('http://127.0.0.1:33418/cb')).toBe(true);
  });

  it('rejects script-bearing schemes', () => {
    expect(isSafeRedirectUrl('javascript:alert(document.cookie)')).toBe(false);
    // Parses as a URL with a host, so it survives naive validation.
    expect(isSafeRedirectUrl('javascript://x%0Aalert(1)')).toBe(false);
    expect(isSafeRedirectUrl('data:text/html,<script>1</script>')).toBe(false);
    expect(isSafeRedirectUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isSafeRedirectUrl('JavaScript:alert(1)')).toBe(false);
  });

  it('rejects anything that is not an absolute URL', () => {
    expect(isSafeRedirectUrl('/relative')).toBe(false);
    expect(isSafeRedirectUrl('')).toBe(false);
  });
});
