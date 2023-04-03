# frozen_string_literal: true

class CarrierwaveTempRemote
  # In some cases, we need to save many images from URLs in a destination model
  # (e.g., save Text, Layout, Cause and other uploaded to S3 images copying a project).
  # It may take a lot of time because it needs to download, process (create versions), and upload each image.
  # This work can be moved to a background job, but it means that the destination model will be unusable until all the jobs are done.
  # For good UX, we would need to explain it to users and notify them when the jobs are done.
  #
  # This module offers a solution for this problem.
  # When we copy a project:
  # 1. Raw image URLs from the source project are stored in the destination project
  #    without downloading and processing images. See `save_urls`.
  # 2. If a user tries to access the destination project, they will get the original image URLs. See `url`.
  # 3. In the background, images from URLs in the destination project are downloaded, processed and new image
  #    files are saved in the destination project . See `save_files!`.
  #
  # So, copying works quickly and the destination project is usable immediately.

  REMOTE_URL_REGEX = /\Aremote_(.+)_url\Z/

  class << self
    def save_urls(model, image_assignments)
      columns = image_assignments.transform_keys { |field_name| remote_url_field_name_to_column(field_name) }
      model.update_columns(columns)
      SaveTempRemoteFileJob.perform_later(model, image_assignments.keys)
    end

    def save_files!(model, remote_url_field_names)
      remote_url_field_names.each do |remote_url_field_name|
        column = remote_url_field_name_to_column(remote_url_field_name)
        next unless url?(model[column])

        model.public_send("#{remote_url_field_name}=", model[column])
      end
      model.save!
    end

    def url(identifier, version_name)
      return unless url?(identifier)

      version_name.present? ? identifier.gsub(%r{/([^/]+)\Z}, "/#{version_name}_\\1") : identifier
    end

    private

    def url?(identifier)
      identifier.present? && identifier.start_with?('http')
    end

    def remote_url_field_name_to_column(remote_url_field_name)
      raise ArgumentError unless remote_url_field_name.to_s.match?(REMOTE_URL_REGEX)

      remote_url_field_name.to_s.gsub(REMOTE_URL_REGEX, '\\1')
    end
  end
end
