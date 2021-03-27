# frozen_string_literal: true

class BaseUploader < CarrierWave::Uploader::Base
  def self.use_fog_engine?
    return if Rails.env.test? && Rails.env.development?

    fog_credentials.present? && fog_directory
  end

  # Default storage engine is CarrierWave::Storage::File
  storage :fog if use_fog_engine?

  def store_dir
    tenant = Tenant.current
    "uploads/#{tenant.id}/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  unless Rails.env.test?
    def asset_host
      Tenant.current.base_backend_uri
    rescue ActiveRecord::RecordNotFound # There is no Tenant.current
      # Maybe the model we're operating on is a Tenant itself?
      if model.is_a? Tenant
        model.base_backend_uri

        # Nope, so let's fall back to default carrierwave behavior (s3 bucket
        # in production)
      else
        super
      end
    end
  end
end
