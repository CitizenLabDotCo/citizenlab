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

          def index_filter
            super
            if params.include? :is_flagged
              @moderations = if ActiveModel::Type::Boolean.new.cast params[:is_flagged]
                @moderations.where(inappropriate_content_flag: FlagInappropriateContent::InappropriateContentFlag.where('deleted_at IS NULL'))
              else
                @moderations.where.not(inappropriate_content_flag: FlagInappropriateContent::InappropriateContentFlag.where('deleted_at IS NULL'))
              end
            end 
          end
        end
      end
    end
  end
end
