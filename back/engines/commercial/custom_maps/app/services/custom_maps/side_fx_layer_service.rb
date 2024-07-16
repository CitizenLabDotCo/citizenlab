# frozen_string_literal: true

module CustomMaps
  class SideFxLayerService < BaseSideFxService
    include SideFxHelper

    private

    def resource_name
      :layer
    end
  end
end
