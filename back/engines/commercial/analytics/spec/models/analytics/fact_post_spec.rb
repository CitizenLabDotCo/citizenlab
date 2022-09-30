# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactPost, type: :model do
  it 'can create a post fact by creating an idea' do
    create(:dimension_type_idea)
    idea = create(:idea)
    post_fact = described_class.first

    assert(post_fact.id == idea.id)
  end

  it 'can create a post fact by creating an initiative' do
    create(:dimension_type_initiative)
    initiative = create(:initiative)
    post_fact = described_class.first
    assert(post_fact.id == initiative.id)
  end
end
