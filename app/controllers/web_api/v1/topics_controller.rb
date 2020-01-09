class WebApi::V1::TopicsController < ApplicationController
   before_action :set_topic, only: [:show, :update, :destroy]

   def index
     @topics = policy_scope(Topic)
       .order(:ordering)
       .page(params.dig(:page, :number))
       .per(params.dig(:page, :size))

     render json: linked_json(@topics, WebApi::V1::TopicSerializer, params: fastjson_params)
   end

   def show
     render json: WebApi::V1::TopicSerializer.new(@topic, params: fastjson_params).serialized_json
   end

   def create
    @topic = Topic.new(topic_params)
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
    @topic.assign_attributes topic_params
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
    SideFxTopicService.new.before_update(@topic, current_user)
    if @topic.insert_at(permitted_attributes(@topic)[:ordering])
      SideFxTopicService.new.after_update(@topic, current_user)
      render json: WebApi::V1::TopicSerializer.new(
        @topic.reload, 
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @topic.errors.details }, status: :unprocessable_entity
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

   def area_params
    params.require(:topic).permit(
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

   def secure_controller?
     false
   end
end
