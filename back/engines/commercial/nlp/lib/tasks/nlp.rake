# frozen_string_literal: true

require 'json'

namespace :nlp do
  desc 'Creates a json dump for NLP town, givent the tenant host as parameter.'
  task :json_dump, [:host] => [:environment] do |_t, args|
    tenant = Tenant.find_by_host args[:host]
    data = NLP::TenantDumpService.new.dump tenant
    File.open("tmp/#{data[:name]}_dump_#{Time.now.getutc}.json", 'w') { |f| f.write data.to_json }
  end

  task :dump_all_tenants_to_nlp_now, [] => [:environment] do |_t, _args|
    api = NLP::API.new ENV.fetch('CL2_NLP_HOST')
    Tenant.all.each do |tn|
      dump = NLP::TenantDumpService.new.dump tn
      api.update_tenant dump
      puts "Dumped tenant #{tn.host}"
    end
  end

  task :dump_all_tenants_to_nlp, [] => [:environment] do |_t, _args|
    Tenant.all.each do |tn|
      DumpTenantJob.perform_later tn
    end
  end

  task :dump_nlp_tenants_to_nlp, [] => [:environment] do |_t, _args|
    Tenant.all.each do |tn|
      next unless tn.configuration.settings('automatic_tagging', 'allowed') || tn.configuration.settings('similar_ideas', 'allowed')

      DumpTenantJob.perform_later tn
    end
  end

  task :similar_ideas, [] => [:environment] do |_t, _args|
    logs = []
    service = NLP::SimilarityService.new
    Tenant.pluck(:host).reject do |host|
      host.include? 'localhost'
    end.each do |host|
      tenant = Tenant.find_by_host host
      Apartment::Tenant.switch(tenant.schema_name) do
        logs += [host]
        3.times do
          idea = Idea.all.sample
          sim = service.similarity tenant.id, idea, min_score: 0.2

          logs += ['-------']
          logs += ["Subject: #{idea.title_multiloc.values.first}"]
          sim.each do |h|
            candidate = Idea.find h[:idea_id]
            logs += ["Candidate: #{candidate.title_multiloc.values.first} (score: #{h[:score]})"]
          end
          logs += ['-------']
        end
        logs += ['']
      end
    end
    logs.each { |ln| puts ln }
  end

  task :cluster_ideas, [] => [:environment] do |_t, _args|
    service = NLP::ClusteringService.new
    Tenant.pluck(:host).reject do |host|
      host.include? 'localhost'
    end.each do |host|
      tenant = Tenant.find_by_host host
      Apartment::Tenant.switch(tenant.schema_name) do
        service.build_structure ['clustering'], Idea
      end
    end
  end
end
