# frozen_string_literal: true

class BaseUploader < CarrierWave::Uploader::Base
  class << self
    def use_fog_engine?
      return false if Rails.env.test?
      return false if Rails.env.development? && ENV['USE_AWS_S3_IN_DEV'] != 'true'

      !!(fog_credentials.present? && fog_directory)
    end

    def sign_urls?
      # We don't sign URLs in the local environment because we don't use CloudFront,
      # even when using the fog engine (we connect to S3 directly).
      use_fog_engine? && !Rails.env.local? && cloudfront_url_signer
    end

    def cloudfront_url_signer
      @cloudfront_url_signer ||= begin
        CitizenLab::CloudfrontUrlSigner.new
      rescue CitizenLab::CloudfrontUrlSigner::MissingConfigurationError
        nil
      end
    end

    def sign_url(url)
      return url if url.blank?

      cloudfront_url_signer.sign_url(url)
    end
  end

  # Default storage engine is CarrierWave::Storage::File
  storage :fog if use_fog_engine?

  def full_url
    self.class.use_fog_engine? ? url : path
  end

  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  if sign_urls?
    def url(...)
      original_url = super
      self.class.sign_url(original_url)
    end
  end

  unless Rails.env.test?
    def asset_host
      AppConfiguration.instance.base_asset_host_uri
    end
  end
end

BaseUploader.prepend(MultiTenancy::Patches::BaseUploader)
