# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionChannel, type: :model do
  it 'can create a channel dimension (website)' do
    create(:dimension_channel_website)
  end
  # Needs a check for uniqueness
end
