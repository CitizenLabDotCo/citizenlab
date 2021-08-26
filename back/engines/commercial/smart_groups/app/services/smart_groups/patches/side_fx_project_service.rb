module SmartGroups
  module Patches
    module SideFxProjectService
      def before_destroy(project, user)
        super
        SmartGroups::RulesService.new.filter_by_value_references(project.id).each(&:destroy!)
      end
    end
  end
end
