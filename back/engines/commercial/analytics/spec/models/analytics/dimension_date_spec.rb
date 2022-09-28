# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionDate, type: :model do
  it 'can create a date dimension (Sept)' do
    date_dim = create(:dimension_date, date: Date.new(2022, 9, 1))
    pp date_dim
  end
end
