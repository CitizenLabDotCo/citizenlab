# frozen_string_literal: true

# Layout images used to be stored as uploaded, often straight from a camera (5000px+ wide,
# several MB). This shrinks each stored image to ContentBuilder::LayoutImageUploader::MAX_SIZE,
# as new uploads are.
#
# Files keep their names, so records and layouts that point to them keep working. Images that
# already fit are stored again unchanged.
#
#     rake single_use:reprocess_layout_images                     # dry run, all tenants
#     rake 'single_use:reprocess_layout_images[execute]'          # reprocess, all tenants
#     rake 'single_use:reprocess_layout_images[execute,foo.com]'  # reprocess, one tenant
namespace :single_use do
  desc "Shrink layout images larger than the maximum size. Dry run unless passed 'execute'."
  task :reprocess_layout_images, %i[execute host] => [:environment] do |_t, args|
    TenantScript.run(
      'reprocess_layout_images',
      args: args,
      description: 'shrinking layout images'
    ) do |tenant, script|
      ContentBuilder::LayoutImage.where.not(image: nil).find_each do |layout_image|
        identifier = layout_image.read_attribute(:image)
        script.reporter.add_change(identifier, identifier, context: { tenant: tenant.host, layout_image_id: layout_image.id })
        next if script.dry_run?

        # BaseImageUploader names new files after a token kept on the model. Setting it to the
        # current name stores the image where the record already points.
        layout_image.instance_variable_set(:@image_secure_token, File.basename(identifier, '.*'))

        # Caching the stored file is what runs the processing.
        uploader = layout_image.image
        uploader.cache_stored_file!
        uploader.retrieve_from_cache!(uploader.cache_name)
        uploader.store!(uploader.file)
      rescue StandardError => e
        script.reporter.add_error("#{e.class}: #{e.message}", context: { tenant: tenant.host, layout_image_id: layout_image.id })
      end
    end
  end
end
