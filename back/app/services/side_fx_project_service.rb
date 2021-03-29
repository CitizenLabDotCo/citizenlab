class SideFxProjectService

  include SideFxHelper

  def initialize sfx_pc=SideFxParticipationContextService.new
    @sfx_pc = sfx_pc
  end

  def before_create project, user
    @sfx_pc.before_create project, user if project.participation_context?
  end

  def after_create project, user
    project.set_default_topics!
    project.update!(description_multiloc: TextImageService.new.swap_data_images(project, :description_multiloc))
    LogActivityJob.perform_later(project, 'created', user, project.created_at.to_i)
    if project.admin_publication.published?
      after_publish project, user
    end
    @sfx_pc.after_create project, user if project.participation_context?
  end

  def before_update project, user
    project.description_multiloc = TextImageService.new.swap_data_images(project, :description_multiloc)
    @sfx_pc.before_update project, user if project.participation_context?
  end

  def after_update project, user
    if project.admin_publication.publication_status_previous_change == ['draft','published']
      after_publish project, user
    end
    LogActivityJob.perform_later(project, 'changed', user, project.updated_at.to_i)
    @sfx_pc.after_update project, user if project.participation_context?
  end

  def before_destroy project, user
    @sfx_pc.before_destroy project, user if project.participation_context?
    SmartGroupsService.new.filter_by_rule_value(Group.all, project.id).destroy_all
  end

  def after_destroy frozen_project, user
    remove_moderators frozen_project.id
    serialized_project = clean_time_attributes(frozen_project.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_project), 'deleted',
      user, Time.now.to_i,
      payload: {project: serialized_project}
    )
    @sfx_pc.after_destroy frozen_project, user if frozen_project.participation_context?
  end


  private

  def after_publish project, user
    LogActivityJob.set(wait: 20.seconds).perform_later(project, 'published', user, Time.now.to_i)
  end

  def remove_moderators project_id
    User.project_moderator(project_id).all.each do |moderator|
      moderator.delete_role 'project_moderator', project_id: project_id
      moderator.save!
    end
  end
end

SideFxProjectService.prepend_if_ee('IdeaAssignment::Patches::SideFxProjectService')
