# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionProject do
  context 'when a project is created' do
    let!(:project) { create(:project) }

    it 'is also available as a project dimension' do
      expect { described_class.find(project.id) }.not_to raise_error
    end
  end
end
