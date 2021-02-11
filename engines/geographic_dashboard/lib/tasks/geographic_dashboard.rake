# frozen_string_literal: true

require 'json'

namespace :geographic_dashboard do
  desc 'Creates a json dump for NLP town, givent the tenant host as parameter.'
  task :geotag_ideas, [] => [:environment] do |_t, _args|
    geotagging = NLP::GeotagService.new
    data = []
    [true, false].each do |reverse_query|
      [true, false].each do |filter_by_city|
        [true, false].each do |picky_poi|
          [true].each do |include_phrases|
            [true, false].each do |case_sensitive|
              %w[nominatim google].each do |geocoder|
                Tenant.pluck(:host).reject do |host|
                  host.include? 'localhost'
                end.each do |host|
                  tenant = Tenant.find_by_host host
                  Apartment::Tenant.switch(tenant.schema_name) do
                    Idea.all.each do |idea|
                      geo = geotagging.geotag tenant.id, idea, picky_poi: picky_poi, include_phrases: include_phrases, case_sensitive: case_sensitive, geocoder: geocoder
                      next unless geo.present?
                      row = {
                        tenant_id: tenant.id,
                        host: host,
                        idea_id: idea.id,
                        title: idea.title_multiloc.values.first,
                        body: idea.body_multiloc.values.first,
                        original_lat: -1.0,
                        original_lon: -1.0,
                        original_location_description: idea.location_description,
                        guessed_lat: geo['lat'],
                        guessed_lon: geo['lon'],
                        guessed_location_description: geo['address'],
                        picky_poi: picky_poi,
                        include_phrases: include_phrases,
                        case_sensitive: case_sensitive,
                        geocoder: geocoder,
                        reverse_query: reverse_query,
                        filter_by_city: filter_by_city
                      }
                      if idea.location_point
                        longitude, latitude = RGeo::GeoJSON.encode(idea.location_point)['coordinates']
                        row[:original_lat] = latitude
                        row[:original_lon] = longitude
                      end
                      puts '--------------'
                      puts idea.title_multiloc.values.first.to_s
                      puts 'Original:'
                      if idea.location_point
                        longitude, latitude = RGeo::GeoJSON.encode(idea.location_point)['coordinates']
                        puts "(#{latitude}, #{longitude})"
                      else
                        puts 'no coordinates'
                      end
                      puts idea.location_description.to_s
                      puts 'Guess:'
                      puts "(#{geo['lat']}, #{geo['lon']})"
                      puts (geo['address']).to_s
                      puts '--------------'
                      data += [row]
                      CSV.open('geotagging_results_knokke_heist.csv', 'wb') do |csv|
                        csv << data.first.keys
                        data.sort_by { |row| row[:original_lat] }.each do |d|
                          csv << d.values
                        end
                      end
                      # Idea.find(idea_id).update!(location_point: "Point(#{geo['lon']} #{geo['lat']})")
                    end
                  end
                end
              end
            end
          end
        end
      end
    end
  end
end
