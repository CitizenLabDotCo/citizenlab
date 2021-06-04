# frozen_string_literal: true

module Insights
  module Concerns
    module Input
      def self.included(base)
        base.class_eval do
          has_many(
            :insights_category_assignments,
            class_name: 'Insights::CategoryAssignment',
            foreign_key: 'input',
            dependent: :destroy
          )
        end
      end
    end
  end
end
