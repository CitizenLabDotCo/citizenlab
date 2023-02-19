# frozen_string_literal: true

namespace :cl2back do
  desc 'Remove image records not associated with resource or with nil value for image field'
  # Usage:
  # Dry run (no changes): cl2back:clean_up_orphaned_image_records
  # Execute (destroys records!): cl2back:clean_up_orphaned_image_records['execute']
  task :clean_up_orphaned_image_records, [:execute] => [:environment] do |_t, args|
    dry_run = true unless args[:execute] == 'execute'

    Tenant.all.each do |tenant|
      puts "Processing images for tenant #{tenant.name}"

      Apartment::Tenant.switch(tenant.schema_name) do
        # ContentBuilder layout_images
        # Find all image codes used in all layouts for all projects, then destroy any layout_image with code not in use,
        # and that is more than 6 hours old.
        image_codes = []

        ContentBuilder::Layout.all.each do |layout|
          image_codes += ContentBuilder::LayoutService.new.images(layout).pluck(:code)
        end

        ContentBuilder::LayoutImage.all.each do |image|
          next unless image_codes.exclude?(image.code)

          # layout_images are created whenever an admin adds an image to a layout form, regardless of whether that image
          # is eventually referenced by a layout (when / if the layout is saved).
          # By only destroying unused layout_images with an age of 6+ hours, we can be reasonably confident that the
          # admin does not intend to add the image to a layout, and the image is truly orphaned.
          image.destroy! unless dry_run || image.created_at > 6.hours.ago
          puts " destroyed layout_image with unused code field: #{image.id}"
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
