# frozen_string_literal: true

require 'rails_helper'

RSpec.configure do |config|
  config.before(:suite) do
    I18n.load_path += Rails.root.glob('engines/commercial/bulk_import_ideas/spec/fixtures/locales/*.yml')
  end
end

describe BulkImportIdeas::Exporters::LogicInstructionGenerator do
  let(:project) { create(:project) }
  let(:phase) { create(:native_survey_phase, project: project, with_permissions: true) }
  let(:custom_form) { create(:custom_form, participation_context: phase) }

  let!(:page1) { create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'First page' }) }
  let!(:select_field) do
    field = create(:custom_field_select, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Favourite colour' })
    field.options.create!(key: 'red', title_multiloc: { 'en' => 'Red' })
    field.options.create!(key: 'blue', title_multiloc: { 'en' => 'Blue' })
    field
  end
  let!(:page2) { create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Second page' }) }
  let!(:text_field) { create(:custom_field_text, resource: custom_form, title_multiloc: { 'en' => 'Why?' }) }
  let!(:end_page) { create(:custom_field_form_end_page, resource: custom_form) }

  let(:printable_fields) { IdeaCustomFieldsService.new(custom_form).printable_fields }
  let(:all_fields) { IdeaCustomFieldsService.new(custom_form).all_fields }
  let(:generator) { described_class.new(printable_fields, all_fields, 'en') }

  describe '#field_title' do
    it 'prefixes page titles with section labels' do
      expect(generator.field_title(page1, 'First page')).to eq 'Section A: First page'
      expect(generator.field_title(page2, 'Second page')).to eq 'Section B: Second page'
    end

    it 'returns just the section label when the page has no title' do
      page1.update!(title_multiloc: { 'en' => '' })
      generator = described_class.new(printable_fields, all_fields, 'en')

      expect(generator.field_title(page1, '')).to eq 'Section A'
    end

    it 'returns the default title for non-page fields' do
      expect(generator.field_title(select_field, 'Favourite colour')).to eq 'Favourite colour'
    end
  end

  describe '#option_title' do
    it 'prefixes option titles with letters for single-select fields' do
      options = select_field.options
      expect(generator.option_title(select_field, options[0], 0)).to eq 'A) Red'
      expect(generator.option_title(select_field, options[1], 1)).to eq 'B) Blue'
    end

    it 'prefixes option titles with letters for multi-select fields' do
      multiselect = create(:custom_field_multiselect, resource: custom_form, key: 'multi', title_multiloc: { 'en' => 'Multi' })
      opt1 = multiselect.options.create!(key: 'opt1', title_multiloc: { 'en' => 'Option 1' })
      opt2 = multiselect.options.create!(key: 'opt2', title_multiloc: { 'en' => 'Option 2' })

      gen = described_class.new(
        IdeaCustomFieldsService.new(custom_form).printable_fields,
        IdeaCustomFieldsService.new(custom_form).all_fields,
        'en'
      )

      expect(gen.option_title(multiselect, opt1, 0)).to eq 'A) Option 1'
      expect(gen.option_title(multiselect, opt2, 1)).to eq 'B) Option 2'
    end
  end

  describe '#attach_logic_instructions' do
    context 'page-level logic pointing to another page' do
      before do
        page1.update!(logic: { 'next_page_id' => page2.id })
      end

      it 'generates a "go to section" instruction' do
        gen = described_class.new(printable_fields, all_fields, 'en')
        fields = build_field_hashes
        gen.attach_logic_instructions(fields)

        last_field_on_page1 = fields.find { |f| f[:id] == select_field.id }
        expect(last_field_on_page1[:logic_instructions]).to include 'Go to <strong>Section B</strong> next.'
      end
    end

    context 'page-level logic pointing to end page' do
      before do
        page1.update!(logic: { 'next_page_id' => end_page.id })
      end

      it 'generates a "no further questions" instruction' do
        gen = described_class.new(printable_fields, all_fields, 'en')
        fields = build_field_hashes
        gen.attach_logic_instructions(fields)

        last_field_on_page1 = fields.find { |f| f[:id] == select_field.id }
        expect(last_field_on_page1[:logic_instructions]).to include 'do not</strong> need to answer any further questions'
      end
    end

    context 'question-level logic with rules' do
      before do
        select_field.update!(logic: {
          'rules' => [
            { 'if' => select_field.options.first.id, 'goto_page_id' => page2.id },
            { 'if' => select_field.options.second.id, 'goto_page_id' => end_page.id }
          ]
        })
      end

      it 'generates "if answered" instructions for each rule' do
        gen = described_class.new(printable_fields, all_fields, 'en')
        fields = build_field_hashes
        gen.attach_logic_instructions(fields)

        last_field_on_page1 = fields.find { |f| f[:id] == select_field.id }
        instructions = last_field_on_page1[:logic_instructions]
        expect(instructions).to include 'If you answered <strong>A</strong> for Question 1, go to <strong>Section B</strong> next.'
        expect(instructions).to include 'If you answered <strong>B</strong> for Question 1, you <strong>do not</strong> need to answer any further questions.'
      end
    end

    context 'multiple questions with logic on the same page' do
      let!(:second_select_field) do
        field = create(:custom_field_select, resource: custom_form, key: 'second_select', title_multiloc: { 'en' => 'Favourite animal' })
        field.options.create!(key: 'cat', title_multiloc: { 'en' => 'Cat' })
        field.options.create!(key: 'dog', title_multiloc: { 'en' => 'Dog' })
        # Move it between select_field and page2
        field.insert_at(select_field.ordering + 1)
        field
      end

      before do
        select_field.update!(logic: {
          'rules' => [
            { 'if' => select_field.options.first.id, 'goto_page_id' => page2.id }
          ]
        })
        second_select_field.update!(logic: {
          'rules' => [
            { 'if' => second_select_field.options.second.id, 'goto_page_id' => end_page.id }
          ]
        })
      end

      it 'combines instructions from both questions on the last field of the page' do
        pf = IdeaCustomFieldsService.new(custom_form).printable_fields
        af = IdeaCustomFieldsService.new(custom_form).all_fields
        gen = described_class.new(pf, af, 'en')
        fields = build_field_hashes_from(pf)
        gen.attach_logic_instructions(fields)

        last_field_on_page1 = fields.find { |f| f[:id] == second_select_field.id }
        instructions = last_field_on_page1[:logic_instructions]
        expect(instructions).to include 'If you answered <strong>A</strong> for Question 1, go to <strong>Section B</strong> next.'
        expect(instructions).to include 'If you answered <strong>B</strong> for Question 2, you <strong>do not</strong> need to answer any further questions.'
      end
    end

    context 'no logic on the form' do
      it 'does not attach any instructions' do
        fields = build_field_hashes
        generator.attach_logic_instructions(fields)

        fields.each do |field|
          expect(field[:logic_instructions]).to be_nil
        end
      end
    end
  end

  private

  def build_field_hashes
    build_field_hashes_from(printable_fields)
  end

  def build_field_hashes_from(fields)
    question_num = 0
    fields.filter_map do |field|
      next if field.title_multiloc['en'].blank? && !field.page?

      {
        id: field.id,
        input_type: field.input_type,
        question_number_int: field.supports_submission? ? (question_num += 1) : nil,
        logic_instructions: nil
      }
    end
  end
end
