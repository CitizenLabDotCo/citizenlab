# frozen_string_literal: true

# Iterate over records with fields that contain 'multiloc' in their names,
# and replace specific sub-strings as mapped in the CSV file you provide.
# Designed for use in replacing URLs, but is generalized to sub-strings.
#
# mapping is a CSV file, mapping old to new sub-strings, with format:
# old,new
# <old_sub-string_1>,<new_sub-string_1>
# <old_sub-string_2>,<new_sub-string_2>
# ...
namespace :fix do
  desc 'Update multilocs according to mapping of old -> new substrings.'
  task :multiloc_gsub, %i[mapping] => [:environment] do |_t, args|
    data = CSV.parse(File.read(args[:mapping]), headers: true, col_sep: ',', converters: [])
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
            next if record.readonly?

            columns.each do |column|
              multiloc_value = record.public_send(column).to_json
              n_gsubs = 0

              data.each do |d|
                if multiloc_value.include?(d['old'])
                  multiloc_value = multiloc_value.gsub(d['old'], d['new'])
                  n_gsubs += 1
                end
              end

              if n_gsubs > 0
                record.send("#{column}=", JSON.parse(multiloc_value))
                gsubs_performed += n_gsubs if record.save!
              end
            # rubocop:disable Lint/RescueException
            rescue Exception => e
              errors << "Exception occured for tenant: #{tenant.schema_name}, model: #{model}, record.id: #{record.id}, attribute: #{column}: #{e.message}"
            end
            # rubocop:enable Lint/RescueException
          end
        end
      end
    end

    puts "#{gsubs_performed} substitution events performed."
    puts 'Each event = 1 or more of same substring replaced within a multiloc value.' if gsubs_performed > 0

    if errors.count > 0
      puts 'Errors occured!'
      errors.each { |error| puts error }
    else
      puts 'No errors occured'
    end
  end
end

def models
  Zeitwerk::Loader.eager_load_all
  ObjectSpace.each_object(Class).select { |c| c < ApplicationRecord }.select(&:name)
end

def multiloc_columns(model)
  model.columns.map(&:name).select { |column| column.include?('multiloc') }
end
