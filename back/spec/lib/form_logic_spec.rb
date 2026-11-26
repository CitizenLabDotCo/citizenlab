# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FormLogic do
  let(:form) { create(:custom_form) }
  let!(:page1) { create(:custom_field_page, resource: form, key: 'page1') }
  let!(:colour) { create(:custom_field_select, resource: form, key: 'colour', required: true) }
  let!(:red) { create(:custom_field_option, custom_field: colour, key: 'red') }
  let!(:blue) { create(:custom_field_option, custom_field: colour, key: 'blue') }
  let!(:page2) { create(:custom_field_page, resource: form, key: 'page2') }
  let!(:why) { create(:custom_field_text, resource: form, key: 'why') }
  let!(:page3) { create(:custom_field_page, resource: form, key: 'page3') }
  let!(:end_page) { create(:custom_field_form_end_page, resource: form) }
  let(:fields) { form.custom_fields.order(:ordering).to_a }

  before do
    colour.update!(logic: { 'rules' => [{ 'if' => red.id, 'goto_page_id' => page3.id }, { 'if' => 'no_answer', 'goto_page_id' => end_page.id }] })
  end

  describe '.compile' do
    it 'compiles custom field records, with answer keys and field ids' do
      expect(described_class.compile(fields)).to eq(
        'pages' => [
          {
            'id' => page1.id,
            'fields' => [colour.id],
            'jumps' => [
              { 'when' => { 'field' => colour.id, 'op' => 'absent' }, 'goto' => end_page.id },
              { 'when' => { 'field' => colour.id, 'op' => 'one_of', 'value' => ['red'] }, 'goto' => page3.id }
            ]
          },
          { 'id' => page2.id, 'fields' => [why.id] },
          { 'id' => page3.id, 'fields' => [] },
          { 'id' => end_page.id, 'fields' => [] }
        ],
        'fields' => { colour.id => { 'required' => true }, why.id => { 'required' => false } }
      )
    end

    it 'accepts engine fields as well as records' do
      engine_fields = fields.map { |field| FormLogic::Field.from_custom_field(field) }

      expect(described_class.compile(engine_fields)).to eq(described_class.compile(fields))
    end
  end

  describe '.walk' do
    it 'walks the form for answers keyed by field id' do
      expect(described_class.walk(fields, colour.id => 'red').path).to eq([page1.id, page3.id, end_page.id])
      expect(described_class.walk(fields, colour.id => 'blue', why.id => 'x').to_h).to eq(
        'path' => [page1.id, page2.id, page3.id, end_page.id],
        'visible_ids' => [colour.id, why.id],
        'required_ids' => [colour.id],
        'answers' => { colour.id => 'blue', why.id => 'x' }
      )
      expect(described_class.walk(fields, {}).path).to eq([page1.id, end_page.id])
    end
  end

  describe '.normalize' do
    it 'reports what it changed' do
      page1.update!(logic: { 'next_page_id' => page2.id })

      expect(described_class.normalize(fields).report).to eq(
        [{ field_id: page1.id, reason: :page_default_ignored, rule: { 'next_page_id' => page2.id } }]
      )
    end
  end
end
