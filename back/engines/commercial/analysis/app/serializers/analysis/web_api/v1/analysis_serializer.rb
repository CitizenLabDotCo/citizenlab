# frozen_string_literal: true

class Analysis::WebApi::V1::AnalysisSerializer < WebApi::V1::BaseSerializer
  attributes :created_at, :updated_at, :participation_method

  belongs_to :project, serializer: ::WebApi::V1::ProjectSerializer
  belongs_to :phase, serializer: ::WebApi::V1::PhaseSerializer

  has_many :custom_fields, serializer: ::WebApi::V1::CustomFieldSerializer
  has_many :bookmarked_insightables, polymorphic: true
end

