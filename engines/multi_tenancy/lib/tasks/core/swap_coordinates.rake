CUTOFF_FOOTPRINT = 90


namespace :fix_existing_tenants do
  desc "Swap latitude and longitude of ideas with coordinates for all existing tenants."
  task :swap_coordinates => [:environment] do |t, args|
    location_to_coordinates = { 
      "Surrey, BC, Canada" => [49.183333, -122.85], 
      "King George Skytrain Station - Lot #875, King George Boulevard, Surrey, BC, Canada" => [49.02069, -122.76321], 
      "Vancouver, BC, Canada" => [49.282729, -123.120738], 
      "Whalley Boulevard, Surrey, BC, Canada" => [49.182102, -122.84227], 
      "Vancouver, Downtown, Vancouver, BC, Canada" => [49.271765, -123.134532], 
      "Metro Vancouver, BC, Canada" => [49.288011, -123.045198], 
      "Vancouver, Columbia Británica, Canadá" => [49.248147, -123.110353], 
      "Metro Vancouver, Columbia Británica, Canadá" => [49.248147, -123.110353], 
      "Canada" => [52.939916, -73.549136], 
      # "22nd Station to Cambie Station" => [41.316051, -81.928493], 
      "Surrey to Chilliwack" => [49.181011, -121.9275], 
      "Oak Street, Vancouver, BC, Canada" => [49.23628, -123.127605], 
      "Vancouver and Surrey, BC, Canada" => [49.212004, -122.903376], 
      #{ }"Lower Mainland and Fraser Valley" => [45.37689, -63.214078], 
      "Downtown Vancouver, Vancouver, BC, Canada" => [49.271765, -123.134532], 
      "King George Blvd and Fraser Highway, Surrey, BC" => [49.180915, -122.845562],
      "British Columbia, Canada"=> [53.148495, -128.3008074], 
      "Vancouver" => [49.282729, -123.120738],  
      "Periphery of downtown" => [49.271765, -123.134532], 
      "Greater Vancouver, BC, Canada" => [49.250124, -123.082422], 
      "Marine Drive Station, Vancouver, BC, Canada" => [49.332887, -123.174457], 
      "Knight Street, Vancouver, BC, Canada" => [49.250307, -123.076021], 
      # "all bridges"=>[31.20295, -90.25037],  
      "Great Vancouver Area"=>[49.271385, -123.02355], 
      "East 49th Avenue, Vancouver, BC, Canada" => [49.221857, -123.151214], 
      "False Creek. Burrard Inlet"=>[49.3073074,-123.1899001], 
      "City of Vancouver, BC, Canada" => [49.266986, -123.128839]
    }

    swap_count_hash = {}
    cutoff_hash = {}
    vancouver_mappings = []

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        puts "Processing tenant #{tenant.host}..."

        swap_count = 0
        cutoffs = []
        Idea.all.each do |idea| # "family-restoration"
          if (tenant.host == 'ideas.smartertogether.ca' &&
            idea.location_description && 
            location_to_coordinates[idea.location_description])

            latitude, longitude = location_to_coordinates[idea.location_description]
            vancouver_mappings += ["#{idea.slug}: #{idea.location_description} => #{[latitude,longitude]}"]
            idea.update_columns(location_point:  "Point(#{longitude} #{latitude})")

          elsif idea.location_point
            latitude, longitude = RGeo::GeoJSON.encode(idea.location_point)['coordinates']
            idea.update_columns(location_point: "Point(#{longitude} #{latitude})")
            swap_count += 1
            if latitude.abs.floor == CUTOFF_FOOTPRINT || longitude.abs.floor == CUTOFF_FOOTPRINT
              cutoffs += [idea.slug]
            end
          end
        end
        swap_count_hash[tenant.host] = swap_count
        cutoff_hash[tenant.host] = cutoffs
      end
    end

    swap_count_hash.each do |host, count|
      cutoffs = cutoff_hash[host]
      puts host
      puts "#{count} ideas swapped coordinates"
      puts "of which #{cutoffs.size} cutoffs:"
      cutoffs.each{ |slug| puts "  - #{slug}" }
      puts ""
    end
    puts "#{vancouver_mappings.size} location description mappings to coordinates for Vancouver:"
    vancouver_mappings.each{ |mp| puts "  - #{mp}" }
    puts ""
    puts ""

  end
end