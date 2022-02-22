module CustomMaps
  module WebApi
    module V1
      class LegendItemSerializer
        include FastJsonapi::ObjectSerializer
        attributes :title_multiloc, :color
      end
    end
  end
end
