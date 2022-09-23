# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionUser, type: :model do
  it 'can create a user dimension by creating a user' do
    user = create(:user)
    user_dimension = described_class.first
    assert(user_dimension.id == user.id)
  end
end
