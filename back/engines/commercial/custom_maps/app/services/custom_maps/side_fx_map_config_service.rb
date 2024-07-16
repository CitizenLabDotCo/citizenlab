# frozen_string_literal: true

module CustomMaps
  class SideFxMapConfigService < BaseSideFxService
    include SideFxHelper

    def after_destroy(frozen_resource, user)
      serialized_resource = clean_time_attributes(frozen_resource.attributes)
      clean_rgeo_attributes(serialized_resource)

      LogActivityJob.perform_later(
        encode_frozen_resource(frozen_resource),
        'deleted', user, Time.now.to_i,
        payload: { resource_name => serialized_resource }
      )
    end

    private

    def clean_rgeo_attributes(serialized_resource)
      serialized_resource.each do |k, v|
        next unless v.is_a?(RGeo::Geographic::SphericalPointImpl)

        serialized_resource[k] = { 'longitude' => v.x, 'latitude' => v.y }
      end
    end

    def resource_name
      :map_config
    end
  end
end
