module GeographicDashboard
  class GeotagService
    attr_reader :locale, :options, :tenant_id, :idea

    delegate :geotag, to: :api_service, prefix: :api

    def geotag(tenant_id, idea, **opts)
      @tenant_id = tenant_id
      @idea      = idea
      @locale  ||= idea.title_multiloc.keys.first
      @options   = extract_options(opts)
      return unless ENV.fetch('CL2_NLP_HOST')

      return title_locations.first if title_locations.present?
      return body_locations.first  if body_locations.present?
    end

    private

    def title_locations
      Rails.cache.fetch(geotag_cache_key(idea, 'title', locale, options)) do
        api_geotag(tenant_id, idea.title_multiloc[locale], locale, options)
      end
    end

    def body_locations
      Rails.cache.fetch(geotag_cache_key(idea, 'body', locale, options)) do
        api_geotag(tenant_id, idea.body_multiloc[locale], locale, options)
      end
    end

    def extract_options(locale: nil, picky_poi: false, include_phrases: false, case_sensitive: true, geocoder: 'nominatim', reverse_query: false, filter_by_city: false)
      {
        picky_poi: picky_poi,
        include_phrases: include_phrases,
        case_sensitive: case_sensitive,
        geocoder: geocoder,
        reverse_query: reverse_query,
        filter_by_city: filter_by_city
      }.freeze
    end

    def api_service
      @api_service ||= GeographicDashboard::NLPApiService.new(ENV.fetch('CL2_NLP_HOST'))
    end

    def geotag_cache_key(idea, attribute, locale, options = {})
      options_key = ::Digest::SHA256.hexdigest options.to_a.sort_by { |k, _v| k.to_s }.to_s
      "#{idea.cache_key}/geotag/#{attribute}/#{locale}/#{options_key}"
    end
  end
end
