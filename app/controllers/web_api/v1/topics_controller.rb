class WebApi::V1::TopicsController < ApplicationController
   before_action :set_topic, only: [:show, :update, :reorder, :destroy]

   def index
     @topics = policy_scope(Topic).includes(:projects_topics)

     @topics = if params[:project_id].present?
      @topics.where(projects_topics: {project_id: params[:project_id]})
        .order('projects_topics.ordering')
     else
       @topics.order(:ordering)
     end

     @topics = @topics
       .page(params.dig(:page, :number))
       .per(params.dig(:page, :size))

     render json: linked_json(
      @topics, 
      WebApi::V1::TopicSerializer, 
      params: fastjson_params(project_id: params[:project_id])
      )
   end

   def show
     render json: WebApi::V1::TopicSerializer.new(@topic, params: fastjson_params).serialized_json
   end

   def create
    @topic = Topic.new(permitted_attributes(Topic))
    authorize @topic

    SideFxTopicService.new.before_create(@topic, current_user)
    if @topic.save
      SideFxTopicService.new.after_create(@topic, current_user)
      render json: WebApi::V1::TopicSerializer.new(
        @topic, 
        params: fastjson_params
        ).serialized_json, status: :created
    else
      render json: { errors: @topic.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @topic.assign_attributes permitted_attributes(@topic)
    authorize @topic
    SideFxTopicService.new.before_update(@topic, current_user)
    if @topic.save
      SideFxTopicService.new.after_update(@topic, current_user)
      render json: WebApi::V1::TopicSerializer.new(
        @topic, 
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @topic.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    authorize @topic
    SideFxTopicService.new.before_update(@topic, current_user)
    instance = if params[:project_id].present?
      @topic.projects_topics.find_by project_id: params[:project_id]
    else
      @topic
    end
    if instance.insert_at(permitted_attributes(@topic)[:ordering])
      SideFxTopicService.new.after_update(@topic, current_user)
      render json: WebApi::V1::TopicSerializer.new(
        @topic.reload, 
        params: fastjson_params(project_id: params[:project_id])
        ).serialized_json, status: :ok
    else
      render json: { errors: instance.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxTopicService.new.before_destroy(@topic, current_user)
    topic = @topic.destroy
    if topic.destroyed?
      SideFxTopicService.new.after_destroy(topic, current_user)
      head :ok
    else
      head 500
    end
  end

   private

   def set_topic
     @topic = Topic.find(params[:id])
     authorize @topic
   end

   def secure_controller?
     false
   end
end
