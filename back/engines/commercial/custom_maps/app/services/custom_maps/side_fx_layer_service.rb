# frozen_string_literal: true

module CustomMaps
  class SideFxLayerService < BaseSideFxService
    include SideFxHelper

    def before_create(map_config, user); end

    def before_update(map_config, user); end

    private

    def resource_name
      :layer
    end
  end
end
