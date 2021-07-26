module FlagInappropriateContent
  module Extensions
    module Moderation
      def self.included base
        base.class_eval do
          has_one :inappropriate_content_flag, foreign_key: :flaggable_id, foreign_type: :flaggable_type, as: :flaggable, class_name: 'FlagInappropriateContent::InappropriateContentFlag'
        end
      end
    end
  end
end
