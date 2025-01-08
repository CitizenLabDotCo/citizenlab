# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Fix idea and default project assignees who can no longer moderate the content'
  task fix_assignees: [:environment] do
    Tenant.all.each do |tn|
      Apartment::Tenant.switch(tn.schema_name) do
        Project.all.each do |project|
          if project.default_assignee && !UserRoleService.new.can_moderate_project?(project, project.default_assignee)
            project.update! default_assignee_id: nil
          end
          IdeaAssignment::IdeaAssignmentService.new.clean_assignees_for_project! project
        end
      end
    end
  end

  desc 'Remove assignees from ideas that are survey responses'
  task remove_assignees_from_survey_responses: [:environment] do
    Tenant.all.each do |tn|
      Apartment::Tenant.switch(tn.schema_name) do
        total = Idea.all.count

        ideas = Idea.all.select do |idea|
          idea.participation_method_on_creation.instance_of?(ParticipationMethod::NativeSurvey)
        end

        ideas.each { |idea| idea.update!(assignee_id: nil, assigned_at: nil) }

        puts "#{tn.host}: Updated #{ideas.count} ideas out of #{total} total ideas"
      end
    end
  end
end
