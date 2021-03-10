module SmartGroups
  module Patches
    module SideFxProjectService
      def before_destroy(project, user)
        super
        SmartGroupsService.new.filter_by_rule_value(Group.all, project.id).destroy_all
      end
    end
  end
end
