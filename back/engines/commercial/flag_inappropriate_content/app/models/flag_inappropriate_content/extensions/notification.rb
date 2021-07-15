module FlagInappropriateContent
  module Extensions
    module Notification
      def self.included base
        base.class_eval do
          belongs_to :inappropriate_content_flag, class_name: 'FlagInappropriateContent::InappropriateContentFlag', optional: true
        end
      end
    end
  end
end
