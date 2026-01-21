# frozen_string_literal: true

class Analysis::WebApi::V1::AnalysisSerializer < WebApi::V1::BaseSerializer
  attributes :created_at, :updated_at, :participation_method, :show_insights # TODO: move-participation-method-logic

  belongs_to :project, serializer: ::WebApi::V1::ProjectSerializer
  belongs_to :phase, serializer: ::WebApi::V1::PhaseSerializer

  belongs_to :main_custom_field, serializer: ::WebApi::V1::CustomFieldSerializer
  has_many :additional_custom_fields, serializer: ::WebApi::V1::CustomFieldSerializer
  has_many :files, serializer: ::WebApi::V1::FileSerializer, &:attached_files

  has_many :all_custom_fields, serializer: ::WebApi::V1::CustomFieldSerializer do |analysis|
    participation_method = analysis.participation_context.pmethod
    if analysis.participation_context.custom_form.nil?
      participation_method.create_default_form!
      analysis.participation_context.reload
    end

    IdeaCustomFieldsService.new(analysis.participation_context.custom_form).all_fields.filter(&:supports_submission?)
  end

  has_many :insightables do |analysis|
    analysis.insights.filter_map(&:insightable).compact
  end
end
