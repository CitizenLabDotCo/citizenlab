# frozen_string_literal: true

require 'rails_helper'

RSpec.describe StaticPage, type: :model do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:static_page)).to be_valid
    end
  end

  describe 'validations' do
    context 'when code is not \'custom\'' do
      subject { described_class.new(code: 'faq') }

      it { is_expected.to validate_uniqueness_of(:code) }
      it { is_expected.to validate_inclusion_of(:code).in_array(%w[about terms-and-conditions privacy-policy faq proposals custom]) }
    end

    context 'when code is \'custom\'' do
      subject { described_class.new(code: 'custom') }

      it { is_expected.not_to validate_uniqueness_of(:code) }
      it { is_expected.to validate_inclusion_of(:code).in_array(%w[about terms-and-conditions privacy-policy faq proposals custom]) }
    end

    context 'when banner_cta_button_type is set to \'customized_button\'' do
      subject { described_class.new(banner_cta_button_type: 'customized_button') }

      it { is_expected.to validate_presence_of(:banner_cta_button_url) }
      it { is_expected.to validate_presence_of(:banner_cta_button_multiloc) }
    end

    context 'when projects_enabled is set to true' do
      subject { described_class.new(projects_enabled: true) }

      it { is_expected.to validate_presence_of(:projects_filter_type) }
      it { is_expected.to validate_inclusion_of(:projects_filter_type).in_array(%w[area topics]) }
    end
  end

  describe 'when create new static page with no value for slug' do
    subject(:static_page) { build(:static_page) }

    it 'generates a slug' do
      static_page.title_multiloc = { en: 'My amazing page' }
      static_page.slug = nil
      static_page.save!
      expect(static_page.slug).to eq('my-amazing-page')
    end
  end

  describe 'before destroy' do
    subject(:static_page) { build(:static_page, code: 'faq') }

    it 'prevents destruction of static page with :code other than \'custom\'' do
      expect { static_page.destroy! }.to raise_error ActiveRecord::RecordNotDestroyed
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
