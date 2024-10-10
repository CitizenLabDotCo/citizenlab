# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactPost do
  context 'when an idea is created and there is an idea type' do
    let!(:type_idea) { create(:dimension_type) }
    let!(:idea) { create(:idea) }

    it 'is also available as a post fact' do
      expect { described_class.find(idea.id) }.not_to raise_error
    end
  end

  # TODO: cleanup-after-proposals-migration
  context 'when an initiative is created and there is an initiative type' do
    let!(:type_initiative) { create(:dimension_type, name: 'initiative') }
    let!(:initiative) { create(:initiative) }

    it 'is also available as a post fact' do
      expect { described_class.find(initiative.id) }.not_to raise_error
    end
  end
end
