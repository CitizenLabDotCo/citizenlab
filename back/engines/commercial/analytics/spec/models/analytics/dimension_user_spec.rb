# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionUser do
  context 'when a normal user is created' do
    let!(:user) { create(:user) }

    it 'is also available as a user dimension' do
      described_class.find(user.id)
    end

    it 'has the default dimension role of citizen' do
      expect(described_class.find(user.id).role).to eq('citizen')
    end
  end

  context 'when an admin user is created' do
    let!(:admin) { create(:admin) }

    it 'is also available as a user dimension' do
      described_class.find(admin.id)
    end

    it 'has the dimension role of admin' do
      expect(described_class.find(admin.id).role).to eq('admin')
    end
  end
end
