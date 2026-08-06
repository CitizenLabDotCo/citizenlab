# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionStatus do
  context 'when an idea status is created' do
    let_it_be(:idea_status, reload: true) { create(:idea_status) }

    it 'is also available as a status dimension' do
      expect { described_class.find(idea_status.id) }.not_to raise_error
    end
  end
end
