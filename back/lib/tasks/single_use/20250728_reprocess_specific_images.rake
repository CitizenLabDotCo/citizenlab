# lib/tasks/image_reprocessing.rake
namespace :single_use do
  desc 'Reprocesses ALL CarrierWave versions and the original image for a given model and mounted uploader.'
  task :reprocess_images, %i[host] => :environment do |_t, args|
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    puts "Overriding `#{BaseImageUploader.name}#filename` to prevent renaming during reprocessing..."

    BaseImageUploader.class_eval do
      define_method(:filename) do
        current_db_value = model.read_attribute(mounted_as)

        if current_db_value.present?
          File.basename(current_db_value.to_s)
        end
      end
    end

    def reprocess_images(records, uploader_mount, model_name, tenant_host_for_logs)
      total_reprocessed = 0
      errored_records = []

      records.each do |record|
        uploader = record.send(uploader_mount)

        if uploader.present? && uploader.file.present?
          puts "  Reprocessing image for #{model_name} ID: #{record.id}..."

          uploader.cache_stored_file!
          uploader.retrieve_from_cache!(uploader.cache_name)
          uploader.recreate_versions!

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
      rescue CarrierWave::ProcessingError => e
        errored_records << { id: record.id, error: "Processing Error: #{e.message}" }
        puts "  ERROR: Failed to process image for #{model_name} ID: #{record.id}: #{e.message}"
        ErrorReporter.report_msg(
          'Image reprocessing failed during Rake task (CarrierWave Processing Error).',
          extra: {
            model_name: model_name,
            record_id: record.id,
            uploader_mount: uploader_mount,
            tenant: tenant_host_for_logs,
            error_message: e.message,
            backtrace: e.backtrace.first(5).join("\n")
          }
        )
      rescue StandardError => e
        errored_records << { id: record.id, error: e.message }
        puts "  ERROR: Failed to process image for #{model_name} ID: #{record.id}: #{e.message}"
        ErrorReporter.report_msg(
          'Image reprocessing failed during Rake task (General Error).',
          extra: {
            model_name: model_name,
            record_id: record.id,
            uploader_mount: uploader_mount,
            tenant: tenant_host_for_logs,
            error_message: e.message,
            backtrace: e.backtrace.first(5).join("\n")
          }
        )
      end

      # Clear cache every 10 images
      if (total_reprocessed % 10).zero? && total_reprocessed > 0
        CarrierWave.clean_cached_files!
        puts "  [Batch Complete] Cleared CarrierWave cache after #{total_reprocessed} images."
      end
    end

    puts "\n--- Cleaning CarrierWave cached files ---"
    CarrierWave.clean_cached_files!
    puts '  CarrierWave temporary cached files cleaned.'

    puts "\n--- Reprocessing Complete ---"
    puts "Successfully reprocessed images: #{total_reprocessed}"

    if errored_records.any?
      puts "Records with errors: #{errored_records.count}"
      errored_records.each do |error_info|
        puts "  ID: #{error_info[:id]}, Error: #{error_info[:error]}"
      end
    end

    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      records = IdeaImage.all
      puts "Found #{records.count} idea_images records to process."

      reprocess_images(records, :image, 'IdeaImage', tenant_host)

      records = TextImage.where(imageable_type: 'Idea')
      puts "Found #{records.count} text_images records to process."

      reprocess_images(records, :image, 'TextImage', tenant_host)
    end
  end
end
