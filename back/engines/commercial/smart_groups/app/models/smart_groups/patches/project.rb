# frozen_string_literal: true

module SmartGroups
  module Patches
    module Project
      extend ActiveSupport::Concern

      included do
        before_destroy :remove_rules
      end

      def remove_rules
        SmartGroups::RulesService.new.filter_by_value_references(id).each(&:destroy!)
      end
    end
  end
end
