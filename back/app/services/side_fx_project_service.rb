# frozen_string_literal: true

class SideFxProjectService
  include SideFxHelper

  def before_create(project, user); end

  def after_create(project, user)
    project.set_default_topics!
    project.update!(description_multiloc: TextImageService.new.swap_data_images_multiloc(project.description_multiloc, field: :description_multiloc, imageable: project))
    serialized_project = clean_time_attributes(project.attributes)

    LogActivityJob.perform_later(
      project,
      'created',
      user,
      project.created_at.to_i,
      payload: { project: serialized_project }
    )

    after_publish project, user if project.admin_publication.published?
  end

  def after_copy(source_project, copied_project, user, start_time)
    LogActivityJob.perform_later(
      copied_project,
      'local_copy_created',
      user,
      copied_project.created_at.to_i,
      payload: {
        time_taken: Time.now - start_time,
        source_project_id: source_project.id,
        copied_project_attributes: copied_project.attributes
      }
    )
  end

  def before_update(project, _user)
    @publication_status_was = project.admin_publication.publication_status_was
    @folder_id_was = project.admin_publication.parent_id_was
    project.description_multiloc = TextImageService.new.swap_data_images_multiloc(project.description_multiloc, field: :description_multiloc, imageable: project)
  end

  def after_update(project, user)
    change = project.saved_changes
    payload = { project: clean_time_attributes(project.attributes) }
    payload[:change] = sanitize_change(change) if change.present?

    LogActivityJob.perform_later(
      project,
      'changed',
      user,
      project.updated_at.to_i,
      payload: payload
    )

    after_folder_changed project, user if @folder_id_was != project.folder_id
    # We don't want to send out the "project published" campaign when e.g. changing from "archived" to "published"
    after_publish project, user if project.admin_publication.published? && @publication_status_was == 'draft'
  end

  def before_destroy(project, user); end

  def after_destroy(frozen_project, user)
    ContentBuilder::LayoutService.new.clean_homepage_layout_when_publication_deleted(frozen_project)

    serialized_project = clean_time_attributes(frozen_project.attributes)

    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_project), 'deleted',
      user, Time.now.to_i,
      payload: { project: serialized_project }
    )
  end

  def before_delete_inputs(project, user); end

  def after_delete_inputs(project, user)
    LogActivityJob.perform_later project, 'inputs_deleted', user, Time.now.to_i
  end

  def after_votes_by_user_xlsx(project, user)
    LogActivityJob.perform_later(
      project,
      'exported_votes_by_user',
      user,
      Time.now.to_i,
      project_id: project.id
    )
  end

  def after_votes_by_input_xlsx(project, user)
    LogActivityJob.perform_later(
      project,
      'exported_votes_by_input',
      user,
      Time.now.to_i,
      project_id: project.id
    )
  end

  private

  def after_publish(project, user)
    LogActivityJob.perform_later project, 'published', user, project.updated_at.to_i
  end

  def after_folder_changed(project, current_user)
    # Defined in core app to eliminate dependency between
    # idea assignment and folder engine.
  end
end

SideFxProjectService.prepend(IdeaAssignment::Patches::SideFxProjectService)
