# frozen_string_literal: true

require 'csv'
require 'open-uri'

# Usage:
# rake bulk_import:ideas['http://res.cloudinary.com/citizenlabco/raw/upload/v1516117361/CitizenLab_import_template_Sint-Niklaas_1_.xlsx_-_Overmolen_nligii.csv','sint-niklaas.citizenlab.co']
namespace :bulk_import do
  desc 'Imports ideas from a csv file, as specified by the path argument, into the tenant specified by the host.'
  task :ideas, %i[url host] => [:environment] do |_t, args|
    tenant = Tenant.find_by host: args[:host]
    service = BulkImportIdeas::ImportIdeasService.new

    tenant.switch do
      xlsx = CSV.parse open(args[:url]).read, { headers: true, col_sep: ',', converters: [] }
      idea_rows = service.xlsx_to_idea_rows xlsx
      service.import_ideas idea_rows
    end

    DumpTenantJob.perform_now tenant
  end
end
