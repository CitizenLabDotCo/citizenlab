# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionReferrerType, type: :model do
  it 'can create a referrer type dimension (website)' do
    create(:dimension_referrer_type_website)
  end
  # Needs a check for uniqueness
end
