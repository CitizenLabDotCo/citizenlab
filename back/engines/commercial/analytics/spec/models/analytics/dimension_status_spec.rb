# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionStatus, type: :model do
  it 'can create a status dimension by creating an idea status' do
    status = create(:idea_status)
    described_class.find(status.id)
  end
end
