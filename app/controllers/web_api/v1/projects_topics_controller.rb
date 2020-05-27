class WebApi::V1::ProjectsTopicsController < ApplicationController

   def create
    @projects_topic = ProjectsTopic.new(project_id: params[:project_id], topic_id: params[:topic_id])
    authorize @projects_topic

    SideFxProjectsTopicService.new.before_create @projects_topic, current_user
    if @projects_topic.save
      SideFxProjectsTopicService.new.after_create @projects_topic, current_user
      head :created
    else
      render json: { errors: @projects_topic.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    @projects_topic = ProjectsTopic.find_by!(project_id: params[:project_id], topic_id: params[:topic_id])
    authorize @projects_topic

    SideFxProjectsTopicService.new.before_destroy @projects_topic, current_user
    projects_topic = @projects_topic.destroy
    if projects_topic.destroyed?
      SideFxProjectsTopicService.new.after_destroy projects_topic, current_user
      head :ok
    else
      head 500
    end
  end

   private

   def secure_controller?
     false
   end
end
