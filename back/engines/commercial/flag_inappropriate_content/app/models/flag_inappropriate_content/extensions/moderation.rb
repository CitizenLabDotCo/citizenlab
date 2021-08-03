module FlagInappropriateContent
  module Extensions
    module Moderation
      def self.included base
        base.class_eval do
          has_one :inappropriate_content_flag, foreign_key: :flaggable_id, class_name: 'FlagInappropriateContent::InappropriateContentFlag'
        end
      end
    end
  end
end
