# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FormLogic::Field do
  describe '.from_h' do
    it 'reads the attributes the engine needs' do
      field = described_class.from_h(
        'id' => 'q-id', 'key' => 'q', 'input_type' => 'select', 'required' => true, 'enabled' => false,
        'maximum' => nil, 'logic' => { 'rules' => [] }, 'options' => [{ 'id' => 'a-id', 'key' => 'a' }]
      )

      expect(field).to have_attributes(
        id: 'q-id', key: 'q', input_type: 'select', required: true, enabled: false, logic: { 'rules' => [] }
      )
      expect(field.options.map(&:to_h)).to eq([{ id: 'a-id', key: 'a' }])
    end

    it 'defaults to an enabled, optional field without options or logic' do
      field = described_class.from_h('id' => 'p', 'key' => 'p1', 'input_type' => 'page')

      expect(field).to have_attributes(required: false, enabled: true, maximum: nil, options: [], logic: {})
    end

    it 'treats a null logic as no logic' do
      expect(described_class.from_h('id' => 'p', 'key' => 'p', 'input_type' => 'page', 'logic' => nil).logic).to eq({})
    end
  end

  describe '.from_custom_field' do
    it 'reads a select with its options in order, using the answer keys' do
      field = create(:custom_field_select, key: 'colour', required: true, logic: { 'rules' => [] })
      blue = create(:custom_field_option, custom_field: field, key: 'blue', ordering: 1)
      red = create(:custom_field_option, custom_field: field, key: 'red', ordering: 0)

      engine_field = described_class.from_custom_field(field.reload)

      expect(engine_field).to have_attributes(id: field.id, key: 'colour', input_type: 'select', required: true, enabled: true)
      expect(engine_field.options.map(&:to_h)).to eq([{ id: red.id, key: 'red' }, { id: blue.id, key: 'blue' }])
    end

    it 'uses the area id as the answer key of a domicile option' do
      area = create(:area)
      field = create(:custom_field_domicile)
      option = field.options.find_by(area: area) || create(:custom_field_option, custom_field: field, area: area)

      expect(described_class.from_custom_field(field.reload).options.map(&:key)).to include(area.id)
      expect(option.answer_key).to eq(area.id)
    end

    it 'reads the maximum of a linear scale' do
      field = create(:custom_field_linear_scale, maximum: 7)

      expect(described_class.from_custom_field(field).maximum).to eq(7)
    end
  end

  describe 'kinds' do
    def field(attributes)
      described_class.from_h({ 'id' => 'x', 'key' => 'x' }.merge(attributes))
    end

    it 'knows pages, the end page and the user fields page' do
      expect(field('input_type' => 'page')).to have_attributes(page?: true, question?: false, form_end?: false, user_page?: false)
      expect(field('input_type' => 'page', 'key' => 'form_end')).to have_attributes(page?: true, form_end?: true)
      expect(field('input_type' => 'page', 'key' => 'user_page')).to have_attributes(page?: true, user_page?: true)
      expect(field('input_type' => 'select', 'key' => 'form_end')).to have_attributes(page?: false, question?: true, form_end?: false)
    end

    it 'gives the logic operators of its input type' do
      expect(field('input_type' => 'select').logic_operators).to eq(%w[one_of none_of present absent])
      expect(field('input_type' => 'text').logic_operators).to eq([])
      expect(field('input_type' => 'unknown_type').logic_operators).to eq([])
    end
  end
end
