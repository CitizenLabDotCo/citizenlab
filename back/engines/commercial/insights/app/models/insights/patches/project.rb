# frozen_string_literal: true

module Insights
  module Patches
    module Project
      def self.included(base)
        base.class_eval do
          has_many :insights_data_sources, class_name: 'Insights::DataSource', foreign_key: :origin_id, dependent: :destroy
        end
      end
    end
  end
end
