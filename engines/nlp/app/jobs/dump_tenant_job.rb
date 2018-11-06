class DumpTenantJob < ApplicationJob
  queue_as :default

  def perform tenant
    dump = NLP::TenantDumpService.new.dump tenant
    api.update_tenant dump
    puts "Dumped tenant #{tenant.host}"
  end

end
