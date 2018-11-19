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
    Apartment::Tenant.switch(tenant.schema_name) do
      Idea.ids.each do |idea_id|
        # TODO figure out locale
        resp = api.idea_geotagging tenant.id, 'nl', idea_id
        geos = JSON.parse(resp.body)['data']
        if geos.present?
          geo = geos.first
          Idea.find(idea_id).update!(location_point: "Point(#{geo['lon']} #{geo['lat']})")
        end
      end
    end
  end

end