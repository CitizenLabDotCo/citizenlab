module CustomTopics
  module WebApi
    module V1
      class TopicsController < ApplicationController
        before_action :set_topic, except: %i[create]

        def create
          @topic = Topic.new permitted_attributes_for_create
          authorize @topic, policy_class: TopicPolicy

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
          @topic.assign_attributes permitted_attributes_for_update
          authorize @topic, policy_class: TopicPolicy
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
          ordering = permitted_attributes_for_reorder[:ordering]
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
          authorize @topic, policy_class: TopicPolicy
        end

        def permitted_attributes_for_create
          params.require(:topic).permit(
            title_multiloc: CL2_SUPPORTED_LOCALES,
            description_multiloc: CL2_SUPPORTED_LOCALES
          )
        end

        def permitted_attributes_for_update
          attributes = [
            description_multiloc: CL2_SUPPORTED_LOCALES
          ]
          attributes += [title_multiloc: CL2_SUPPORTED_LOCALES] if @topic.custom?
          params.require(:topic).permit(
            *attributes
          )
        end

        def permitted_attributes_for_reorder
          params.require(:topic).permit(:ordering)
        end
      end
    end
  end
end