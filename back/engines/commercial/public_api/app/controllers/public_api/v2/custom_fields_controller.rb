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

    # Pages only structure a form, so they are left out. Built-in fields such as
    # the title stay in to describe the whole form, though their values live on
    # the idea and never show up as answers.
    def custom_fields_scope
      CustomField.where.not(input_type: 'page')
    end

    def filter(scope)
      if (resource_type = params[:resource_type])
        if RESOURCE_TYPES.exclude?(resource_type)
          raise InvalidEnumParameterValueError.new('resource_type', resource_type, RESOURCE_TYPES)
        end

        scope = scope.where(resource_type: V2::BaseSerializer.type_to_classname(resource_type))
      end

      # Only the project's own form fields. Registration questions asked in its
      # forms are user fields, so their u_ answers point to fields not listed here.
      scope = scope.where(resource_type: 'CustomForm', resource_id: project_forms(params[:project_id])) if params[:project_id]
      scope = scope.where(resource_type: 'CustomForm', resource_id: phase_form_id(params[:phase_id])) if params[:phase_id]
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

    # The form the phase collects inputs with: its own for surveys, the project's
    # for ideation and voting. Asking the phase's participation method keeps this
    # right if forms move from projects to phases.
    def phase_form_id(phase_id)
      form = Phase.find_by(id: phase_id)&.pmethod&.custom_form
      form.id if form&.persisted?
    end
  end
end
