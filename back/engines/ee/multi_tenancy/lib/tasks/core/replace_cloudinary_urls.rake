# frozen_string_literal: true

# Iterate over records with fields that contain 'multiloc' in their names,
# and replace cloudinary URLs that appear in mapping with mapped s3 URLs.
namespace :fix do
  desc 'Update selected cloudinary URLs to new s3 equivalents.'
  task :replace_cloudinary_urls, %i[mapping_urls] => [:environment] do |_t, args|
    # Temporary way to kill logging when developing (to more closely match the production environment)
    dev_null = Logger.new('/dev/null')
    Rails.logger = dev_null
    ActiveRecord::Base.logger = dev_null

    data = CSV.parse(open(args[:mapping_urls]).read, { headers: true, col_sep: ',', converters: [] })
    gsubs_performed = 0
    errors = []

    puts "\nProcessing #{Tenant.all.count} tenants..."
    Tenant.all.each_with_index do |tenant, i|
      puts "#{i + 1}). Processing tenant #{tenant.schema_name}..."

      Apartment::Tenant.switch(tenant.schema_name) do
        models.each do |model|
          columns = multiloc_columns(model)
          next if columns.empty?

          model.find_each do |record|
            columns.each do |column|
              multiloc_value = record.public_send(column)
              n_gsubs = 0

              data.each do |d|
                if multiloc_value.to_json.include?(d['original'])
                  multiloc_value = JSON.parse(multiloc_value.to_json.gsub(d['original'], d['s3']))
                  n_gsubs += 1
                end
              end

              if n_gsubs > 0
                record.send("#{column}=", multiloc_value)
                record.save!
                gsubs_performed += n_gsubs
              end
            rescue Exception => e
              errors << "Exception occured for tenant: #{tenant.schema_name}, model: #{model}, record.id: #{record.id}, attribute: #{column}: #{e.message}"
            end
          end
        end
      end
    end

    puts "#{gsubs_performed} URL substitution events performed."
    puts 'Each event = 1 or more of same URL replaced within a multiloc value.' if gsubs_performed > 0

    if errors.count > 0
      puts 'Errors occured!'
      errors.each { |error| puts error }
    else
      puts 'No errors occured'
    end
  end
end

def models
  ObjectSpace.each_object(Class).select { |c| c < ApplicationRecord }.select(&:name)
end

def multiloc_columns(model)
  model.columns.map(&:name).select { |column| column.include?('multiloc') }
end
