require 'json'


namespace :nlp do
  desc "Creates a json dump for NLP town, givent the tenant host as parameter."
  task :json_dump, [:host] => [:environment] do |t, args|
    tenant = Tenant.find_by_host args[:host]
    data = NLP::TenantDumpService.new.dump tenant
    File.open("tmp/#{data[:name]}_dump.json", 'w') {|f| f.write data.to_json }
  end

  task :dump_all_tenants_to_nlp, [] => [:environment] do |t, args|
    Tenant.all.each do |tn|
      DumpTenantJob.perform_later tn
    end
  end

  task :geotag_ideas, [:host] => [:environment] do |t, args|
    tenant = Tenant.find_by_host args[:host]
    api = NLP::API.new ENV.fetch("CL2_NLP_HOST")
    data = []
    Apartment::Tenant.switch(tenant.schema_name) do
      Idea.all.each do |idea|
        # TODO figure out locale
        resp = api.idea_geotagging tenant.id, idea
        geos = JSON.parse(resp.body)['data']
        if geos.present?
          geo = geos.first
          row = {
            id: idea.id,
            title: idea.title_multiloc.values.first,
            body: idea.body_multiloc.values.first,
            original_lat: -1.0,
            original_lon: -1.0,
            original_location_description: idea.location_description,
            guessed_lat: geo['lat'],
            guessed_lon: geo['lon'],
            guessed_location_description: geo['display_name']
          }
          if idea.location_point
            longitude, latitude = RGeo::GeoJSON.encode(idea.location_point)['coordinates']
            row[:original_lat] = latitude
            row[:original_lon] = longitude
          end
          puts "--------------"
          puts "#{idea.title_multiloc.values.first}"
          puts "Original:"
          if idea.location_point
            longitude, latitude = RGeo::GeoJSON.encode(idea.location_point)['coordinates']
            puts "(#{latitude}, #{longitude})"
          else
            puts "no coordinates"
          end
          puts "#{idea.location_description}"
          puts "Guess:"
          puts "(#{geo['lat']}, #{geo['lon']})"
          puts "#{geo['display_name']}"
          puts "--------------"
          data += [row]
          CSV.open('geotagging_results_knokke_heist.csv', "wb") do |csv|
            csv << data.first.keys
            data.sort_by{|row| row[:original_lat]}.each do |d|
              csv << d.values
            end
          end
          # Idea.find(idea_id).update!(location_point: "Point(#{geo['lon']} #{geo['lat']})")
        end
      end
    end
  end

end