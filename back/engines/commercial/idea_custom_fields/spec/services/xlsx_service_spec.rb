# frozen_string_literal: true

require 'rails_helper'
require 'rubyXL'

describe XlsxService do
  let(:service) { described_class.new }

  describe 'generate_ideas_xlsx' do
    before do
      @project = create :project
      @form = create :custom_form, participation_context: @project
      create(
        :custom_field,
        :for_custom_form,
        resource: @form,
        required: false,
        input_type: 'number',
        key: 'number_field',
        title_multiloc: { 'en' => 'How many times did it rain this year?' }
      )
    end

    context 'when idea_custom_fields is deactivated' do
      before do
        SettingsService.new.deactivate_feature! 'idea_custom_fields'
        @idea1 = create(:idea, project: @project, custom_field_values: { 'number_field' => 4 })
      end

      let(:xlsx) { service.generate_ideas_xlsx([@idea1], view_private_attributes: false) }
      let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
      let(:worksheet) { workbook.worksheets[0] }

      it 'excludes custom field values' do
        headers = worksheet[0].cells.map(&:value)
        number_field_idx = headers.find_index 'How many times did it rain this year?'
        expect(number_field_idx).to be_nil
      end
    end

    context 'when idea_custom_fields is activated' do
      before do
        SettingsService.new.activate_feature! 'idea_custom_fields'

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
        @idea1 = create :idea, project: @project, custom_field_values: fields1
        @idea2 = create :idea, project: @project, custom_field_values: fields2
        @idea3 = create :idea, project: @project, custom_field_values: fields3
      end

      let(:xlsx) { service.generate_ideas_xlsx([@idea1, @idea2, @idea3], view_private_attributes: false) }
      let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
      let(:worksheet) { workbook.worksheets[0] }

      it 'includes custom field values' do # TODO: verify that hidden fields are left out
        headers = worksheet[0].cells.map(&:value)
        number_field_idx      = headers.find_index 'How many times did it rain this year?'
        date_field_idx        = headers.find_index 'When was the last time it rained?'
        select_field_idx      = headers.find_index 'Which of these animals is more common in your neighbourhood?'
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

      it 'excludes disabled custom fields' do
        create(
          :custom_field,
          :for_custom_form,
          resource: @form,
          enabled: false,
          title_multiloc: { 'en' => 'Disabled field' }
        )
        headers = worksheet[0].cells.map(&:value)
        field_idx = headers.find_index 'Disabled field'
        expect(field_idx).to be_nil
      end
    end
  end
end
