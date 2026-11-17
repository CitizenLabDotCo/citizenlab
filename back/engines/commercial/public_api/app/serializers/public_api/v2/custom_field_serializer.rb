# frozen_string_literal: true

class PublicApi::V2::CustomFieldSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :key,
    :code,
    :input_type,
    :ordering,
    :required,
    :enabled,
    :hidden,
    :maximum,
    :created_at,
    :updated_at

  multiloc_attributes :title_multiloc, :description_multiloc

  attribute(:resource_type) { classname_to_type(object.resource_type) }

  attribute(:project_id) do
    context = participation_context
    context.is_a?(Phase) ? context.project_id : context&.id
  end

  attribute(:phase_id) do
    context = participation_context
    context.id if context.is_a?(Phase)
  end

  # nil for registration fields, which belong to no form.
  def participation_context
    object.custom_form&.participation_context
  end
end
