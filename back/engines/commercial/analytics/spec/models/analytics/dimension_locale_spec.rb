# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionLocale, type: :model do
  it 'can create a locale dimension (en)' do
    create(:dimension_locale)
  end
  # Needs a check for uniqueness
end
