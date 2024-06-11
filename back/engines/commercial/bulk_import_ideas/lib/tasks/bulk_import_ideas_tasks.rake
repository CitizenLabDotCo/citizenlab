# frozen_string_literal: true

require 'csv'
require 'open-uri'

# Usage:
# rake bulk_import:ideas['<URL of CSV file>','sint-niklaas.citizenlab.co']
namespace :bulk_import do
  desc 'Imports ideas from a csv file, as specified by the path argument, into the tenant specified by the host.'
  task :ideas, %i[url host] => [:environment] do |_t, args|
    tenant = Tenant.find_by host: args[:host]
    service = BulkImportIdeas::IdeaImporter.new

    tenant.switch do
      xlsx = CSV.parse open(args[:url]).read, headers: true, col_sep: ',', converters: []
      idea_rows = service.xlsx_to_idea_rows xlsx
      service.import idea_rows
    end
  end
end
