# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BulkImportIdeas::Parsers::Pdf::FormSyncSchemaBuilder do
  subject(:builder) { described_class.new(phase, 'en', personal_data_enabled: personal_data_enabled) }

  let(:phase) { create(:native_survey_phase, with_permissions: true) }
  let(:personal_data_enabled) { false }
  let(:custom_form) { create(:custom_form, participation_context: phase) }
  let!(:page_field) { create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'First page' }) }

  describe '#output_schema' do
    context 'with text fields' do
      let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'text_field', title_multiloc: { 'en' => 'Your name' }) }
      let!(:multiline_field) { create(:custom_field_multiline_text, resource: custom_form, key: 'multiline_field', title_multiloc: { 'en' => 'Your story' }) }

      it 'generates string properties for text fields' do
        schema = builder.output_schema

        expect(schema[:type]).to eq('object')
        expect(schema[:additionalProperties]).to be(false)
        expect(schema[:required]).to include('question_1', 'question_2')

        expect(schema[:properties]['question_1']).to eq({
          type: 'string',
          description: "The answer the respondent wrote under question 1: 'Your name'. " \
                       'Return `_NOT_FOUND_` if the question was not in the document. ' \
                       'Return an empty string if the question was left unanswered.'
        })

        expect(schema[:properties]['question_2'][:type]).to eq('string')
      end
    end

    context 'with select and multiselect fields' do
      let!(:select_field) do
        field = create(:custom_field_select, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Your preference' })
        field.options.create!(key: 'opt_a', title_multiloc: { 'en' => 'Option A' })
        field.options.create!(key: 'opt_b', title_multiloc: { 'en' => 'Option B' })
        field
      end
      let!(:multiselect_field) do
        field = create(:custom_field_multiselect, resource: custom_form, key: 'multiselect_field', title_multiloc: { 'en' => 'Your interests' })
        field.options.create!(key: 'interest_1', title_multiloc: { 'en' => 'Sports' })
        field.options.create!(key: 'interest_2', title_multiloc: { 'en' => 'Music' })
        field
      end

      it 'generates array properties with enum items' do
        schema = builder.output_schema

        select_prop = schema[:properties]['question_1']
        expect(select_prop[:type]).to eq('array')
        expect(select_prop[:items][:type]).to eq('string')
        expect(select_prop[:items][:enum]).to eq(['Option A', 'Option B'])

        multiselect_prop = schema[:properties]['question_2']
        expect(multiselect_prop[:type]).to eq('array')
        expect(multiselect_prop[:items][:enum]).to eq(%w[Sports Music])
      end
    end

    context 'with scale fields' do
      let!(:rating_field) { create(:custom_field_rating, resource: custom_form, key: 'rating_field', title_multiloc: { 'en' => 'Rating field' }) }

      it 'generates string properties with numeric enum values' do
        schema = builder.output_schema

        prop = schema[:properties]['question_1']
        expect(prop[:type]).to eq('string')
        expect(prop[:enum]).to eq(['1', '2', '3', '4', '5', '', '_NOT_FOUND_'])
      end
    end

    context 'with ranking field' do
      let!(:ranking_field) do
        field = create(:custom_field_ranking, resource: custom_form, key: 'ranking_field', title_multiloc: { 'en' => 'Rank these' })
        field.options.create!(key: 'first', title_multiloc: { 'en' => 'First option' })
        field.options.create!(key: 'second', title_multiloc: { 'en' => 'Second option' })
        field
      end

      it 'generates array property with enum items' do
        schema = builder.output_schema

        prop = schema[:properties]['question_1']
        expect(prop[:type]).to eq('array')
        expect(prop[:items][:enum]).to eq(['First option', 'Second option'])
      end
    end

    context 'with matrix_linear_scale field' do
      # Factory creates 2 default statements: 'send_more_animals_to_space' and 'ride_bicycles_more_often'
      let!(:matrix_field) do
        create(
          :custom_field_matrix_linear_scale,
          resource: custom_form,
          key: 'matrix_field',
          title_multiloc: { 'en' => 'Rate these statements' },
          linear_scale_label_1_multiloc: { 'en' => 'Disagree' },
          linear_scale_label_2_multiloc: { 'en' => 'Neutral' },
          linear_scale_label_3_multiloc: { 'en' => 'Agree' },
          maximum: 3
        )
      end

      it 'generates a nested object property with sub-properties per statement' do
        schema = builder.output_schema

        matrix_prop = schema[:properties]['question_1']
        expect(matrix_prop[:type]).to eq('object')
        expect(matrix_prop[:additionalProperties]).to be(false)
        expect(matrix_prop[:required]).to eq(['question_1.1', 'question_1.2'])

        sub_prop = matrix_prop[:properties]['question_1.1']
        expect(sub_prop[:type]).to eq('integer')
        expect(sub_prop[:enum]).to eq([1, 2, 3, 0, -1])
        expect(sub_prop[:description]).to include('We should send more animals into space')
        expect(sub_prop[:description]).to include("1 = 'Disagree'")
        expect(sub_prop[:description]).to include("2 = 'Neutral'")
        expect(sub_prop[:description]).to include("3 = 'Agree'")

        sub_prop2 = matrix_prop[:properties]['question_1.2']
        expect(sub_prop2[:description]).to include('We should ride our bicycles more often')
      end
    end

    context 'with checkbox field' do
      let!(:checkbox_field) { create(:custom_field, resource: custom_form, key: 'checkbox_field', input_type: 'checkbox', title_multiloc: { 'en' => 'I agree' }) }

      it 'generates string property with checked/empty/_NOT_FOUND_ enum' do
        schema = builder.output_schema

        prop = schema[:properties]['question_1']
        expect(prop[:type]).to eq('string')
        expect(prop[:enum]).to eq(['checked', '', '_NOT_FOUND_'])
      end
    end

    context 'with unsupported field types (printable but not PDF-importable)' do
      let!(:point_field) { create(:custom_field_point, resource: custom_form, key: 'point_field', title_multiloc: { 'en' => 'Point field' }) }

      it 'generates null property with unsupported description' do
        schema = builder.output_schema

        prop = schema[:properties]['question_1']
        expect(prop[:type]).to eq('null')
        expect(prop[:description]).to include('unsupported')
      end

      it 'does not add unsupported fields to key_mapping' do
        expect(builder.key_mapping).not_to have_key('question_1')
      end
    end

    context 'question numbering' do
      let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'text_field', title_multiloc: { 'en' => 'Text field' }) }
      let!(:select_field) do
        field = create(:custom_field_select, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Select field' })
        field.options.create!(key: 'opt_a', title_multiloc: { 'en' => 'A' })
        field
      end
      let!(:page_field2) { create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'Second page' }) }
      let!(:multiline_field) { create(:custom_field_multiline_text, resource: custom_form, key: 'multiline_field', title_multiloc: { 'en' => 'Multiline' }) }

      it 'numbers questions sequentially, skipping non-submittable fields like pages' do
        schema = builder.output_schema

        expect(schema[:properties].keys).to eq(%w[question_1 question_2 question_3])
      end
    end

    context 'with select field that has an "other" option' do
      let!(:select_field) do
        field = create(:custom_field_select, resource: custom_form, key: 'colour', title_multiloc: { 'en' => 'Favourite colour' })
        field.options.create!(key: 'red', title_multiloc: { 'en' => 'Red' })
        field.options.create!(key: 'blue', title_multiloc: { 'en' => 'Blue' })
        field.options.create!(key: 'other', title_multiloc: { 'en' => 'Other' }, other: true)
        field
      end
      let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'postcode', title_multiloc: { 'en' => 'Postcode' }) }

      it 'uses question_N_other for the companion text field and does not increment question number' do
        schema = builder.output_schema
        keys = schema[:properties].keys

        expect(keys).to eq(%w[question_1 question_1_other question_2])

        expect(schema[:properties]['question_1'][:type]).to eq('array')
        expect(schema[:properties]['question_1'][:items][:enum]).to eq(%w[Red Blue Other])

        expect(schema[:properties]['question_1_other'][:type]).to eq('string')

        expect(schema[:properties]['question_2'][:type]).to eq('string')
      end

      it 'maps question_N_other to the correct field key' do
        mapping = builder.key_mapping

        expect(mapping['question_1']).to include(type: :field, field_key: 'colour')
        expect(mapping['question_1_other']).to include(type: :field, field_key: 'colour_other')
        expect(mapping['question_2']).to include(type: :field, field_key: 'postcode')
      end
    end

    context 'top-level schema structure' do
      let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'text_field', title_multiloc: { 'en' => 'A question' }) }

      it 'has correct top-level attributes' do
        schema = builder.output_schema

        expect(schema[:type]).to eq('object')
        expect(schema[:description]).to be_present
        expect(schema[:additionalProperties]).to be(false)
        expect(schema[:required]).to be_an(Array)
        expect(schema[:properties]).to be_a(Hash)
      end
    end
  end

  describe '#key_mapping' do
    let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'text_field', title_multiloc: { 'en' => 'Text' }) }
    let!(:select_field) do
      field = create(:custom_field_select, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Select' })
      field.options.create!(key: 'opt', title_multiloc: { 'en' => 'Opt' })
      field
    end
    # Factory creates 2 default statements: 'send_more_animals_to_space' and 'ride_bicycles_more_often'
    let!(:matrix_field) do
      create(
        :custom_field_matrix_linear_scale,
        resource: custom_form,
        key: 'matrix_field',
        title_multiloc: { 'en' => 'Matrix' },
        linear_scale_label_1_multiloc: { 'en' => 'Low' },
        linear_scale_label_2_multiloc: { 'en' => 'High' },
        maximum: 2
      )
    end

    it 'maps schema keys to field keys' do
      mapping = builder.key_mapping

      expect(mapping['question_1']).to include(type: :field, field_key: 'text_field')
      expect(mapping['question_2']).to include(type: :field, field_key: 'select_field')
      expect(mapping['question_3']).to include(type: :matrix, field_key: 'matrix_field')
      expect(mapping['question_3'][:statements]).to eq({
        'question_3.1' => 'send_more_animals_to_space',
        'question_3.2' => 'ride_bicycles_more_often'
      })
    end
  end

  describe 'personal data fields' do
    let(:personal_data_enabled) { true }
    let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'text_field', title_multiloc: { 'en' => 'Question' }) }

    it 'includes personal data properties when enabled' do
      schema = builder.output_schema

      expect(schema[:properties]).to have_key('first_name')
      expect(schema[:properties]).to have_key('last_name')
      expect(schema[:properties]).to have_key('email')
      expect(schema[:properties]).to have_key('consent')
      expect(schema[:required]).to include('first_name', 'last_name', 'email', 'consent')

      expect(schema[:properties]['consent'][:enum]).to eq(['checked', '', '_NOT_FOUND_'])
    end

    it 'maps personal data keys with labels' do
      mapping = builder.key_mapping

      expect(mapping['first_name']).to include(type: :personal_data, personal_field: :first_name)
      expect(mapping['first_name'][:label]).to be_present
      expect(mapping['last_name']).to include(type: :personal_data, personal_field: :last_name)
      expect(mapping['last_name'][:label]).to be_present
      expect(mapping['email']).to include(type: :personal_data, personal_field: :email)
      expect(mapping['email'][:label]).to be_present
      expect(mapping['consent']).to include(type: :personal_data, personal_field: :consent)
      expect(mapping['consent'][:label]).to be_present
    end

    it 'places personal data before form questions' do
      schema = builder.output_schema
      keys = schema[:properties].keys

      expect(keys.index('first_name')).to be < keys.index('question_1')
    end
  end

  describe 'personal data disabled' do
    let(:personal_data_enabled) { false }
    let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'text_field', title_multiloc: { 'en' => 'Question' }) }

    it 'does not include personal data properties' do
      schema = builder.output_schema

      expect(schema[:properties]).not_to have_key('first_name')
      expect(schema[:properties]).not_to have_key('consent')
    end
  end

  # Guard test: dynamically discovers all input types where supports_pdf_import? is true,
  # creates a field for each, and verifies they all appear in the key_mapping (i.e. they are
  # handled by add_field_property and not falling through to add_unsupported_property).
  # If a new field type is added and marked as pdf-importable, this test will fail automatically.
  describe 'all pdf-importable field types generate non-null schema properties' do
    it 'does not generate null type for any pdf-importable field' do
      # Dynamically find all input types that are both pdf-importable and submittable
      importable_types = CustomField::INPUT_TYPES.select do |input_type|
        probe = CustomField.new(input_type: input_type, enabled: true, include_in_printed_form: true)
        probe.supports_pdf_import? && probe.supports_submission?
      end

      # Create one field per importable type with the minimum required attributes
      importable_types.each_with_index do |input_type, i|
        attrs = {
          resource: custom_form,
          key: "importable_#{i}",
          input_type: input_type,
          title_multiloc: { 'en' => "Question #{input_type}" },
          enabled: true,
          required: false
        }

        probe = CustomField.new(input_type: input_type)
        attrs[:maximum] = 5 if probe.supports_linear_scale?

        field = CustomField.create!(attrs)

        if field.supports_options?
          field.options.create!(key: "opt_#{i}", title_multiloc: { 'en' => "Option #{i}" })
        end
        if input_type == 'matrix_linear_scale'
          field.update!(linear_scale_label_1_multiloc: { 'en' => 'Low' })
        end
      end

      # Fields handled by add_field_property are added to the key_mapping.
      # Unsupported fields are not. So any importable field missing from the
      # mapping indicates it fell through to add_unsupported_property.
      mapped_field_keys = builder.key_mapping.values.map { |v| v[:field_key] }
      unhandled_types = importable_types.select.with_index { |_, i| mapped_field_keys.exclude?("importable_#{i}") }

      expect(unhandled_types).to be_empty,
        "These pdf-importable field types are not handled by add_field_property: #{unhandled_types.join(', ')}"
    end
  end
end
