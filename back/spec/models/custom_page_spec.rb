# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomPage, type: :model do
  describe 'validations' do
    context 'when banner_cta_button_type is set to \'customized_button\'' do
      subject { described_class.new(banner_cta_button_type: 'customized_button') }

      it { is_expected.to validate_presence_of(:banner_cta_button_url) }
      it { is_expected.to validate_presence_of(:banner_cta_button_multiloc) }
    end
  end

  describe 'image uploads' do
    subject(:custom_page) { build(:custom_page) }

    it 'stores a header background image' do
      custom_page.header_bg = File.open(Rails.root.join('spec/fixtures/header.jpg'))
      custom_page.save!
      expect(custom_page.header_bg.url).to be_present
    end
  end
end
