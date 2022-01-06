require 'rails_helper'

RSpec.describe NavBarItem, type: :model do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:nav_bar_item)).to be_valid
    end
  end

  describe 'translations' do
    (NavBarItem::CODES - ['custom']).each do |code|
      it "exist for #{code} title" do
        key = "nav_bar_items.#{code}.title"
        expect(I18n.exists?(key)).to be_truthy
      end
    end
  end
end
