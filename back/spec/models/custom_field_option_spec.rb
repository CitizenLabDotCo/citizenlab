# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldOption, type: :model do
  subject(:option) { create(:custom_field_option) }

  it { is_expected.to be_valid }
  it { is_expected.to have_one(:area).dependent(:nullify) }

  context 'when updated' do
    before do
      create(:custom_field_domicile)
      create_list(:area, 2)
    end

    let(:area) { Area.last }
    let(:option) { area.custom_field_option }

    it 'updates the associated area (if any)', :aggregate_failures do
      new_title = { 'en' => 'new title' }
      expect(option.title_multiloc).to_not eq new_title # sanity check

      option.update(title_multiloc: new_title, ordering: 0)

      expect(option.title_multiloc).to eq('en' => 'new title')
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
  end
end
