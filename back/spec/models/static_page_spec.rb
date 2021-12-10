require 'rails_helper'

RSpec.describe StaticPage, type: :model do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:static_page)).to be_valid
    end
  end
end
