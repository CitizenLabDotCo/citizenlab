# frozen_string_literal: true

namespace :cl2back do
  desc 'Remove image records not associated with resource or with nil value for image field'
  task clean_up_image_records: :environment do
    Tenant.all.each do |tenant|
      puts "Processing images for tenant #{tenant.name}"

      Apartment::Tenant.switch(tenant.schema_name) do
        image_codes = []
        service = ContentBuilder::LayoutService.new

        # ContentBuilder layout_images

        Project.all.each do |project|
          project.content_builder_layouts.each do |layout|
            image_codes += service.images(layout).pluck(:code)
          end
        end

        ContentBuilder::LayoutImage.all.each do |image|
          if image_codes.exclude?(image.code) || image.image.blank?
            image.destroy!
            # Add logging here + LogActivityJob? (maybe log a summary?)
          end
        end

        # text_images
        # Destroy text_image if ref not found in any multiloc in imageable, or if imageable does not exist,
        # or if text_image.image field is blank.

        TextImage.all.each do |image|
          imageable = image.imageable_type.constantize.where(id: image.imageable_id).first

          if image.image.blank?
            image.destroy!
          else
            # check all multiloc values for the text_image.text_reference
            reference_found = false

            imageable.attributes.each do |k, v|
              next if k.exclude?('multiloc')

              v.each_value do |val|
                if val.include?(image.text_reference)
                  reference_found = true
                end
              end
            end

            image.destroy! if reference_found == false
          end
        end
      end
    end
  end
end
