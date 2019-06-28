module BaseFileUploader
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
      Tenant.current.base_backend_uri
    end
  end

  def fog_attributes
    # Deleting consecutive whitespaces in filename because of
    # https://github.com/fog/fog-aws/issues/160
    {"Content-Disposition" => "attachment; filename=\"#{model.name.strip.gsub(/\s+/, ' ')}\""}
  end

end
