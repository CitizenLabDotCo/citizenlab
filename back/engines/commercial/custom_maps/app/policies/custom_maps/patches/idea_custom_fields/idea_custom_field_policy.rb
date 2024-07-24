module CustomMaps
  module Patches
    module IdeaCustomFields
      module IdeaCustomFieldPolicy
        def as_geojson?
          update_all?
        end
      end
    end
  end
end
