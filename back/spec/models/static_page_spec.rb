# frozen_string_literal: true

require 'rails_helper'

RSpec.describe StaticPage, type: :model do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:static_page)).to be_valid
    end
  end

  describe 'image uploads' do
    subject(:static_page) { build(:static_page) }

    it 'stores a header background image' do
      static_page.header_bg = File.open(Rails.root.join('spec/fixtures/header.jpg'))
      static_page.save!
      expect(static_page.header_bg.url).to be_present
    end
  end
end
