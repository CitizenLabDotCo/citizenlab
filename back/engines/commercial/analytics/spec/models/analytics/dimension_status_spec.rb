# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionStatus, type: :model do
  it 'can create a status dimension by creating an idea status' do
    status = create(:idea_status)
    status_dimension = described_class.first
    assert(status_dimension.id == status.id)
  end
end
