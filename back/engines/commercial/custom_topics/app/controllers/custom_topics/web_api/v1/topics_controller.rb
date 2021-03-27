module CustomTopics
  module WebApi
    module V1
      class TopicsController < ApplicationController
        before_action :set_topic, except: %i[create]

        def create
          @topic = Topic.new permitted_attributes(Topic)
          authorize @topic

          SideFxTopicService.new.before_create(@topic, current_user)
          if @topic.save
            SideFxTopicService.new.after_create(@topic, current_user)
            render json: ::WebApi::V1::TopicSerializer.new(
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
            render json: ::WebApi::V1::TopicSerializer.new(
              @topic, 
              params: fastjson_params
              ).serialized_json, status: :ok
          else
            render json: { errors: @topic.errors.details }, status: :unprocessable_entity
          end
        end

        def reorder
          SideFxTopicService.new.before_update(@topic, current_user)
          ordering = permitted_attributes(@topic)[:ordering]
          if ordering && @topic.insert_at(ordering)
            SideFxTopicService.new.after_update(@topic, current_user)
            render json: ::WebApi::V1::TopicSerializer.new(@topic.reload, params: fastjson_params).serialized_json, status: :ok
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
      end
    end
  end
end