# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactSession do
  context 'when a session is created' do
    let!(:session) { create(:session) }

    it 'is also available as a session fact' do
      expect { described_class.find(session.id) }.not_to raise_error
    end
  end
end
