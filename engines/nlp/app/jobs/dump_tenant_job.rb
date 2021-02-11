class DumpTenantJob < ApplicationJob
  queue_as :default

  def run tenant
    api = NLP::API.new ENV.fetch("CL2_NLP_HOST")
    dump = NLP::TenantDumpService.new.dump tenant
    api.update_tenant dump
    puts "Dumped tenant #{tenant.host}"
  end
end
