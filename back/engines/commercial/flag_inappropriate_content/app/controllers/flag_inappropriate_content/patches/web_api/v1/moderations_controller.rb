module FlagInappropriateContent
  module Patches
    module WebApi
      module V1
        module ModerationsController
          def include_resources
            super + [:inappropriate_content_flag]
          end
        end
      end
    end
  end
end