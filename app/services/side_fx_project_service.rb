class SideFxProjectService

  include SideFxHelper

  def before_create project, user
    project.description_multiloc = TextImageService.new.swap_data_images(project, :description_multiloc)
  end

  def after_create project, user
    PermissionsService.new.update_permissions_for project
    LogActivityJob.perform_later(project, 'created', user, project.created_at.to_i)
  end

  def before_update project, user
    project.description_multiloc = TextImageService.new.swap_data_images(project, :description_multiloc)
  end

  def after_update project, user
    PermissionsService.new.update_permissions_for project
    LogActivityJob.perform_later(project, 'changed', user, project.updated_at.to_i)
  end

  def after_destroy frozen_project, user
    remove_moderators frozen_project.id
    serialized_project = clean_time_attributes(frozen_project.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_project), 'deleted',
      user, Time.now.to_i, 
      payload: {project: serialized_project}
      )
  end


  private

  def remove_moderators project_id
    User.project_moderators(project_id).all.each do |moderator|
      moderator.delete_role 'project_moderator', project_id: project_id
      moderator.save!
    end
  end

end
