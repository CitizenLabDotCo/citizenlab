class SideFxProjectService
  include SideFxHelper

  def initialize(sfx_pc = SideFxParticipationContextService.new)
    @sfx_pc = sfx_pc
  end

  def before_create(project, user)
    @sfx_pc.before_create project, user if project.participation_context?
  end

  def after_create(project, user)
    project.set_default_topics!
    project.update!(description_multiloc: TextImageService.new.swap_data_images(project, :description_multiloc))
    LogActivityJob.perform_later(project, 'created', user, project.created_at.to_i)
    if project.admin_publication.published?
      after_publish project, user
    end
    @sfx_pc.after_create project, user if project.participation_context?
  end

  def before_update(project, user)
    project.description_multiloc = TextImageService.new.swap_data_images(project, :description_multiloc)
    @sfx_pc.before_update project, user if project.participation_context?
  end

  def after_update(project, user)
    if project.admin_publication.publication_status_previous_change == %w[draft published]
      after_publish project, user
    end
    LogActivityJob.perform_later project, 'changed', user, project.updated_at.to_i
    @sfx_pc.after_update project, user if project.participation_context?
  end

  def before_destroy(project, user)
    @sfx_pc.before_destroy project, user if project.participation_context?
  end

  def after_destroy(frozen_project, user)
    serialized_project = clean_time_attributes(frozen_project.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_project), 'deleted',
      user, Time.now.to_i,
      payload: { project: serialized_project }
    )
    @sfx_pc.after_destroy frozen_project, user if frozen_project.participation_context?
  end

  private

  def after_publish(project, user)
    LogActivityJob.set(wait: 20.seconds).perform_later(project, 'published', user, Time.now.to_i)
  end

  def after_folder_changed(project, current_user)
    # Defined in core app to eliminate dependency between
    # idea assignment and folder engine.
  end
end

SideFxProjectService.prepend_if_ee 'SmartGroups::Patches::SideFxProjectService'
SideFxProjectService.prepend_if_ee 'IdeaAssignment::Patches::SideFxProjectService'
SideFxProjectService.prepend_if_ee 'ProjectManagement::Patches::SideFxProjectService'
SideFxProjectService.prepend_if_ee 'ProjectFolders::Patches::SideFxProjectService'
