class TenantFaviconUploader < BaseImageUploader

  def store_dir
    tenant = model # instead of Tenant.current (like in the base uploader)  bc the uploader can be used in a context
                   # where +Tenant.current+ is +nil+. But the uploader is mounted on +Tenant+ so +model+ is a tenant.
    "uploads/#{tenant.id}/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  version :large do
    process resize_to_fit: [152,152]
    process convert: :png
  end

  version :medium do
    process resize_to_fit: [32,32]
    process convert: :png
  end

  version :small do
    process resize_to_fit: [16,16]
    process convert: :png
  end

  def extension_whitelist
    %w(jpg jpeg gif png ico svg)
  end

end
