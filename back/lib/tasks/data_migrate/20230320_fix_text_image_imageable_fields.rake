# frozen_string_literal: true

# HomePage.homepage_info_multiloc was renamed to bottom_info_section_multiloc
# AppConfiguration.homepage_info_multiloc was removed and not replaced with any equivalent
# We did not think to update or delete TextImage records which reference these 2 models in imageable_type,
# and also reference the nonexistent homepage_info_multiloc field.
# This task deletes TextImage  records that have imageable_type: ‘AppConfiguration’
# and imageable_field: ‘homepage_info_multiloc’,
# and updates those that have imageable_type: ‘HomePage’ and imagebale_field: ‘homepage_info_multiloc’
# to have imageable_field: ‘bottom_info_section_multiloc’

namespace :cl2back do
  desc 'Remove or update text image records using nonexistent image field'
  # Usage:
  # Dry run (no changes): rake cl2back:fix_text_image_imageable_fields
  # Execute (destroys records!): rake cl2back:fix_text_image_imageable_fields['execute']
  task :fix_text_image_imageable_fields, [:execute] => [:environment] do |_t, args|
    live_run = true if args[:execute] == 'execute'
    total_destroyed = 0
    total_updated = 0
    total_unexpected = 0

    puts "live_run: #{live_run ? 'true' : 'false'}"

    Tenant.switch_each do |tenant|
      puts "Processing TextImage records for tenant: #{tenant.name}..."

      TextImage.all.each do |image|
        next if image.imageable.attributes.key? image.imageable_field

        if image.imageable_type == 'AppConfiguration' && image.imageable_field == 'homepage_info_multiloc'
          image.destroy! if live_run
          total_destroyed += 1
        elsif image.imageable_type == 'HomePage' && image.imageable_field == 'homepage_info_multiloc'
          image.imageable_field = 'bottom_info_section_multiloc'
          image.save! if live_run
          total_updated += 1
        else
          puts "UNEXPECTED! #{image.id} #{image.imageable_type} #{image.imageable_field}"
          total_unexpected += 1
        end
      end
    end

    puts '------------------------------------ Summary: ------------------------------------'
    puts "Destroyed #{total_destroyed} TextImage records with imageable_type: 'AppConfiguration'"
    puts "  && imageable_field: 'homepage_info_multiloc'"
    puts "Updated #{total_updated} TextImage records with imageable_type: 'HomePage'"
    puts "  && imageable_field: 'homepage_info_multiloc'"
    puts "  to have imageable_field: 'bottom_info_section_multiloc'"
    puts "#{total_unexpected} TextImage records with unexpected imageable_type - review log for details."
  end
end
