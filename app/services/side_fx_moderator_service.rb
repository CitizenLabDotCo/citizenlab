class SideFxModeratorService

  include SideFxHelper

  def after_create moderator, project, current_user
    LogActivityJob.set(wait: 5.seconds).perform_later(
      moderator, 'project_moderation_rights_given', 
      current_user, Time.now.to_i,
      payload: {project_id: project.id}
      )
    log_project_moderation_rights_received moderator, project, current_user
  end

  def after_destroy moderator, project, current_user
    LogActivityJob.perform_later(
      moderator, 'project_moderation_rights_removed', 
      current_user, Time.now.to_i
      )
  end


  private 

  def log_project_moderation_rights_received moderator, project, current_user
    project_serializer = "WebApi::V1::External::ProjectSerializer".constantize 
    serialized_project = ActiveModelSerializers::SerializableResource.new(project, {
      serializer: project_serializer,
      adapter: :json
     }).serializable_hash
    current_user_serializer = "WebApi::V1::External::UserSerializer".constantize
    serialized_current_user = ActiveModelSerializers::SerializableResource.new(current_user, {
      serializer: current_user_serializer,
      adapter: :json
     }).serializable_hash
    LogActivityJob.set(wait: 5.seconds).perform_later(
      moderator, 'project_moderation_rights_received', 
      moderator, Time.now.to_i, 
      payload: {project: serialized_project, initiator: serialized_current_user}
      ) 
  end


end