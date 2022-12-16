# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Fix idea, initiative and default project assignees who can no longer moderate the content'
  task fix_assignees: [:environment] do
    Tenant.all.each do |tn|
      Apartment::Tenant.switch(tn.schema_name) do
        Initiative.where.not(assignee: nil)
          .where.not(assignee: UserRoleService.new.moderators_for(Initiative.new))
          .update_all(assignee_id: nil)
        Project.all.each do |project|
          if project.default_assignee && !UserRoleService.new.can_moderate_project?(project, project.default_assignee)
            project.update! default_assignee_id: nil
          end
          IdeaAssignment::IdeaAssignmentService.new.clean_assignees_for_project! project
        end
      end
    end
  end
end
