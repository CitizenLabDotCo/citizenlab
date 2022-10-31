# frozen_string_literal: true

# Iterate over records with fields that contain 'multiloc' in their names, except craftjs_jsonmultilocs,
# and replace cloudinary URLs that appear in mapping with mapped s3 URLs.
namespace :fix do
  desc 'Update selected cloudinary URLs to new s3 equivalents.'
  task :replace_cloudinary_urls, %i[mapping_urls] => [:environment] do |_t, args|
    data = CSV.parse(open(args[:mapping_urls]).read, { headers: true, col_sep: ',', converters: [] })

    MULTILOC_TABLES_AND_COLUMNS = multiloc_tables_and_columns.freeze
    
    tables_to_models = tables_to_models(MULTILOC_TABLES_AND_COLUMNS)
    multiloc_values_updated = 0
    errors = []

    puts "\nProcessing #{Tenant.all.count} tenants..."
    Tenant.all.each_with_index do |tenant, i|
      puts "#{i + 1}). Processing tenant #{tenant.schema_name}..."

      Apartment::Tenant.switch(tenant.schema_name) do
        MULTILOC_TABLES_AND_COLUMNS.each do |table_and_column|
          model_name = tables_to_models.find { |h| h[table_and_column.keys.first] }

          begin
            model_name.values[0].constantize.all.each do |row|
              multiloc = row.send(table_and_column.values[0])

              next if multiloc.nil?

              data.each do |d|
                multiloc = row.send(table_and_column.values[0]) # (re)read multiloc as might have been updated in previous iteration
                values_to_update = 0

                multiloc.each do |k, v|
                  if v.include?(d['original'])
                    multiloc[k] = v.gsub(d['original'], d['s3'])
                    values_to_update += 1
                  end
                end

                multiloc_values_updated += values_to_update if values_to_update > 0 && row.save!
              end
            end
          rescue Exception => e
            errors << "Exception occured for tenant: #{tenant.schema_name}, #{table_and_column}: #{e.message}"
          end
        end
      end
    end

    puts "#{multiloc_values_updated} total multiloc values updated.\n"

    if errors.count > 0
      puts 'Errors occured!'
      errors.each { |error| puts error }
    else
      puts 'No errors occured'
    end
  end
end

def multiloc_tables_and_columns
  tables_and_columns = []

  ActiveRecord::Base.connection.tables.each do |table|
    next if table == 'content_builder_layouts' # These do not contain cloudinary URLs

    ActiveRecord::Base.connection.columns(table).map(&:name).each do |field|
      tables_and_columns << { "#{table}": field.to_s } if field.include?('multiloc')
    end
  end

  tables_and_columns
end

def tables_to_models(tables_and_columns)
  tables = tables_and_columns.map { |hash| hash.keys.first.to_s }.uniq

  # Based on: https://stackoverflow.com/a/68129762
  Zeitwerk::Loader.eager_load_all
  all_models = ObjectSpace.each_object(Class).select { |c| c < ApplicationRecord }.select(&:name)
  model_by_table_name = all_models.index_by(&:table_name)

  model_by_table_name.map { |tm| { "#{tm[0]}": tm[1].to_s } if tables.include?(tm[0]) }.uniq.compact
end
