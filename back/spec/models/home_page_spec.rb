# frozen_string_literal: true

require 'rails_helper'

RSpec.describe HomePage do
  describe 'validations' do
    it 'only allows once instance of homepage to exist' do
      create(:home_page)
      second_home_page = build(:home_page)

      expect(second_home_page).to be_invalid
      expect(second_home_page.errors[:base]).not_to be_empty
    end

    context 'when banner_cta_signed_out_type is set to \'customized_button\'' do
      subject { described_class.new(banner_cta_signed_out_type: 'customized_button') }

      it { is_expected.to validate_presence_of(:banner_cta_signed_out_url) }
      it { is_expected.to validate_presence_of(:banner_cta_signed_out_text_multiloc) }
    end

    context 'when banner_cta_signed_in_type is set to \'customized_button\'' do
      subject { described_class.new(banner_cta_signed_in_type: 'customized_button') }

      it { is_expected.to validate_presence_of(:banner_cta_signed_in_url) }
      it { is_expected.to validate_presence_of(:banner_cta_signed_in_text_multiloc) }
    end
  end

  describe 'image uploads' do
    subject(:home_page) { build(:home_page) }

    it 'stores a header background image' do
      home_page.header_bg = File.open(Rails.root.join('spec/fixtures/header.jpg'))
      home_page.save!
      expect(home_page.header_bg.url).to be_present
    end
  end
end
