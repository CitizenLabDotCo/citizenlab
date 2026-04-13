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

    def before_update(folder, user)
      set_scheduled_by(folder.admin_publication, user)
    end

    def after_update(folder, user)
      change = folder.saved_changes

      if folder.space_id_previously_changed?
        folder.projects.each do |project|
          project.space_id = folder.space_id

          if project.save
            project_change = project.saved_changes

            payload = { project: clean_time_attributes(project.attributes) }
            payload[:change] = sanitize_change(project_change) if project_change.present?

            LogActivityJob.perform_later(project, 'changed', user, project.updated_at.to_i, payload: payload)
          end
        end
      end

      payload = { project_folder: clean_time_attributes(folder.attributes) }
      payload[:change] = sanitize_change(change) if change.present?

      LogActivityJob.perform_later(folder, 'changed', user, folder.updated_at.to_i, payload: payload)
      enqueue_scheduled_transition(folder.admin_publication)
    end

    def after_destroy(frozen_folder, user)
      ContentBuilder::LayoutService.new.clean_homepage_layout_when_publication_deleted(frozen_folder)

      serialized_folder = clean_time_attributes(frozen_folder.attributes)

      LogActivityJob.perform_later(
        encode_frozen_resource(frozen_folder), 'deleted',
        user, Time.now.to_i,
        payload: { project_folder: serialized_folder }
      )
    end

    private

    def set_scheduled_by(admin_pub, user)
      return unless admin_pub.will_save_change_to_scheduled_status?

      admin_pub.scheduled_by = admin_pub.scheduled_status.present? ? user : nil
    end

    def enqueue_scheduled_transition(admin_pub)
      return unless admin_pub.saved_change_to_scheduled_at?
      return unless admin_pub.scheduled_at.present?

      ProcessScheduledPublicationTransitionJob
        .set(wait_until: admin_pub.scheduled_at)
        .perform_later(admin_pub.id)
    end
  end
end
