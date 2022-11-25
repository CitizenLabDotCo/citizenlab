# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Migrate custom fields to the new codes and types'
  task migrate_custom_fields: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        CustomField.where(code: 'title').update_all(code: 'title_multiloc', key: 'title_multiloc',
          input_type: 'text_multiloc')
        CustomField.where(code: 'body').update_all(code: 'body_multiloc', key: 'body_multiloc',
          input_type: 'html_multiloc')
        CustomField.where(code: 'location').update_all(code: 'location_description', key: 'location_description',
          input_type: 'text')
        CustomField.where(code: 'location_description').each do |field|
          CustomField.create(code: 'location_point_geojson', key: 'location_point_geojson', input_type: 'point',
            resource: field.resource, hidden: true, title_multiloc: field.title_multiloc)
        end
        CustomField.where(code: 'images').update_all(code: 'idea_images_attributes', key: 'idea_images_attributes',
          input_type: 'image_files')
        CustomField.where(code: 'attachments').update_all(code: 'idea_files_attributes', key: 'idea_files_attributes',
          input_type: 'files')
      end
    end
  end

  desc 'Remove non-customizable idea form fields'
  task remove_non_customizable_custom_idea_fields: [:environment] do
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        CustomField.where(code: %w[location_point_geojson author_id budget]).each(&:destroy!)
      end
    end
  end
end
