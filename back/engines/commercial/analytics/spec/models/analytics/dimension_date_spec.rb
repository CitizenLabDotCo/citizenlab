# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionDate, type: :model do
  it 'Can create a date dimension' do
    create(:dimension_date_sept)
  end
end
