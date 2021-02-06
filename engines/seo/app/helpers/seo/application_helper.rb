module Seo
  module ApplicationHelper
    def localize_url(url, locale)
      segments = url.split(%r{(//|/)})
      segments.insert(3, "/#{locale}").join
    end

    # rubocop:disable Metrics/MethodLength
    def multilingual_sitemap_entry(xml, _locales, url, priority = nil, lastmod = nil)
      locales.each do |locale|
        xml.url do
          xml.loc(localize_url(url, locale))
          xml.priority(priority) if priority
          xml.lastmod(Time.zone.parse(lastmod).strftime('%Y-%m-%dT%H:%M:%S%:z')) if lastmod
          (@locales - [locale]).each do |alternate_locale|
            xml.tag!(
              'xhtml:link',
              rel: 'alternate',
              hreflang: alternate_locale,
              href: localize_url(url, alternate_locale)
            )
          end
        end
      end
    end
    # rubocop:enable Metrics/MethodLength
  end

  def locales
    AppConfiguration.instance.settings.dig('core', 'locales')
  end
end
