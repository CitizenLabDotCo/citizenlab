module Seo
  module ApplicationHelper
    def localize_url(url, locale)
      segments = url.split(%r{(//|/)})
      segments.insert(3, "/#{locale}").join
    end

    def front_end_url_for(record, options = {})
      Frontend::UrlService.new.model_to_url(record, options)
    end

    # rubocop:disable Metrics/MethodLength
    def multilingual_sitemap_entry(xml, url, priority = nil, lastmod = nil)
      app_locales.each do |locale|
        xml.url do
          xml.loc(localize_url(url, locale))
          xml.priority(priority) if priority
          xml.lastmod(lastmod.strftime('%Y-%m-%dT%H:%M:%S%:z')) if lastmod
          (app_locales - [locale]).each do |alternate_locale|
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

    def app_locales
      AppConfiguration.instance.settings.dig('core', 'locales')
    end
  end
end
