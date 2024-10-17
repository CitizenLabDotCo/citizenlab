# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionStatus do
  context 'when an idea status is created' do
    let!(:idea_status) { create(:idea_status) }

    it 'is also available as a status dimension' do
      expect { described_class.find(idea_status.id) }.not_to raise_error
    end
  end

  # TODO: cleanup-after-proposals-migration
  context 'when an initiative status is created' do
    let!(:initiative_status) { create(:initiative_status) }

    it 'is also available as a status dimension' do
      expect { described_class.find(initiative_status.id) }.not_to raise_error
    end
  end
end
