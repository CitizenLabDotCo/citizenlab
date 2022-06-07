# frozen_string_literal: true

require 'rails_helper'

RSpec.describe HomePage, type: :model do
  describe 'validations' do
    it 'only allows once instance of homepage to exist' do
      create(:home_page)
      second_home_page = build(:home_page)
      expect(second_home_page.save).to be(false)
      expect(second_home_page.errors[:base]).not_to be_empty
    end
  end
end
