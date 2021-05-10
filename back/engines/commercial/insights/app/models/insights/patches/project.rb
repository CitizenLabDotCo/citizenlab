# frozen_string_literal: true

module Insights
  module Patches
    module Project
      def self.included(base)
        base.class_eval do
          has_many :views, class_name: 'Insights::View', foreign_key: :scope_id, dependent: :destroy
        end
      end
    end
  end
end
