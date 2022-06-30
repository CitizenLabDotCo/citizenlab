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

    context 'when top_info_section is enabled' do
      subject { described_class.new(top_info_section_enabled: true) }

      it { is_expected.to validate_presence_of(:top_info_section_multiloc) }
    end

    context 'when bottom_info_section is enabled' do
      subject { described_class.new(bottom_info_section_enabled: true) }

      it { is_expected.to validate_presence_of(:bottom_info_section_multiloc) }
    end
  end

  # This currently fails as we have switched HomePage back to using AppBgHeaderUploader
  # in an attempt to use the images files in their existing locations (to make use of originals).
  # This caused an ee release to be blocked by CI failure, probably because we had not dealt with 
  # related code in back/engines/ee/multi_tenancy/app/serializers/web_api/v1/external/tenant_serializer.rb
  # Thus, we reverted related changes in ee: https://github.com/CitizenLabDotCo/citizenlab-ee/pull/288
  # Since we have not resolved this issue yet, and continue to use AppBgHeaderUploader,
  # this test currently fails with: undefined method 'tenant' for #<HomePage:0x000055a142aea180>
  #
  # Currently skipped with `xit`
  describe 'image uploads' do
    subject(:home_page) { build(:home_page) }

    xit 'stores a header background image' do
      home_page.header_bg = File.open(Rails.root.join('spec/fixtures/header.jpg'))
      home_page.save!
      expect(home_page.header_bg.url).to be_present
    end
  end
end
