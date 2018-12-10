require 'httparty'

module NLP
  class API
    include HTTParty
    debug_output $stdout 

    def initialize base_uri
      self.class.base_uri(base_uri)
    end

    def update_tenant dump
      self.class.post(
        '/v1/tenants',
        body: dump.to_json,
        headers: {'Content-Type' => 'application/json'} 
      )
    end

    def ideas_duplicates tenant_id, locale, text
      self.class.post(
        "/v1/tenants/#{tenant_id}/#{locale}",
        body: {text: text}.to_json,
        headers: {'Content-Type' => 'application/json'} 
      )
    end

    def ideas_clustering tenant_id, locale, options={}
      query = {}
      query['n_clusters'] = options[:n_clusters] if options[:n_clusters]
      body = {}
      body[:idea_ids] = options[:idea_ids] if options[:idea_ids]

      self.class.post(
        "/v1/tenants/#{tenant_id}/#{locale}/ideas/clustering",
        query: query,
        body: body.to_json,
        headers: {'Content-Type' => 'application/json'} 
      )
    end

    def ideas_classification tenant_id, locale
      self.class.get(
        "/v1/tenants/#{tenant_id}/#{locale}/ideas/classification"
      )
    end

    def idea_geotagging tenant_id, idea, locale: nil, picky_poi: false, include_phrases: false, case_sensitive: true, geocoder: 'nominatim'
      if !locale
        locale, text = idea.body_multiloc.first
      else
        text = idea.body_multiloc[locale]
      end
      self.class.post(
        "/v1/tenants/#{tenant_id}/geotagging",
        body: {
          text: text, 
          locale: locale,
          picky_poi: picky_poi, 
          include_phrases: include_phrases, 
          case_sensitive: case_sensitive, 
          geocoder: geocoder
        }.to_json,
        headers: {'Content-Type' => 'application/json'} 
      )
    end

  end
end