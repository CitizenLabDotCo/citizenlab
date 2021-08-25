module SmartGroups
  module Patches
    module SideFxAreaService
      def before_destroy(area, user)
        super
        SmartGroups::RulesService.new.filter_by_value_references(area.id).each(&:destroy!)
      end
    end
  end
end
