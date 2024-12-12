# frozen_string_literal: true

# This task should be used if partial data has been restored to a schema from a backup DB
# to renable the S3 file assets that were flagged as deleted when the data was deleted.
# Currently only restores assets associated with Ideas (IdeaImage, IdeaFile, TextImage).

namespace :fix_existing_tenants do
  desc 'If ideas have been manually restored from backup - restore any deleted images.'
  task :restore_s3_objects, [:schema] => [:environment] do |_t, args|
    schema = args[:schema]
    unless schema
      puts 'Please provide a tenant schema name to restore the images for.'
      exit
    end

    Apartment::Tenant.switch(schema) do
      Rails.logger.info "STARTED: Finding delete markers for #{schema}"
      bucket = ENV.fetch('AWS_S3_BUCKET')
      s3_client = Aws::S3::Client.new

      Rails.logger.info 'CHECKING: IdeaImage'
      IdeaImage.find_each do |idea_image|
        remove_s3_delete_marker(s3_client, bucket, idea_image.image.path)
        idea_image.image.versions.map { |_k, v| v.path }.each do |prefix|
          remove_s3_delete_marker(s3_client, bucket, prefix)
        end
      end

      Rails.logger.info 'CHECKING: IdeaFile'
      IdeaFile.find_each do |idea_file|
        remove_s3_delete_marker(s3_client, bucket, idea_file.file.path)
      end

      Rails.logger.info 'CHECKING: TextImage'
      TextImage.where(imageable_type: 'Idea').find_each do |text_image|
        remove_s3_delete_marker(s3_client, bucket, text_image.image.path)
      end
    end

    Rails.logger.info "FINISHED: Delete markers removed for #{schema}"
  end
end

def remove_s3_delete_marker(s3_client, bucket, prefix)
  delete_marker = s3_client.list_object_versions(bucket: bucket, prefix: prefix).delete_markers.find(&:is_latest)
  if delete_marker
    s3_client.delete_object(bucket: bucket, key: prefix, version_id: delete_marker.version_id)
    Rails.logger.info "REMOVED: Delete marker for #{prefix}"
  end
end
