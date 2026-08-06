# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionUser do
  context 'when a normal user is created' do
    let_it_be(:user, reload: true) { create(:user) }

    it 'is also available as a user dimension' do
      expect { described_class.find(user.id) }.not_to raise_error
    end

    it 'has the default dimension role of citizen' do
      expect(described_class.find(user.id).role).to eq('citizen')
    end
  end

  context 'when an admin user is created' do
    let_it_be(:admin, reload: true) { create(:admin) }

    it 'is also available as a user dimension' do
      expect { described_class.find(admin.id) }.not_to raise_error
    end

    it 'has the dimension role of admin' do
      expect(described_class.find(admin.id).role).to eq('admin')
    end
  end

  context 'when there are two users and one has 2 visits' do
    let_it_be(:user1, reload: true) { create(:user) }
    let_it_be(:user2, reload: true) { create(:user) }

    let_it_be(:visit1, reload: true) { create(:fact_visit, dimension_user_id: user1.id) }
    let_it_be(:visit2, reload: true) { create(:fact_visit, dimension_user_id: user1.id) }

    it 'returns the correct number of users' do
      expect(described_class.where(has_visits: true).count).to eq(1)
    end
  end
end
