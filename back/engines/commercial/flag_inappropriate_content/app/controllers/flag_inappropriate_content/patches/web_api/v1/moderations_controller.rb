# frozen_string_literal: true

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
            return unless params.include? :is_flagged

            @moderations = if ActiveModel::Type::Boolean.new.cast params[:is_flagged]
              @moderations.where(inappropriate_content_flag: FlagInappropriateContent::InappropriateContentFlag.where(deleted_at: nil))
            else
              @moderations.where.not(inappropriate_content_flag: FlagInappropriateContent::InappropriateContentFlag.where(deleted_at: nil))
            end
          end
        end
      end
    end
  end
end
