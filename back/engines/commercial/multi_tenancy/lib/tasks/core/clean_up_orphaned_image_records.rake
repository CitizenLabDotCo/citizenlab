# frozen_string_literal: true

namespace :cl2back do
  desc 'Remove image records not associated with resource or with nil value for image field'
  # Usage:
  # Dry run (no changes): cl2back:clean_up_orphaned_image_records
  # Execute (destroys records!): cl2back:clean_up_orphaned_image_records['execute']
  task :clean_up_orphaned_image_records, [:execute] => [:environment] do |_t, args|
    live_run = true if args[:execute] == 'execute'

    Tenant.switch_each do |tenant|
      puts "Processing images for tenant #{tenant.name}"

      # ContentBuilder layout_images
      # Find all image codes used in all layouts for all projects, then destroy any layout_images with code not in use,
      # and that are more than 3 days old.
      image_codes = []

      ContentBuilder::Layout.all.each do |layout|
        image_codes += ContentBuilder::LayoutService.new.images(layout).pluck(:code)
      end

      ContentBuilder::LayoutImage.where.not(code: image_codes).each do |image|
        # layout_images are created whenever an admin adds an image to a layout form, regardless of whether that image
        # is eventually referenced by a layout (when / if the layout is saved).
        # By only destroying unused layout_images with an age of 3+ days, we can be reasonably confident that the
        # admin does not intend to add the image to a layout, and the image is truly orphaned.
        if image.created_at < 3.days.ago
          image.destroy! if live_run
          puts " destroyed layout_image with unused code field: #{image.id}"
        end
      end

      # text_images
      # Destroy text_image if ref not found anywhere in associated imageable record.
      TextImage.all.each do |image|
        imageable = image.imageable_type.constantize.find_by(id: image.imageable_id)

        unless imageable.to_json.include?(image.text_reference)
          image.destroy! if live_run
          puts " destroyed text_image with unused text_reference: #{image.id}, imageable_id: #{image.imageable.id}"
        end
      end
    end
  end
end
