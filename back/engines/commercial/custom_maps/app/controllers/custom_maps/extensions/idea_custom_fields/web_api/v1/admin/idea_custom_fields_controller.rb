# frozen_string_literal: true

module CustomMaps
  module Extensions
    module IdeaCustomFields
      module WebApi
        module V1
          module Admin
            module IdeaCustomFieldsController
              def include_in_index_response
                %i[options options.image map_config]
              end
            end
          end
        end
      end
    end
  end
end
