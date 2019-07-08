module BaseImageUploader
  extend ActiveSupport::Concern

  included do
    if !Rails.env.test? && !Rails.env.development?
      storage :fog
    end
  end

  def store_dir
    tenant = Tenant.current
    "uploads/#{tenant.id}/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  unless Rails.env.test?
    def asset_host
      begin
        Tenant.current.base_backend_uri
      rescue ActiveRecord::RecordNotFound # There is no Tenant.current

        # Maybe the model we're operating on is a Tenant itself?
        if model.kind_of? Tenant
          model.base_backend_uri

        # Nope, so let's fall back to default carrierwave behavior (s3 bucket
        # in production)
        else
          super
        end
      end
    end
  end

  # We're not caching, since the external image optimization process will
  # quickly generate a new version that should replace this one asap
  def fog_attributes
    {'Cache-Control' => 'no-cache'}
  end

  # from https://github.com/carrierwaveuploader/carrierwave/wiki/how-to:-create-random-and-unique-filenames-for-all-versioned-files#unique-filenames
  def filename
    "#{secure_token}.#{file.extension}" if original_filename.present?
  end

  protected

  def secure_token
    var = :"@#{mounted_as}_secure_token"
    model.instance_variable_get(var) or model.instance_variable_set(var, SecureRandom.uuid)
  end

end
