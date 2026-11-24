# frozen_string_literal: true

module ProjectFolders
  class SideFxProjectFolderService
    include SideFxHelper

    def after_create(folder, user)
      LogActivityJob.perform_later(
        folder,
        'created',
        user,
        folder.created_at.to_i,
        payload: { project_folder: clean_time_attributes(folder.attributes) }
      )
    end

    def before_update(_folder, _user); end

    def before_destroy(_folder, _user); end

    def after_update(folder, user)
      change = folder.saved_changes

      move_projects_to_folder_space(folder, user) if folder.space_id_previously_changed?

      payload = { project_folder: clean_time_attributes(folder.attributes) }
      payload[:change] = sanitize_change(change) if change.present?

      LogActivityJob.perform_later(folder, 'changed', user, folder.updated_at.to_i, payload: payload)
      enqueue_scheduled_transition(folder.admin_publication)
    end

    def after_destroy(frozen_folder, user)
      ContentBuilder::LayoutService.new.clean_layouts_when_publication_deleted(frozen_folder)

      serialized_folder = clean_time_attributes(frozen_folder.attributes)

      LogActivityJob.perform_later(
        encode_frozen_resource(frozen_folder), 'deleted',
        user, Time.now.to_i,
        payload: { project_folder: serialized_folder }
      )
    end

    private

    # Skips the projects' validations: a project that is invalid for another
    # reason would stay in the old space, and then fail to save ever after,
    # because its space no longer matches its folder's.
    def move_projects_to_folder_space(folder, user)
      old_space_ids = folder.projects
        .where('projects.space_id IS DISTINCT FROM ?', folder.space_id)
        .pluck(:id, :space_id).to_h
      moved_projects = Project.where(id: old_space_ids.keys)
      moved_projects.update_all(space_id: folder.space_id, updated_at: Time.current)

      moved_projects.each do |project|
        payload = {
          project: clean_time_attributes(project.attributes),
          change: { 'space_id' => [old_space_ids[project.id], folder.space_id] }
        }
        LogActivityJob.perform_later(project, 'changed', user, project.updated_at.to_i, payload: payload)
      end
    end

    def enqueue_scheduled_transition(admin_pub)
      return unless admin_pub.saved_change_to_scheduled_at?
      return if admin_pub.scheduled_at.blank?

      ProcessScheduledPublicationTransitionsJob
        .set(wait_until: admin_pub.scheduled_at)
        .perform_later
    end
  end
end

ProjectFolders::SideFxProjectFolderService.prepend(
  ContentBuilder::Patches::ProjectFolders::SideFxProjectFolderService
)
