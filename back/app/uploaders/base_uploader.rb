# frozen_string_literal: true

class BaseUploader < CarrierWave::Uploader::Base
  def self.use_fog_engine?
    return false if Rails.env.test?
    return true if Rails.env.development? && ENV['USE_AWS_S3_IN_DEV'] == 'true'

    fog_credentials.present? && fog_directory
  end

  # Default storage engine is CarrierWave::Storage::File
  storage :fog if use_fog_engine?

  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  unless Rails.env.test?
    def asset_host
      AppConfiguration.instance.base_asset_host_uri
    end
  end
end

BaseUploader.prepend_if_ee('MultiTenancy::Patches::BaseUploader')
