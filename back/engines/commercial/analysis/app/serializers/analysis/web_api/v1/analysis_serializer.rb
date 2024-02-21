# frozen_string_literal: true

class Analysis::WebApi::V1::AnalysisSerializer < WebApi::V1::BaseSerializer
  attributes :created_at, :updated_at, :participation_method, :show_insights

  belongs_to :project, serializer: ::WebApi::V1::ProjectSerializer
  belongs_to :phase, serializer: ::WebApi::V1::PhaseSerializer

  belongs_to :main_custom_field, serializer: ::WebApi::V1::CustomFieldSerializer
  has_many :additional_custom_fields, serializer: ::WebApi::V1::CustomFieldSerializer

  has_many :all_custom_fields, serializer: ::WebApi::V1::CustomFieldSerializer do |analysis|
    participation_method = Factory.instance.participation_method_for(analysis.participation_context)
    custom_form = analysis.participation_context.custom_form || participation_method.create_default_form!

    IdeaCustomFieldsService.new(custom_form).all_fields.filter(&:accepts_input?)
  end
end
