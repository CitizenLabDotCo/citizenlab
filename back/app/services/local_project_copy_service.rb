# frozen_string_literal: true

# Copies a project within a tenant.
class LocalProjectCopyService < ProjectCopyService
  # Copying a large project can take a while. Waiting for another copy longer
  # than this would push the request past the 30s request timeout.
  SLUG_LOCK_TIMEOUT = 10.seconds

  def copy(source_project, dest_folder: source_project.folder)
    new_title_multiloc = add_suffix_to_title(source_project.title_multiloc)

    # The copy's slug is picked from its title when the project is saved, but
    # only the commit reserves it. Copies with the same title running at the
    # same time (a double click, or two projects with the same title) would
    # otherwise pick the same slug.
    lock_name = "project_slug/#{base_slug(new_title_multiloc)}"
    CitizenLab::LockManager.with_transaction_lock(lock_name, timeout: SLUG_LOCK_TIMEOUT) do
      copy_project(source_project, dest_folder, new_title_multiloc)
    end
  end

  private

  def copy_project(source_project, dest_folder, new_title_multiloc)
    options = {
      local_copy: true,
      include_ideas: false,
      anonymize_users: false,
      new_title_multiloc: new_title_multiloc,
      timeline_start_at: Time.now.to_s,
      new_publication_status: 'draft'
    }

    template = export(source_project, **options)
    copied_project = import(template, folder: dest_folder, local_copy: true)

    copy_project_visibility_permission_groups(source_project, copied_project)
    copy_project_and_phases_actions_groups_permissions(source_project, copied_project)

    source_project.projects_global_topics.each { |projects_global_topic| projects_global_topic.dup.update!(project_id: copied_project.id) }
    source_project.areas_projects.each { |areas_project| areas_project.dup.update!(project_id: copied_project.id) }

    copied_project
  end

  def base_slug(title_multiloc)
    SlugService.new.slugify(Project.slug_from.call(Project.new(title_multiloc: title_multiloc)))
  end

  def add_suffix_to_title(multiloc)
    title_suffix_multiloc = MultilocService.new.i18n_to_multiloc('project_copy.title_suffix')
    multiloc.each { |k, v| multiloc[k] = "#{v} - #{title_suffix_multiloc[k]}" }
  end

  def copy_project_visibility_permission_groups(source_project, copied_project)
    return unless source_project.visible_to == 'groups'

    source_project.groups_projects.each { |g_p| g_p.dup.update!(project_id: copied_project.id) }
  end

  def copy_project_and_phases_actions_groups_permissions(source_project, copied_project)
    # Copy actions groups_permissions of project phases. For example, groups that can 'React to ideas'.
    source_phases = source_project.phases.order(:start_at)
    copied_phases = copied_project.phases.order(:start_at)

    source_phases.each_with_index do |phase, index|
      copy_actions_groups_permissions(phase, copied_phases[index])
    end
  end

  def copy_actions_groups_permissions(phase, copied_object)
    phase.permissions.each do |permission|
      copied_permission = copied_object.permissions.where(action: permission.action).first
      next unless copied_permission

      permission.groups_permissions.each { |g_p| g_p.dup.update!(permission_id: copied_permission.id) }
    end
  end
end
