# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::DimensionType, type: :model do
  it 'can create a type dimension (idea)' do
    create(:dimension_type_idea)
  end
end
