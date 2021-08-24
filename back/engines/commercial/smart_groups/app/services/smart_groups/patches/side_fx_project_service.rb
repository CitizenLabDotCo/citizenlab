module SmartGroups
  module Patches
    module SideFxProjectService
      def before_destroy(project, user)
        super
        groups = SmartGroups::RulesService.new.filter_by_value_references(project.id)
        groups.map(&:destroy!)
      end
    end
  end
end
