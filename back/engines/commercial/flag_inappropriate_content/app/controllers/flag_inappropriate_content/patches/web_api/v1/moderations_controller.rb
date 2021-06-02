module FlagInappropriateContent
  module Patches
    module WebApi
      module V1
        module ModerationsController
          def include_load_resources
            # include spam reports to compute the reason code
            super + [inappropriate_content_flag: [flaggable: [:spam_reports]]]
          end

          def include_serialize_resources
            super + [:inappropriate_content_flag]
          end
        end
      end
    end
  end
end
