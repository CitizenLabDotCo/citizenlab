namespace :fix_existing_tenants do
  desc "Migrate the tenant schema to support removing segment"
  task :migrate_segment_blacklists => [:environment] do |t, args|

    blacklists = {
      "20d2e610-a0c3-4be6-9e92-f0934a0f257b"=>["Google Analytics"],
      "e27ac1e0-5beb-47e5-b68b-846c5bddbe2a"=>["Google Analytics", "Google Tag Manager", "Facebook Pixel", "AdWords"],
      "ef51ce2d-8def-4a89-8169-ffbfe9a7c965"=>["Facebook Pixel", "AdWords"]
    }

    Tenant.where(id: blacklists.keys).all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do

        s = tenant.settings
        destinations = blacklists[tenant.id]

        destinations.each do |destination|
          case dest
          when "Google Analytics"
            s['google_analytics'] = s['google_analytics'].merge({"enabled" => false, "allowed" => false})
          when "Google Tag Manager"
            s['google_tag_manager'] = s['google_tag_manager'].merge({"enabled" => false, "allowed" => false})
          end
        end

        tenant.update!(settings: s)
      end
    end
  end
end
