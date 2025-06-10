# frozen_string_literal: true

require 'rails_helper'
require 'rubyXL'

describe XlsxService do
  let(:service) { described_class.new }

  describe 'generate_ideas_xlsx' do
    before do
      @project = create(:project)
      @form = create(:custom_form, participation_context: @project)

      create(
        :custom_field,
        :for_custom_form,
        resource: @form,
        required: false,
        input_type: 'number',
        key: 'number_field',
        title_multiloc: { 'en' => 'How many times did it rain this year?' }
      )

      create(
        :custom_field,
        :for_custom_form,
        resource: @form,
        required: false,
        input_type: 'date',
        key: 'date_field',
        title_multiloc: { 'en' => 'When was the last time it rained?' }
      )

      select_field = create(
        :custom_field_select,
        :for_custom_form,
        resource: @form,
        required: false,
        key: 'select_field',
        title_multiloc: { 'en' => 'Which of these animals is more common in your neighbourhood?' }
      )
      create(
        :custom_field_option,
        custom_field: select_field,
        key: 'hippopotamus',
        title_multiloc: { 'en' => 'Hippopotamus' }
      )
      create(
        :custom_field_option,
        custom_field: select_field,
        key: 'fruitfly',
        title_multiloc: { 'en' => 'Fruit fly' }
      )

      multiselect_field = create(
        :custom_field_multiselect,
        :for_custom_form,
        resource: @form,
        required: false,
        key: 'multiselect_field',
        title_multiloc: { 'en' => 'Which option names sound good to you?' }
      )
      create(
        :custom_field_option,
        custom_field: multiselect_field,
        key: 'option1',
        title_multiloc: { 'en' => 'Option 1' }
      )
      create(
        :custom_field_option,
        custom_field: multiselect_field,
        key: 'option2',
        title_multiloc: { 'en' => 'Option 2' }
      )

      fields1 = { 'number_field' => 9, 'multiselect_field' => %w[option1 option2] }
      fields2 = { 'number_field' => 22, 'date_field' => '19-05-2022', 'select_field' => 'hippopotamus' }
      fields3 = { 'select_field' => 'fruitfly', 'multiselect_field' => %w[option1] }
      @idea1 = create(:idea, project: @project, custom_field_values: fields1)
      @idea2 = create(:idea, project: @project, custom_field_values: fields2)
      @idea3 = create(:idea, project: @project, custom_field_values: fields3)
    end

    let(:xlsx) { service.generate_ideas_xlsx([@idea1, @idea2, @idea3], view_private_attributes: false) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'includes custom field values' do
      # TODO: verify that hidden fields are left out
      headers = worksheet[0].cells.map(&:value)
      number_field_idx = headers.find_index 'How many times did it rain this year?'
      date_field_idx = headers.find_index 'When was the last time it rained?'
      select_field_idx = headers.find_index 'Which of these animals is more common in your neighbourhood?'
      multiselect_field_idx = headers.find_index 'Which option names sound good to you?'
      expect([number_field_idx, date_field_idx, select_field_idx, multiselect_field_idx]).to all(be_present)
      idea1_row = worksheet[1].cells.map(&:value)
      expect(
        [
          idea1_row[number_field_idx],
          idea1_row[date_field_idx],
          idea1_row[select_field_idx],
          idea1_row[multiselect_field_idx]
        ]
      ).to eq [9, '', '', 'Option 1, Option 2']
      idea2_row = worksheet[2].cells.map(&:value)
      expect(
        [
          idea2_row[number_field_idx],
          idea2_row[date_field_idx],
          idea2_row[select_field_idx],
          idea2_row[multiselect_field_idx]
        ]
      ).to eq [22, '19-05-2022', 'Hippopotamus', '']
      idea3_row = worksheet[3].cells.map(&:value)
      expect(
        [
          idea3_row[number_field_idx],
          idea3_row[date_field_idx],
          idea3_row[select_field_idx],
          idea3_row[multiselect_field_idx]
        ]
      ).to eq ['', '', 'Fruit fly', 'Option 1']
    end

    it 'includes hidden custom fields' do
      create(
        :custom_field,
        :for_custom_form,
        resource: @form,
        hidden: true,
        title_multiloc: { 'en' => 'Hidden field' }
      )
      headers = worksheet[0].cells.map(&:value)
      field_idx = headers.find_index 'Hidden field'
      expect(field_idx).to be_present
    end

    it 'includes disabled custom fields' do
      create(
        :custom_field,
        :for_custom_form,
        resource: @form,
        enabled: false,
        title_multiloc: { 'en' => 'Disabled field' }
      )
      headers = worksheet[0].cells.map(&:value)
      field_idx = headers.find_index 'Disabled field'
      expect(field_idx).to be_present
    end

    context 'when a project has no custom form - and therefore no fields' do
      before do
        @project_no_form = create(:project)
        @idea = create(:idea, project: @project_no_form)
      end

      let(:xlsx) { service.generate_ideas_xlsx([@idea], view_private_attributes: false) }
      let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
      let(:worksheet) { workbook.worksheets[0] }

      it 'does not add any custom_fields' do
        headers = worksheet[0].cells.map(&:value)
        row = worksheet[1].cells.map(&:value)
        expect(headers).to match_array(
          %w[id title description proposed_budget published_at submitted_at comments likes dislikes unsure url project topics status latitude longitude location_description attachments imported]
        )
        expect(row.size).to eq headers.size
      end
    end

    context 'when there is a mix of projects with custom fields and without' do
      before do
        @project_no_form = create(:project)
        @project_with_form = create(:project)
        @form = create(:custom_form, participation_context: @project_with_form)
        create(
          :custom_field,
          :for_custom_form,
          resource: @form,
          required: false,
          input_type: 'number',
          key: 'number_field',
          title_multiloc: { 'en' => 'How many sugars?' }
        )
        @idea1 = create(:idea, project: @project_no_form)
        @idea2 = create(:idea, project: @project_with_form, custom_field_values: { 'number_field' => 5 })
      end

      let(:xlsx) { service.generate_ideas_xlsx([@idea1, @idea2], view_private_attributes: false) }
      let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
      let(:worksheet) { workbook.worksheets[0] }

      it 'returns custom fields in the header' do
        headers = worksheet[0].cells.map(&:value)
        custom_field_index = headers.find_index 'How many sugars?'
        expect(custom_field_index).to be_present
      end

      it 'returns an empty value for custom field columns for projects with no form' do
        headers = worksheet[0].cells.map(&:value)
        row_no_form = worksheet[1].cells.map(&:value)
        custom_field_index = headers.find_index 'How many sugars?'
        expect(row_no_form.size).to eq headers.size
        expect(row_no_form[custom_field_index]).to eq ''
      end

      it 'returns the custom field value for projects with a form' do
        headers = worksheet[0].cells.map(&:value)
        row_with_form = worksheet[2].cells.map(&:value)
        custom_field_index = headers.find_index 'How many sugars?'
        expect(row_with_form.size).to eq headers.size
        expect(row_with_form[custom_field_index]).to eq 5
      end
    end
  end
end
