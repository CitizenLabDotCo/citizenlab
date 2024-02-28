# frozen_string_literal: true

module CustomMaps
  class SideFxMapConfigService < BaseSideFxService
    include SideFxHelper

    def before_create(area, user); end

    def before_update(area, user); end

    private

    def resource_name
      :map_config
    end
  end
end
