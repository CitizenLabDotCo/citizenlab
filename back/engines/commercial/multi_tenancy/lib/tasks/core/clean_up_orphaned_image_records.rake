# frozen_string_literal: true

namespace :cl2back do
  desc 'Remove image records not associated with resource or with nil value for image field'
  # Usage:
  # Dry run (no changes): cl2back:clean_up_orphaned_image_records
  # Execute (destroys records!): cl2back:clean_up_orphaned_image_records['execute']
  task :clean_up_orphaned_image_records, [:execute] => [:environment] do |_t, args|
    live_run = true if args[:execute] == 'execute'
    tot_li = 0
    tot_ti = 0
    record_by_tenant = []
    report = {}

    puts "live_run: #{live_run ? 'ture' : 'false'}"

    Tenant.switch_each do |tenant|
      puts "Processing images for tenant: #{tenant.name}"

      n_li = 0
      n_ti = 0

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

        n_li += 1
        log = layout_image_log(image, tenant)
        puts log
        report["li_#{format('%06d', tot_li + n_li)}"] = log
      end

      # text_images
      # Destroy text_image if ref not found anywhere in associated imageable record.
      TextImage.all.includes(:imageable).each do |image|
        next if image.imageable.to_json.include?(image.text_reference)

        image.destroy! if live_run

        n_ti += 1
        log = text_image_log(image, tenant)
        puts log
        report["ti_#{format('%06d', tot_ti + n_ti)}"] = log
      end

      record_by_tenant << tenant_log(tenant, n_li, n_ti) if n_ti > 0 || n_li > 0

      tot_li += n_li
      tot_ti += n_ti
    end

    digest = log_digest(live_run, tot_li, tot_ti, record_by_tenant)
    report['digest'] = digest
    pp digest

    # Log some event details (not error). Can remove when we have log aggregation tool that catches logs of this task.
    ErrorReporter.report_msg('cl2back:clean_up_orphaned_image_records rake task', extra: report, backtrace: false)
  end

  def layout_image_log(image, tenant)
    {
      destroyed_layout_image_id: image.id,
      code: image.code,
      tenant_id: tenant.id,
      host: tenant.host
    }
  end

  def text_image_log(image, tenant)
    {
      destroyed_text_image_id: image.id,
      text_reference: image.text_reference,
      imageable_id: image.imageable.id,
      tenant_id: tenant.id,
      host: tenant.host
    }
  end

  def tenant_log(tenant, n_li, n_ti)
    {
      n_layout_images_destroyed: n_li,
      n_text_images_destroyed: n_ti,
      tenant_id: tenant.id,
      tenant_host: tenant.host
    }
  end

  def log_digest(live_run, tot_li, tot_ti, record_by_tenant)
    {
      cluster: CL2_CLUSTER,
      live_run: live_run ? 'true' : 'false',
      total_layout_images_destroyed: tot_li,
      total_text_images_destroyed: tot_ti,
      n_by_tenant: record_by_tenant
    }
  end
end
