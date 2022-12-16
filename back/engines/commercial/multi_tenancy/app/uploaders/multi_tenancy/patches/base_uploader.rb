# frozen_string_literal: true

module MultiTenancy
  module Patches
    module BaseUploader
      def store_dir
        tenant = Tenant.current
        "uploads/#{tenant.id}/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
      end

      unless Rails.env.test?
        def asset_host
          Tenant.current.base_backend_uri
        rescue ActiveRecord::RecordNotFound
          # No current tenant. Maybe the model we're operating on is a Tenant itself?
          if model.is_a? Tenant
            model.base_backend_uri
          else # Otherwise let's fall back on the default carrierwave behavior (S3 in production)
            # We cannot use super here because it would call the :asset_host of the prepended class, BaseUploader.
            # What we want here is to jump directly to the grandparent class (CarrierWave::Uploader::Base)
            # Inspired from: https://stackoverflow.com/a/4557614/6668254
            unbound_meth = CarrierWave::Uploader::Base.instance_method(:asset_host)
            unbound_meth.bind_call(self)
          end
        end
      end
    end
  end
end
