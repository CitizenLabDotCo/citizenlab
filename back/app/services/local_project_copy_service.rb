# frozen_string_literal: true

# Copies a project within a tenant.
class LocalProjectCopyService
  def copy(source_project)
    new_title_multiloc = add_suffix_to_title(source_project.title_multiloc)

    options = {
      local_copy: true,
      include_ideas: false,
      anonymize_users: false,
      new_title_multiloc: new_title_multiloc,
      timeline_start_at: Time.now.to_s,
      new_publication_status: 'draft'
    }

    template = AdminApi::ProjectCopyService.new.export source_project, **options
    folder_id = ProjectFolders::Folder.find(source_project.folder_id) if source_project.folder_id
    copied_project = AdminApi::ProjectCopyService.new.import(template, folder: folder_id, local_copy: true)

    copy_project_visibility_permission_groups(source_project, copied_project)

    # Copy actions groups_permissions of project or project phases. For example, groups that can 'Vote on ideas'.
    copy_project_and_phases_actions_groups_permissions(source_project, copied_project)

    source_project.allowed_input_topics.each do |topic|
      input_topic = ProjectsAllowedInputTopic.find_by(topic_id: topic.id)
      ProjectsAllowedInputTopic.create(project_id: copied_project.id, topic_id: topic.id, ordering: input_topic.ordering)
    end
    source_project.topics.each { |topic| ProjectsTopic.create(project_id: copied_project.id, topic_id: topic.id) }
    source_project.areas.each { |area| AreasProject.create(project_id: copied_project.id, area_id: area.id) }

    copied_project
  end

  private

  def add_suffix_to_title(multiloc)
    title_suffix_multiloc = MultilocService.new.i18n_to_multiloc('project_copy.title_suffix')
    multiloc.each { |k, v| multiloc[k] = "#{v} - #{title_suffix_multiloc[k]}" }
  end

  def copy_project_visibility_permission_groups(source_project, copied_project)
    return unless source_project.visible_to == 'groups'

    GroupsProject.where(project_id: source_project.id).each do |record|
      GroupsProject.create(project_id: copied_project.id, group_id: record.group_id)
    end
  end

  def copy_project_and_phases_actions_groups_permissions(source_project, copied_project)
    # Copy actions groups_permissions of continuous project. For example, groups that can 'Vote on ideas'.
    copy_actions_groups_permissions(source_project, copied_project)

    # Copy actions groups_permissions of phases of timeline project. For example, groups that can 'Vote on ideas'.
    source_phases = source_project.phases.order(:start_at)
    copied_phases = copied_project.phases.order(:start_at)

    source_phases.each_with_index do |phase, index|
      copy_actions_groups_permissions(phase, copied_phases[index])
    end
  end

  def copy_actions_groups_permissions(source_object, copied_object)
    source_object.permissions.each do |permission|
      next unless permission.permitted_by == 'groups'

      copied_permission = copied_object.permissions.where(action: permission.action).first
      next unless copied_permission

      permission.groups.each do |group|
        GroupsPermission.create(permission_id: copied_permission.id, group_id: group.id)
      end
    end
  end
end
