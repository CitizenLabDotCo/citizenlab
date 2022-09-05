# frozen_string_literal: true

require 'rails_helper'

describe Insights::WebApi::V1::InputSerializer do
  let(:input) { create(:idea) }
  let(:view) { create(:view_from_projects, projects: [input.project]) }
  let(:category) { create(:category, view: view) }
  let(:suggested_category) { create(:category, view: view) }
  let(:expected_serialization) do
    {
      data: {
        id: input.id,
        type: :input,
        relationships: {
          source: { data: { id: input.id, type: :idea } },
          categories: { data: [{ id: category.id, type: :category }] },
          suggested_categories: { data: [{ id: suggested_category.id, type: :category }] }
        }
      }
    }
  end

  before do
    assignment_service = Insights::CategoryAssignmentsService.new
    assignment_service.add_assignments(input, [category])
    assignment_service.add_suggestions(input, [suggested_category])
  end

  it { expect(described_class.new(input, { params: { view: view } }).serializable_hash).to match(expected_serialization) }
end
