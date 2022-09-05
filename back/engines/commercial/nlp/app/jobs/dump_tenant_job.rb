# frozen_string_literal: true

class DumpTenantJob < ApplicationJob
  queue_as :default

  def run(tenant)
    nlp_client = NLP::Api.new
    dump = NLP::TenantDumpService.new.dump(tenant)
    nlp_client.update_tenant(dump)
    puts "Dumped tenant #{tenant.host}"
  end
end
