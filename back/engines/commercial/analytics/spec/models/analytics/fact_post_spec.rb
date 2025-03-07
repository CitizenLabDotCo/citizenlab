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
end
