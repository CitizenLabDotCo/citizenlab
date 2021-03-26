class BaseUploader < CarrierWave::Uploader::Base

  if !Rails.env.test? && !Rails.env.development?
    storage :fog
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

end
