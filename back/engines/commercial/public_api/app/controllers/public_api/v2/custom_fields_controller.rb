# frozen_string_literal: true

module PublicApi
  class V2::CustomFieldsController < PublicApiController
    include DeletedItemsAction

    RESOURCE_TYPES = %w[user custom-form].freeze

    def index
      custom_fields = filter(custom_fields_scope)
      list_items(custom_fields, V2::CustomFieldSerializer, includes: [custom_form: :participation_context])
    end

    def show
      show_item custom_fields_scope.find(params[:id]), V2::CustomFieldSerializer
    end

    private

    # Pages only structure a form: they are not questions and never have answers.
    def custom_fields_scope
      CustomField.where.not(input_type: 'page')
    end

    def filter(scope)
      if (resource_type = params[:resource_type])
        unless RESOURCE_TYPES.include?(resource_type)
          raise InvalidEnumParameterValueError.new('resource_type', resource_type, RESOURCE_TYPES)
        end

        scope = scope.where(resource_type: V2::BaseSerializer.type_to_classname(resource_type))
      end

      scope = scope.where(resource_type: 'CustomForm', resource_id: project_forms(params[:project_id])) if params[:project_id]
      scope = scope.where(resource_type: 'CustomForm', resource_id: phase_forms(params[:phase_id]).select(:id)) if params[:phase_id]
      scope
    end

    # Ideation forms belong to the project, survey forms to one of its phases.
    def project_forms(project_id)
      CustomForm.where(participation_context_type: 'Project', participation_context_id: project_id)
        .or(phase_forms(Phase.where(project_id: project_id).select(:id)))
        .select(:id)
    end

    def phase_forms(phase_ids)
      CustomForm.where(participation_context_type: 'Phase', participation_context_id: phase_ids)
    end
  end
end
