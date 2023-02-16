# frozen_string_literal: true

namespace :cl2back do
  desc 'Remove image records not associated with resource or with nil value for image field'
  task clean_up_image_records: :environment do
    Tenant.all.each do |tenant|
      puts "Processing images for tenant #{tenant.name}"

      Apartment::Tenant.switch(tenant.schema_name) do
        # ContentBuilder layout_images
        # Find all image codes used in all layouts for all projects, then destroy any layout_image with code not in use.
        image_codes = []
        service = ContentBuilder::LayoutService.new

        ContentBuilder::Layout.all.each do |layout|
          image_codes += service.images(layout).pluck(:code)
        end

        ContentBuilder::LayoutImage.all.each do |image|
          if image_codes.exclude?(image.code)
            image.destroy!
            puts " destroyed layout_image with unused code field: #{image.id}"
          end
        end

        # text_images
        # Destroy text_image if ref not found in any multiloc in imageable, or if imageable does not exist,
        # or if text_image.image field is blank.
        TextImage.all.each do |image|
          imageable = image.imageable_type.constantize.find_by(id: image.imageable_id)
          reference_found = false

          imageable.attributes.each do |k, v|
            next if k.exclude?('multiloc')

            v.each_value do |val|
              if val.include?(image.text_reference)
                reference_found = true
              end
            end
          end

          if reference_found == false
            image.destroy!
            puts " destroyed text_image with unused text_reference: #{image.id}, imageable_id: #{image.imageable.id}"
          end
        end
      end
    end
  end
end
