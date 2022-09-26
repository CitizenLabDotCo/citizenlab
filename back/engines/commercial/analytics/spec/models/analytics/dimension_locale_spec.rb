# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionLocale, type: :model do
  it 'Can create a locale dimension (en)' do
    create(:dimension_locale_en)
  end
  # Needs a check for uniqueness
end
