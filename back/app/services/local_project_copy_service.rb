# frozen_string_literal: true

# Copies a project within a tenant.
class LocalProjectCopyService < ::ProjectCopyService
  def copy(source_project)
    copy_time = Time.now

    new_title_multiloc = add_suffix_to_title(source_project.title_multiloc)

    options = {
      local_copy: true,
      include_ideas: false,
      anonymize_users: false,
      new_title_multiloc: new_title_multiloc,
      timeline_start_at: Time.now.to_s,
      new_publication_status: 'draft'
    }

    time = Time.now
    template = export(source_project, **options)
    puts "MEASURE_COPY export: #{Time.now - time} #{__FILE__}:#{__LINE__}"
    folder_id = ProjectFolders::Folder.find(source_project.folder_id) if source_project.folder_id
    time = Time.now
    copied_project = import(template, folder: folder_id, local_copy: true)
    puts "MEASURE_COPY import: #{Time.now - time} #{__FILE__}:#{__LINE__}"

    copy_project_visibility_permission_groups(source_project, copied_project)
    copy_project_and_phases_actions_groups_permissions(source_project, copied_project)

    source_project.projects_allowed_input_topics.each { |p_a_i_t| p_a_i_t.dup.update!(project_id: copied_project.id) }
    source_project.projects_topics.each { |projects_topic| projects_topic.dup.update!(project_id: copied_project.id) }
    source_project.areas_projects.each { |areas_project| areas_project.dup.update!(project_id: copied_project.id) }
    puts "MEASURE_COPY copy: #{Time.now - copy_time} #{__FILE__}:#{__LINE__}"

    copied_project
  end

  private

  def add_suffix_to_title(multiloc)
    title_suffix_multiloc = MultilocService.new.i18n_to_multiloc('project_copy.title_suffix')
    multiloc.each { |k, v| multiloc[k] = "#{v} - #{title_suffix_multiloc[k]}" }
  end

  def copy_project_visibility_permission_groups(source_project, copied_project)
    return unless source_project.visible_to == 'groups'

    source_project.groups_projects.each { |g_p| g_p.dup.update!(project_id: copied_project.id) }
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

      permission.groups_permissions.each { |g_p| g_p.dup.update!(permission_id: copied_permission.id) }
    end
  end
end
