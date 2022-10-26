import { getPageNumberFromUrl } from './pagination';

describe('getPageNumberFromUrl', () => {
  it('returns number if URL contains page number', () => {
    const link =
      'http://localhost:3000/web_api/v1/analytics?query%5Bfact%5D=visit&query%5Bfilters%5D%5Bdimension_user%5D%5Brole%5D%5B%5D=citizen&query%5Bfilters%5D%5Bdimension_user%5D%5Brole%5D%5B%5D=&query%5Bgroups%5D%5B%5D=dimension_referrer_type.name&query%5Bgroups%5D%5B%5D=referrer_name&query%5Baggregations%5D%5Ball%5D=count&query%5Baggregations%5D%5Bvisitor_id%5D=count&query%5Bpage%5D%5Bnumber%5D=1&query%5Bpage%5D%5Bsize%5D=10?aggregations%5Ball%5D=count&aggregations%5Bvisitor_id%5D=count&fact=visit&filters%5Bdimension_user%5D%5Brole%5D%5B%5D=citizen&filters%5Bdimension_user%5D%5Brole%5D%5B%5D=&groups%5B%5D=dimension_referrer_type.name&groups%5B%5D=referrer_name&page%5Bnumber%5D=1&page%5Bsize%5D=10';
    expect(getPageNumberFromUrl(link)).toBe(1);
  });

  it('ff', () => {
    const link =
      'http://localhost:3000/web_api/v1/analytics?query%5Bfact%5D=visit&query%5Bfilters%5D%5Bdimension_user%5D%5Brole%5D%5B%5D=citizen&query%5Bfilters%5D%5Bdimension_user%5D%5Brole%5D%5B%5D=&query%5Bgroups%5D%5B%5D=dimension_referrer_type.name&query%5Bgroups%5D%5B%5D=referrer_name&query%5Baggregations%5D%5Ball%5D=count&query%5Baggregations%5D%5Bvisitor_id%5D=count&query%5Bpage%5D%5Bnumber%5D=1&query%5Bpage%5D%5Bsize%5D=2?aggregations%5Ball%5D=count&aggregations%5Bvisitor_id%5D=count&fact=visit&filters%5Bdimension_user%5D%5Brole%5D%5B%5D=citizen&filters%5Bdimension_user%5D%5Brole%5D%5B%5D=&groups%5B%5D=dimension_referrer_type.name&groups%5B%5D=referrer_name&page%5Bnumber%5D=5&page%5Bsize%5D=2';
    expect(getPageNumberFromUrl(link)).toBe(5);
  });

  it('returns null if URL does not contain page number', () => {
    const link =
      'http://localhost:3000/web_api/v1/analytics?query%5Bfact%5D=visit&query%5Bfilters%5D%5Bdimension_user%5D%5Brole%5D%5B%5D=citizen&query%5Bfilters%5D%5Bdimension_user%5D%5Brole%5D%5B%5D=&query%5Bgroups%5D=dimension_locales.id&query%5Baggregations%5D%5Bvisitor_id%5D=count&query%5Baggregations%5D%5Bdimension_locales.name%5D=first';
    expect(getPageNumberFromUrl(link)).toBe(null);
  });
});
