# lib/tasks/image_reprocessing.rake
namespace :single_use do
  desc "Reprocesses ALL CarrierWave versions and the original image for a given model and mounted uploader."
  task :reprocess_images, [:model_name, :uploader_mount] => :environment do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    dev_null = Logger.new('/dev/null')
    Rails.logger = dev_null
    ActiveRecord::Base.logger = dev_null

    model_name = args[:model_name]
    uploader_mount = args[:uploader_mount]

    unless model_name && uploader_mount
      puts "Usage: rake single_use:reprocess_images[ModelName,uploader_attribute]"
      puts "Example: rake single_use:reprocess_images[Product,image]"
      exit 1
    end

    model_class = model_name.constantize
    tenant_host = 'localhost' # Default to localhost for development for now
    
    puts "--- Reprocessing ALL images and versions for #{model_name} (mounted as :#{uploader_mount}) for tenant: #{tenant_host} ---"

    total_reprocessed = 0
    errored_records = []

    puts "Overriding `#{BaseImageUploader.name}#filename` to prevent renaming during reprocessing..."
    
    # --- START CORRECTED AND SIMPLIFIED OVERRIDE ---
    BaseImageUploader.class_eval do
      define_method(:filename) do
        current_db_value = model.read_attribute(self.mounted_as)

        if current_db_value.present?
          # If a file path exists in the DB, reuse its filename to ensure stability.
          return File.basename(current_db_value.to_s)
        else
          # If no existing filename is present in the DB, return nil.
          # This will cause uploader.file.present? to be false,
          # leading to skipping in the main Rake task loop.
          # We explicitly do NOT generate a new UUID here, as this task
          # is for reprocessing existing files, not creating new ones.
          return nil 
        end
      end
    end
    # --- END CORRECTED AND SIMPLIFIED OVERRIDE ---


    Apartment::Tenant.switch(tenant_host.tr('.', '_')) do
      puts "n of IdeaImages (inside tenant switch): #{model_class.count}"

      model_class.find_each do |record|
        begin
          uploader = record.send(uploader_mount)

          if uploader.present? && uploader.file.present?
            puts "  Reprocessing image for #{model_name} ID: #{record.id}..."

            uploader.cache_stored_file!
            uploader.retrieve_from_cache!(uploader.cache_name)
            uploader.recreate_versions!

            puts "  Recreated all versions and re-processed original."

            record.save!

            total_reprocessed += 1
            puts "  Successfully reprocessed image for #{model_name} ID: #{record.id}."
          else
            puts "  Skipping #{model_name} ID: #{record.id} - Uploader or file not present."
            if uploader.present? && uploader.url.present? && !uploader.file.present?
              puts "    (Note: Image URL #{uploader.url} exists in DB, but file not found by CarrierWave. Check S3 or Fog config or if file was orphaned.)"
            end
          end
        rescue CarrierWave::ProcessingError => e
          # This rescue block will catch ProcessingErrors from other parts of CarrierWave.
          errored_records << { id: record.id, error: "Processing Error: #{e.message}" }
          puts "  ERROR: Failed to process image for #{model_name} ID: #{record.id}: #{e.message}"
          ErrorReporter.report_msg(
            'Image reprocessing failed during Rake task (CarrierWave Processing Error).',
            extra: {
              model_name: model_name,
              record_id: record.id,
              uploader_mount: uploader_mount,
              tenant: tenant_host,
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
              tenant: tenant_host,
              error_message: e.message,
              backtrace: e.backtrace.first(5).join("\n")
            }
          )
        end
      end # End of model_class.find_each

      puts "\n--- Cleaning CarrierWave cached files ---"
      CarrierWave.clean_cached_files!
      puts "  CarrierWave temporary cached files cleaned."

      puts "\n--- Reprocessing Complete ---"
      puts "Total records found in database for tenant: #{model_class.count}"
      puts "Successfully reprocessed images: #{total_reprocessed}"

      if errored_records.any?
        puts "Records with errors: #{errored_records.count}"
        errored_records.each do |error_info|
          puts "  ID: #{error_info[:id]}, Error: #{error_info[:error]}"
        end
      end
    end
  end
end
