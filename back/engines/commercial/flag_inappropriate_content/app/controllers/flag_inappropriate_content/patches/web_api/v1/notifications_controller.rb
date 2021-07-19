module FlagInappropriateContent
  module Patches
    module WebApi
      module V1
        module NotificationsController
          def include_load_resources
            super + [inappropriate_content_flag: [:flaggable]]
          end
        end
      end
    end
  end
end
