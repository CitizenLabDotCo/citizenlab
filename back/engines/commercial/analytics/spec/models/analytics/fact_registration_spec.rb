# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactRegistration, type: :model do
  context 'when a user is created and has completed registration' do
    let!(:user) { create(:user) }

    it 'is also available as a registration fact' do
      described_class.find(user.id)
    end
  end

  context 'when user is created and has not completed registration' do
    let!(:user) { create(:user, registration_completed_at: nil) }

    it 'is not available as a registration fact' do
      expect(described_class.count).to eq(0)
    end
  end
end
