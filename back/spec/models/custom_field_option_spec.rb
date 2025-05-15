# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldOption do
  subject(:option) { create(:custom_field_option) }

  it { is_expected.to be_valid }
  it { is_expected.to have_one(:area).dependent(:nullify) }

  it { is_expected.to validate_presence_of(:key) }
  it { is_expected.to validate_uniqueness_of(:key).scoped_to(:custom_field_id) }
  it { is_expected.to allow_value('the_option_key-1').for(:key) }
  it { is_expected.not_to allow_value('key#1').for(:key) }

  it { is_expected.to validate_presence_of(:title_multiloc) }

  context 'when updated' do
    before do
      create(:custom_field_domicile)
      create_list(:area, 2)
    end

    let(:area) { Area.last }
    let(:option) { area.custom_field_option }

    it 'updates the associated area (if any)', :aggregate_failures do
      new_title = { 'en' => 'new title' }
      expect(option.title_multiloc).not_to eq new_title # sanity check

      option.update(title_multiloc: new_title, ordering: 0)

      expect(option.title_multiloc).to eq(new_title)
      expect(option.ordering).to eq(0)
    end
  end

  context 'hooks' do
    it 'generates unique keys in the custom field scope on creation, if not specified' do
      cf = create(:custom_field_select)
      cfo1 = create(:custom_field_option, key: nil, custom_field: cf)
      cfo2 = create(:custom_field_option, key: nil, custom_field: cf)
      cfo3 = create(:custom_field_option, key: nil, custom_field: cf)
      expect([cfo1, cfo2, cfo3].map(&:key).uniq).to match [cfo1, cfo2, cfo3].map(&:key)
    end

    it 'generates a key based on the title_multiloc with an additional 3 character string when other is set to false' do
      cf = create(:custom_field_select)
      cfo = create(:custom_field_option, title_multiloc: { en: 'A field' }, key: nil, custom_field: cf, other: false)
      key_root = 'a_field'
      expect(cfo.key).to start_with key_root
      expect(cfo.key.length).to eq key_root.length + 4
    end

    it 'generates a key of "other" when other is set to true' do
      cf = create(:custom_field_select)
      cfo = create(:custom_field_option, key: nil, custom_field: cf, other: true)
      expect(cfo.key).to eq 'other'
    end
  end

  describe 'saving a custom field option without title_multiloc' do
    it 'produces validation errors on the key and the title_multiloc' do
      field = create(:custom_field_select)
      option = described_class.new custom_field: field, title_multiloc: {}
      expect(option.save).to be false
      expect(option.errors.details).to eq({
        key: [
          { error: :blank },
          { error: :invalid, value: nil }
        ],
        title_multiloc: [
          { error: :blank },
          { error: :blank }
        ]
      })
    end
  end

  describe '#sanitize_title_multiloc' do
    it 'removes all HTML tags from title_multiloc' do
      cfo = build(
        :custom_field_option,
        title_multiloc: {
          'en' => 'Thing <script>alert("XSS")</script> something',
          'fr-BE' => 'Something <img src=x onerror=alert(1)>',
          'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
        }
      )

      cfo.save!

      expect(cfo.title_multiloc['en']).to eq('Thing alert("XSS") something')
      expect(cfo.title_multiloc['fr-BE']).to eq('Something ')
      expect(cfo.title_multiloc['nl-BE']).to eq('Plain text with formatting')
    end
  end
end
