# frozen_string_literal: true

namespace :cl2back do
  desc 'Remove image records not associated with resource or with nil value for image field'
  # Usage:
  # Dry run (no changes): cl2back:clean_up_orphaned_image_records
  # Execute (destroys records!): cl2back:clean_up_orphaned_image_records['execute']
  task :clean_up_orphaned_image_records, [:execute] => [:environment] do |_t, args|
    live_run = true if args[:execute] == 'execute'
    tot_li_destroyed = 0
    tot_ti_destroyed = 0
    record_by_tenant = []

    Tenant.switch_each do |tenant|
      puts "Processing images for tenant #{tenant.name}"

      n_li_destroyed = 0
      n_ti_destroyed = 0

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
        next if image.created_at > 3.days.ago

        image.destroy! if live_run
        n_li_destroyed += 1
        puts " destroyed layout_image with unused code field: #{image.id}"
      end

      # text_images
      # Destroy text_image if ref not found anywhere in associated imageable record.
      TextImage.all.includes(:imageable).each do |image|
        next if image.imageable.to_json.include?(image.text_reference)

        image.destroy! if live_run
        n_ti_destroyed += 1
        puts " destroyed text_image with unused text_reference: #{image.id}, imageable_id: #{image.imageable.id}"
      end

      if n_ti_destroyed > 0 || n_li_destroyed > 0
        record_by_tenant <<
          "tenant_host: #{tenant.host}, " \
          "tenant_id: #{tenant.id}, " \
          "n_layout_images_destroyed: #{n_li_destroyed}, " \
          "n_text_images_destroyed: #{n_ti_destroyed}"

      end

      tot_li_destroyed += n_li_destroyed
      tot_ti_destroyed += n_ti_destroyed
    end

    report = {
      cluster: CL2_CLUSTER,
      live_run: live_run ? 'true' : 'false',
      total_layout_images_destroyed: tot_li_destroyed,
      total_text_images_destroyed: tot_ti_destroyed,
      n_by_tenant: record_by_tenant
    }

    pp report

    # Log some event details (not an error).
    # Can be removed when we have log aggregation tool that catches logs of this task
    ErrorReporter.report_msg('cl2back:clean_up_orphaned_image_records rake task', extra: report, backtrace: false)
  end
end
