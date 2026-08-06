# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactPost do
  context 'when an idea is created and there is an idea type' do
    let_it_be(:type_idea, reload: true) { create(:dimension_type) }
    let_it_be(:idea, reload: true) { create(:idea) }

    it 'is also available as a post fact' do
      expect { described_class.find(idea.id) }.not_to raise_error
    end
  end
end
