# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionProject, type: :model do
  it 'can create a project dimension by creating a project' do
    project = create(:project)
    project_dimension = described_class.first
    assert(project_dimension.id == project.id)
  end
end
