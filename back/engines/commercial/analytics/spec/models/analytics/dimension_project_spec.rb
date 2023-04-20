# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionProject do
  context 'when a project is created' do
    let!(:project) { create(:project) }

    it 'is also available as a project dimension' do
      described_class.find(project.id)
    end
  end
end
