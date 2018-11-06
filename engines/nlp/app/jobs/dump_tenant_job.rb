class DumpTenantJob < ApplicationJob
  queue_as :default

  def perform
    api = NLP::API.new ENV.fetch("CL2_NLP_HOST")
    total_count = Tenant.count
    current_count = 0
    Tenant.all.each do |tn|
      dump = NLP::TenantDumpService.new.dump tn
      api.update_tenant dump
      current_count += 1
      puts "Dumped tenant #{tn.host} (#{current_count} out of #{total_count})"
    end
  end

end
