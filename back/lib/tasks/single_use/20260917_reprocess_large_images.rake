# frozen_string_literal: true

# Layout images and text images (the images in rich text) used to be stored as uploaded, often
# straight from a camera (5000px+ wide, several MB). This shrinks each stored image to
# BaseImageUploader::MAX_SIZE, as new uploads are.
#
# Files keep their names, so records, layouts and rich text that point to them keep working.
# Images that already fit are left alone, and only the ones that will shrink are reported.
#
#     rake single_use:reprocess_large_images                     # dry run, all tenants
#     rake 'single_use:reprocess_large_images[execute]'          # reprocess, all tenants
#     rake 'single_use:reprocess_large_images[execute,foo.com]'  # reprocess, one tenant
namespace :single_use do
  desc "Shrink layout and text images larger than the maximum size. Dry run unless passed 'execute'."
  task :reprocess_large_images, %i[execute host] => [:environment] do |_t, args|
    TenantScript.run(
      'reprocess_large_images',
      args: args,
      description: 'shrinking layout and text images'
    ) do |tenant, script|
      max_size = BaseImageUploader::MAX_SIZE

      [ContentBuilder::LayoutImage, TextImage].each do |model_class|
        model_class.where.not(image: nil).find_each do |record|
          context = { tenant: tenant.host, model: model_class.name, id: record.id }
          identifier = record.read_attribute(:image)
          # A project copy still in progress holds the source image's URL, not a stored file.
          next if CarrierwaveTempRemote.url?(identifier)
          next if File.extname(identifier).casecmp?('.svg')

          uploader = record.image
          image = MiniMagick::Image.read(uploader.file.read)
          width, height = image.dimensions
          next if width <= max_size && height <= max_size

          script.reporter.add_change(identifier, identifier, context: context.merge(width: width, height: height))
          next if script.dry_run?

          # BaseImageUploader names new files after a token kept on the model. Setting it to the
          # current name stores the image where the record already points.
          record.instance_variable_set(:@image_secure_token, File.basename(identifier, '.*'))

          # Caching the stored file is what runs the processing.
          uploader.cache_stored_file!
          uploader.retrieve_from_cache!(uploader.cache_name)
          uploader.store!(uploader.file)
        rescue StandardError => e
          script.reporter.add_error("#{e.class}: #{e.message}", context: context)
        ensure
          # MiniMagick leaves its tempfile for the garbage collector, and these can be several MB each.
          image&.destroy!
        end
      end
    end
  end
end
