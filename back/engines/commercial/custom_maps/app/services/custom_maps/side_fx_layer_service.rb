# frozen_string_literal: true

module CustomMaps
  class SideFxLayerService < BaseSideFxService
    include SideFxHelper

    def before_create(_layer, _user); end

    def before_update(_layer, _user); end

    def before_destroy(_layer, _user); end

    private

    def resource_name
      :layer
    end
  end
end
