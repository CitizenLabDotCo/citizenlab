# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Area do
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
        'en' => '<p>Test</p><script>These tags should be removed!</script>'
      })
      expect(area.description_multiloc).to eq({ 'en' => '<p>Test</p>These tags should be removed!' })
    end
  end

  describe 'description sanitizer' do
    it 'with invalid locales marks the model as invalid' do
      area = build(:area, description_multiloc: { 'se-BI' => 'awesome area' })
      expect(area).to be_invalid
    end
  end

  describe '#sanitize_title_multiloc' do
    it 'removes all HTML tags from title_multiloc' do
      area = build(
        :area,
        title_multiloc: {
          'en' => 'My area of <script>alert("XSS")</script> Springfield',
          'fr-BE' => 'South Elyse <img src=x onerror=alert(1)>',
          'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
        }
      )

      area.save!

      expect(area.title_multiloc['en']).to eq('My area of alert("XSS") Springfield')
      expect(area.title_multiloc['fr-BE']).to eq('South Elyse ')
      expect(area.title_multiloc['nl-BE']).to eq('Plain text with formatting')
    end
  end

  describe '#create' do
    before do
      create_list(:area, 3)
    end

    context 'when no ordering is given' do
      subject { create(:area) }

      it 'defaults to the end of the list' do
        expect(subject.ordering).to eq(described_class.maximum(:ordering))
      end
    end

    context 'when an ordering is given' do
      subject { create(:area, ordering: ordering) }

      let(:ordering) { described_class.maximum(:ordering) + 1 }

      it 'should stay as given' do
        expect(subject.ordering).to eq(ordering)
      end
    end

    context 'when domicile field exist' do
      before { create(:custom_field_domicile) }

      it 'creates the corresponding domicile option' do
        area = nil
        expect { area = create(:area) }.to change(CustomFieldOption, :count).by(1)

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

  describe '#recreate_custom_field_options!' do
    let!(:domicile) { create(:custom_field_domicile) }

    before do
      create_list(:area, 2)
    end

    it 'restores missing options' do
      area = described_class.first
      area.custom_field_option.destroy

      expect { described_class.recreate_custom_field_options }
        .to change(domicile.options, :count).by(1)

      expect(area.reload.custom_field_option.attributes.symbolize_keys)
        .to include(area.send(:option_attributes))
    end

    it 'fixes inconsistent options' do
      area = described_class.first
      option = area.custom_field_option

      original_ordering = option.ordering
      new_ordering = domicile.options.count + 1

      original_title = option.title_multiloc
      new_title = { 'en' => 'wrong-value' }
      expect(original_title).not_to eq(new_title) # sanity check

      # Using +update_columns+ to skip the callbacks to propagate the changes
      # to the associated area.
      option.update_columns(title_multiloc: new_title, ordering: new_ordering)
      described_class.recreate_custom_field_options

      area.reload
      expect(area.title_multiloc).to eq(original_title)
      expect(area.ordering).to eq(original_ordering)
    end

    # Does not include details for the somewhere-else option.
    def option_details
      domicile = CustomField.find_by(key: 'domicile')
      domicile.options.left_joins(:area).pluck('areas.id', 'ordering', 'title_multiloc')
    end

    it 'is idempotent' do
      option_details_before = option_details
      described_class.recreate_custom_field_options
      option_details_after = option_details

      expect(option_details_before).to match_array(option_details_after)
    end
  end
end
