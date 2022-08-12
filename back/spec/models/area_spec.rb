# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Area, type: :model do
  subject { build(:area) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  it { is_expected.not_to validate_presence_of(:ordering) }
  it { is_expected.to validate_numericality_of(:ordering) }
  it { is_expected.to belong_to(:custom_field_option).optional }

  describe 'default_scope' do
    it 'defaults to sorting areas by ordering' do
      expect(described_class.pluck(:id)).to eq described_class.order(ordering: :asc).pluck(:id)
    end
  end

  describe 'description_multiloc' do
    it 'sanitizes script tags in the description' do
      area = create(:area, description_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script>'
      })
      expect(area.description_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!' })
    end
  end

  describe 'description sanitizer' do
    it 'with invalid locales marks the model as invalid' do
      area = build :area, description_multiloc: { 'se-BI' => 'awesome area' }
      expect(area).to be_invalid
    end
  end

  describe '#create' do
    before do
      create_list(:area, 3)
    end

    context 'when no ordering is given' do
      subject { create(:area) }

      it 'defaults to the end of the list' do
        last_area = described_class.last
        expect(subject.ordering).to eq(last_area.ordering.to_i + 1)
      end
    end

    context 'when an ordering is given' do
      subject { create(:area, ordering: ordering) }

      let(:ordering) { described_class.last.ordering + 1 }

      it 'should stay as given' do
        expect(subject.ordering).to eq(ordering)
      end
    end

    context 'when domicile field exist' do
      before { create(:custom_field_domicile) }

      it 'creates the corresponding domicile option' do
        area = nil
        expect { area = create(:area) }.to change { CustomFieldOption.count }.by(1)

        expect(area.title_multiloc).to eq(area.custom_field_option.title_multiloc)
        expect(area.ordering).to eq(area.custom_field_option.ordering)
      end
    end
  end

  describe '#update' do
    context 'when domicile field exist' do
      before { create(:custom_field_domicile) }

      let(:area) { create(:area, title_multiloc: { 'en' => 'Title' }) }

      it 'updates the corresponding domicile option' do
        area.update(title_multiloc: { 'en' => 'New title' })
        expect(area.custom_field_option.title_multiloc).to eq(area.title_multiloc)
      end
    end
  end
end
