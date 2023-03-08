# frozen_string_literal: true

namespace :cl2back do
  desc 'Remove image records not associated with resource or with nil value for image field'
  # Usage:
  # Dry run (no changes): rake cl2back:clean_up_orphaned_image_records
  # Execute (destroys records!): rake cl2back:clean_up_orphaned_image_records['execute']
  task :clean_up_orphaned_image_records, [:execute] => [:environment] do |_t, args|
    live_run = true if args[:execute] == 'execute'
    @total_li_destroyed = 0
    @total_ti_destroyed = 0
    @report = {}
    record_by_tenant = []

    Rails.logger.info("#{log_prefix}live_run: #{live_run ? 'true' : 'false'}")

    Tenant.switch_each do |tenant|
      Rails.logger.info("#{log_prefix}Processing images for tenant: #{tenant.name}")

      @n_li_destroyed = 0
      @n_ti_destroyed = 0

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
        add_layout_image_log_to_report(image, tenant)
      end

      # text_images
      # Destroy text_image if ref not found anywhere in the associated imageable record's imageable_field.
      TextImage.all.includes(:imageable).each do |image|
        next if image.imageable.instance_eval(image.imageable_field).to_json.include?(image.text_reference)

        image.destroy! if live_run
        add_text_image_log_to_report(image, tenant)
      end

      record_by_tenant << tenant_log(tenant) if @n_ti_destroyed > 0 || @n_li_destroyed > 0

      @total_li_destroyed += @n_li_destroyed
      @total_ti_destroyed += @n_ti_destroyed
    end

    digest = digest_log(live_run, record_by_tenant)
    @report['digest'] = digest
    Rails.logger.info("#{log_prefix}#{digest.to_yaml}")

    # Log some event details (not error). Can remove when we have log aggregation tool that catches logs of this task.
    ErrorReporter.report_msg('cl2back:clean_up_orphaned_image_records rake task', extra: @report, backtrace: false)
  end

  def log_prefix
    "task :clean_up_orphaned_image_records\n"
  end

  def add_layout_image_log_to_report(image, tenant)
    @n_li_destroyed += 1
    log = layout_image_log(image, tenant)
    Rails.logger.info("#{log_prefix}#{log.to_yaml}")
    @report["li_#{format('%06d', @total_li_destroyed + @n_li_destroyed)}"] = log
  end

  def add_text_image_log_to_report(image, tenant)
    @n_ti_destroyed += 1
    log = text_image_log(image, tenant)
    Rails.logger.info("#{log_prefix}#{log.to_yaml}")
    @report["ti_#{format('%06d', @total_ti_destroyed + @n_ti_destroyed)}"] = log
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

  def tenant_log(tenant)
    {
      n_layout_images_destroyed: @n_li_destroyed,
      n_text_images_destroyed: @n_ti_destroyed,
      tenant_id: tenant.id,
      tenant_host: tenant.host
    }
  end

  def digest_log(live_run, record_by_tenant)
    {
      cluster: CL2_CLUSTER,
      live_run: live_run ? 'true' : 'false',
      total_layout_images_destroyed: @total_li_destroyed,
      total_text_images_destroyed: @total_ti_destroyed,
      n_by_tenant: record_by_tenant
    }
  end
end
