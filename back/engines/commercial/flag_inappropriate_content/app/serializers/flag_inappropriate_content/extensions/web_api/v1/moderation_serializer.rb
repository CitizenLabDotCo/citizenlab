module FlagInappropriateContent
  module Extensions
    module WebApi
      module V1
        module ModerationSerializer
          def self.included base
            base.class_eval do
              has_one :inappropriate_content_flag, if: Proc.new { |record| 
                record.inappropriate_content_flag.present?
              }, serializer: FlagInappropriateContent::WebApi::V1::InappropriateContentFlagSerializer
            end
          end
        end
      end
    end
  end
end
