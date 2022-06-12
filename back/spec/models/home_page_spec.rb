# frozen_string_literal: true

require 'rails_helper'

RSpec.describe HomePage, type: :model do
  describe 'validations' do
    it 'only allows once instance of homepage to exist' do
      create(:home_page)
      second_home_page = build(:home_page)

      expect(second_home_page).to be_invalid
      expect(second_home_page.errors[:base]).not_to be_empty
    end

    context 'when cta_signed_out_type is set to \'customized_button\'' do
      subject { described_class.new(cta_signed_out_type: 'customized_button') }

      it { is_expected.to validate_presence_of(:cta_signed_out_url) }
      it { is_expected.to validate_presence_of(:cta_signed_out_text_multiloc) }
    end

    context 'when cta_signed_in_type is set to \'customized_button\'' do
      subject { described_class.new(cta_signed_in_type: 'customized_button') }

      it { is_expected.to validate_presence_of(:cta_signed_in_url) }
      it { is_expected.to validate_presence_of(:cta_signed_in_text_multiloc) }
    end

    context 'when top_info_section is enabled' do
      subject { described_class.new(top_info_section_enabled: true) }

      it { is_expected.to validate_presence_of(:top_info_section_multiloc) }
    end

    context 'when bottom_info_section is enabled' do
      subject { described_class.new(bottom_info_section_enabled: true) }

      it { is_expected.to validate_presence_of(:bottom_info_section_multiloc) }
    end
  end
end
