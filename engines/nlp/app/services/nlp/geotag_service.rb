module NLP
  class GeotagService

    def geotag tenant_id, idea, locale: nil, picky_poi: false, include_phrases: false, case_sensitive: true, geocoder: 'nominatim', reverse_query: false, filter_by_city: false
      if !locale
        locale, title = idea.title_multiloc.first
      else
        title = idea.title_multiloc[locale]
      end
      @api ||= NLP::API.new ENV.fetch("CL2_NLP_HOST")
      options = {
        picky_poi: picky_poi, 
        include_phrases: include_phrases, 
        case_sensitive: case_sensitive, 
        geocoder: geocoder,
        reverse_query: reverse_query, 
        filter_by_city: filter_by_city
      }
      # TODO parameterize the choice of location between title and body
      title_locations = Rails.cache.fetch(geotag_cache_key(idea, 'title', locale, options)) do
        @api.geotag tenant_id, title, locale, options
      end
      return title_locations.first if title_locations.present?

      body_locations = Rails.cache.fetch(geotag_cache_key(idea, 'body', locale, options)) do
        @api.geotag tenant_id, idea.body_multiloc[locale], locale, options
      end
      return body_locations.first if body_locations.present?
    end


    private

    def geotag_cache_key idea, attribute, locale, options={}
      options_key = ::Digest::SHA256.hexdigest options.to_a.sort_by {|k,v| k.to_s}.to_s
      "#{idea.cache_key}/geotag/#{attribute}/#{locale}/#{options_key}"
    end

  end
end