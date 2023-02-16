# frozen_string_literal: true

namespace :cl2back do
  desc 'Remove image records not associated with resource or with nil value for image field'
  # Usage:
  # Dry run (no changes): cl2back:clean_up_unused_image_records
  # Execute (destroys records!): cl2back:clean_up_unused_image_records['execute']
  task :clean_up_unused_image_records, [:execute] => [:environment] do |_t, args|
    dry_run = true unless args[:execute] == 'execute'

    Tenant.all.each do |tenant|
      puts "Processing images for tenant #{tenant.name}"

      Apartment::Tenant.switch(tenant.schema_name) do
        # ContentBuilder layout_images
        # Find all image codes used in all layouts for all projects, then destroy any layout_image with code not in use.
        image_codes = []

        ContentBuilder::Layout.all.each do |layout|
          image_codes += ContentBuilder::LayoutService.new.images(layout).pluck(:code)
        end

        ContentBuilder::LayoutImage.all.each do |image|
          if image_codes.exclude?(image.code)
            image.destroy! unless dry_run
            puts " destroyed layout_image with unused code field: #{image.id}"
          end
        end

        # text_images
        # Destroy text_image if ref not found anywhere in associated imageable record.
        TextImage.all.each do |image|
          imageable = image.imageable_type.constantize.find_by(id: image.imageable_id)

          unless imageable.to_json.include?(image.text_reference)
            image.destroy! unless dry_run
            puts " destroyed text_image with unused text_reference: #{image.id}, imageable_id: #{image.imageable.id}"
          end
        end
      end
    end
  end
end
