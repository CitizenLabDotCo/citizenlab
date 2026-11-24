# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldOption do
  subject(:option) { create(:custom_field_option) }

  it_behaves_like 'a plain text multiloc', factory: :custom_field_option

  it { is_expected.to be_valid }
  it { is_expected.to have_one(:area).dependent(:nullify) }

  it { is_expected.to validate_presence_of(:key) }
  it { is_expected.to validate_uniqueness_of(:key).scoped_to(:custom_field_id) }
  it { is_expected.to allow_value('the_option_key-1').for(:key) }
  it { is_expected.not_to allow_value('key#1').for(:key) }

  it { is_expected.to validate_presence_of(:title_multiloc) }

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

  describe '#answer_key' do
    it 'returns the option key' do
      expect(create(:custom_field_option, key: 'bike').answer_key).to eq 'bike'
    end

    context 'for the domicile field' do
      # The domicile field creates an option per existing area on creation, and
      # each later area creates its own.
      let!(:domicile) { create(:custom_field_domicile) }
      let!(:area) { create(:area) }

      it "returns the area id for an area's option" do
        expect(area.custom_field_option.answer_key).to eq area.id
      end

      it "returns 'outside' for the somewhere else option" do
        somewhere_else = domicile.options.reload.find { |option| option.area.nil? }

        expect(somewhere_else.answer_key).to eq 'outside'
      end
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
end
