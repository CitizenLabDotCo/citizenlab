namespace :single_use do
  # Reprocesses citizen images, to ensure the relatively new metadata stripping is
  # applied. Primarily for use with the Vienna tenant, but tenant is selectable
  # to enable testing on a demo.
  # Reprocesses user avatars, idea_images, and Idea text_images.
  # Optionally, a date can be specified to only reprocess images updated before that date.
  # If no date is specified, it defaults to tomorrow's date, effectively giving no cutoff.
  # Usage: `rake single_use:reprocess_citizen_images[host,date]`
  # Example: `rake single_use:reprocess_citizen_images[simonssandbox.govocal.com,'2023-07-01']`
  desc 'Reprocesses ALL CarrierWave versions and the original image for specific models and mounted uploader.'
  task :reprocess_citizen_images, %i[host date] => :environment do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    tenant_host = args[:host]
    cutoff_date = args[:date] ? Date.parse(args[:date]) : Time.zone.today + 1.day

    puts "date: #{cutoff_date.inspect}"

    puts "Overriding `#{BaseImageUploader.name}#filename` to prevent renaming during reprocessing..."

    BaseImageUploader.class_eval do
      define_method(:filename) do
        current_db_value = model.read_attribute(mounted_as)

        if current_db_value.present?
          File.basename(current_db_value.to_s)
        end
      end
    end

    def reprocess_images(records, uploader_mount, model_name, tenant_host)
      total_reprocessed = 0
      errored_records = []

      records.each do |record|
        uploader = record.send(uploader_mount)

        if uploader.present? && uploader.file.present?
          puts "  Reprocessing image for #{model_name} ID: #{record.id}..."

          uploader.cache_stored_file!
          uploader.retrieve_from_cache!(uploader.cache_name)
          uploader.store!(uploader.file)

          puts '  Recreated all versions and re-processed original.'

          record.save!

          total_reprocessed += 1
          puts "  Successfully reprocessed image for #{model_name} ID: #{record.id}."
        else
          puts "  Skipping #{model_name} ID: #{record.id} - Uploader or file not present."
          if uploader.present? && uploader.url.present? && uploader.file.blank?
            puts "    (Note: Image URL #{uploader.url} exists in DB, but file not not found by CarrierWave. Check S3 or Fog config or if file was orphaned.)"
          end
        end
      rescue StandardError => e
        errored_records << { id: record.id, error: e.message, error_class: e.class.name }
        puts "  ERROR: Failed to process image for #{model_name} ID: #{record.id}: #{e.message}"

        ErrorReporter.report_msg(
          'Image reprocessing failed during Rake task',
          extra: {
            model_name: model_name,
            record_id: record.id,
            uploader_mount: uploader_mount,
            tenant: tenant_host,
            error_message: e.message,
            error_class: e.class.name
          }
        )
      end

      CarrierWave.clean_cached_files!
      puts "  [Batch Complete] Cleared CarrierWave cache after #{total_reprocessed} images."

      puts "\n--- Reprocessing Complete ---"
      puts "Successfully reprocessed images: #{total_reprocessed}"

      if errored_records.any?
        puts "Records with errors: #{errored_records.count}"
        errored_records.each do |error_info|
          puts "  ID: #{error_info[:id]}, Error: #{error_info[:error]}"
        end
      end
    end

    Apartment::Tenant.switch(tenant_host.tr('.', '_')) do
      # Process IdeaImage records
      records = IdeaImage.where(updated_at: ...cutoff_date)
      puts "Found #{records.count} idea_images records to process."

      reprocess_images(records, :image, 'IdeaImage', tenant_host)

      # Process TextImage records
      records = TextImage.where(imageable_type: 'Idea').where(updated_at: ...cutoff_date)
      puts "Found #{records.count} text_images records to process."

      reprocess_images(records, :image, 'TextImage', tenant_host)

      # Process User records
      records = User.where.not(avatar: nil).where(updated_at: ...cutoff_date)
      puts "Found #{records.count} user records to process."

      reprocess_images(records, :avatar, 'User', tenant_host)
    end

    puts "\n--- Cleaning CarrierWave cached files ---"
    CarrierWave.clean_cached_files!
    puts '  CarrierWave temporary cached files cleaned.'
  end
end
