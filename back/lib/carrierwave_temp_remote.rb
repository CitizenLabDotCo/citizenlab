# frozen_string_literal: true

class CarrierwaveTempRemote
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

      version_name ? identifier.gsub(%r{/([^/]+)\Z}, "/#{version_name}_\\1") : identifier
    end

    private

    def url?(identifier)
      identifier.present? && identifier.start_with?('http')
    end

    def remote_url_field_name_to_column(remote_url_field_name)
      remote_url_field_name.to_s.gsub(/\Aremote_(.+)_url\Z/, '\\1')
    end
  end
end
