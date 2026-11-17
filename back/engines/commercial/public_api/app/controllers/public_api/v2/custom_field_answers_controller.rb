# frozen_string_literal: true

module PublicApi
  class V2::CustomFieldAnswersController < PublicApiController
    ANSWERABLE_TYPES = %w[idea user].freeze

    def index
      list_items(filter(CustomFieldAnswer.all), V2::CustomFieldAnswerSerializer, includes: [custom_field: { options: :area }])
    end

    private

    def filter(scope)
      if (answerable_type = params[:answerable_type])
        if ANSWERABLE_TYPES.exclude?(answerable_type)
          raise InvalidEnumParameterValueError.new('answerable_type', answerable_type, ANSWERABLE_TYPES)
        end

        scope = scope.where(answerable_type: V2::BaseSerializer.type_to_classname(answerable_type))
      end

      scope = scope.where(params.permit(:answerable_id, :custom_field_id).to_h)

      if (project_id = params[:project_id])
        scope = scope.where(answerable_type: 'Idea', answerable_id: Idea.where(project_id: project_id).select(:id))
      end

      scope
    end
  end
end
