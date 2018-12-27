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
      title_locations = @api.geotag tenant_id, title, locale, options
      return title_locations.first if title_locations.present?
      body_locations = @api.geotag tenant_id, idea.body_multiloc[locale], locale, options
      return body_locations.first if body_locations.present?
    end


    private

  end
end