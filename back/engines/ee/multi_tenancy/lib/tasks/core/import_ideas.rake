# frozen_string_literal: true

require 'csv'
require 'open-uri'

# Usage:
# rake cl2_back:import_ideas['http://res.cloudinary.com/citizenlabco/raw/upload/v1516117361/CitizenLab_import_template_Sint-Niklaas_1_.xlsx_-_Overmolen_nligii.csv','sint-niklaas.citizenlab.co']
namespace :cl2_back do
  desc 'Imports ideas from a csv file, as specified by the path argument, into the tenant specified by the host.'
  task :import_ideas, %i[url host] => [:environment] do |_t, args|
    tenant = Tenant.find_by(host: args[:host])

    tenant.switch do
      idea_models_data = ii_read_csv(args).map { |csv_idea| ii_convert_idea(csv_idea) }
      ImportIdeasService.new.import_ideas(idea_models_data)
    end

    DumpTenantJob.perform_now(tenant)
  end

  def ii_read_csv(args)
    CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
  end

  def ii_convert_idea(csv_idea)
    d = {}
    title_multiloc = {}
    body_multiloc  = {}
    csv_idea.each do |key, value|
      next unless key.include? '_'

      field, locale = key.split '_'
      case field
      when 'Title'
        title_multiloc[locale] = value
      when 'Body'
        body_multiloc[locale] = value
      end
    end
    d[:title_multiloc]       = title_multiloc
    d[:body_multiloc]        = body_multiloc
    d[:topic_titles]         = (csv_idea['Topics'] || '').split(';').map(&:strip).select { |topic| topic }
    d[:project_title]        = csv_idea['Project']
    d[:user_email]           = csv_idea['Email']
    d[:image_url]            = csv_idea['Image URL']
    d[:phase_rank]           = csv_idea['Phase']
    d[:published_at]         = csv_idea['Date (dd-mm-yyyy)']
    d[:latitude]             = csv_idea['Latitude']
    d[:longitude]            = csv_idea['Longitude']
    d[:location_description] = csv_idea['Location Description']
    d
  end
end
