# frozen_string_literal: true

module Insights
  module Patches
    module Project
      def self.included(base)
        base.class_eval do
          has_many(
            :insights_data_sources,
            class_name: 'Insights::DataSource',
            foreign_key: :origin_id
          )

          after_destroy :destroy_insights_views
        end
      end

      def destroy_insights_views
        insights_data_sources.includes(:view).each do |data_source|
          data_source.view&.destroy
        end
      end
    end
  end
end
