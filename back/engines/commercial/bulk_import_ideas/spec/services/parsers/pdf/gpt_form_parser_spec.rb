require 'rails_helper'

RSpec.describe BulkImportIdeas::Parsers::Pdf::GPTFormParser do
  subject(:parser) { described_class.new(phase, 'en') }

  let(:phase) { create(:native_survey_phase, with_permissions: true) }

  describe '#parse_idea' do
    it 'returns the correct form data' do
      allow_any_instance_of(described_class)
        .to receive(:parse)
        .and_return([
          {
            'id' => 1,
            'text' => 'Privacy statement Please confirm your consent for us to collect and use your data in the ways described above (without your consent, we are unable to use any information that you provide).',
            'type' => 'single_choice',
            'options' => [{ 'id' => 1, 'text' => 'Yes' }],
            'answer' => 'Yes'
          },
          {
            'id' => 2,
            'text' => 'Please tell us your postcode',
            'type' => 'long_text',
            'answer' => 'SE17 1AA'
          },
          {
            'id' => 3,
            'text' => 'What do you love about the Walworth neighbourhood?',
            'type' => 'long_text',
            'answer' => 'LIVED HERE ALL MY LIFE, SO I MUST HAVE LOVED WALWORTH! THE PLACE IS GOOD FOR TENANTS, THE PEOPLE ARE GOOD AND FRIENDLY.'
          },
          {
            'id' => 4,
            'text' => 'What would you like to see extra funding go on in Walworth?',
            'type' => 'long_text',
            'answer' => 'HEALTH CARE, THE PLACE IS KEPT CLEAN, AND SHOULD BE GOOD FOR CHILDREN TO GROW UP.'
          }
        ])

      result = parser.parse_idea('none/needed/as/it/is/mocked', 2)

      # Can we use key here?
      expect(result).to eq(
        {
          pdf_pages: [1, 2],
          fields: {
            'Privacy statement Please confirm your consent for us to collect and use your data in the ways described above (without your consent, we are unable to use any information that you provide).' => 'Yes',
            'Please tell us your postcode' => 'SE17 1AA',
            'What do you love about the Walworth neighbourhood?' => 'LIVED HERE ALL MY LIFE, SO I MUST HAVE LOVED WALWORTH! THE PLACE IS GOOD FOR TENANTS, THE PEOPLE ARE GOOD AND FRIENDLY.',
            'What would you like to see extra funding go on in Walworth?' => 'HEALTH CARE, THE PLACE IS KEPT CLEAN, AND SHOULD BE GOOD FOR CHILDREN TO GROW UP.'
          }
        }
      )
    end
  end

  describe '#form_schema' do
    # TODO: This standard form with all printable fields should be in a new factory - 'printable_form'
    let(:custom_form) { create(:custom_form, participation_context: phase) }
    let!(:page_field) { create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'First page' }) }
    let!(:text_field) { create(:custom_field_text, resource: custom_form, required: true, title_multiloc: { 'en' => 'Text field' }) }
    let!(:multiline_field) { create(:custom_field_multiline_text, resource: custom_form, title_multiloc: { 'en' => 'Multiline field' }) }
    let!(:select_field) do
      field = create(:custom_field_select, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Select field' })
      field.options.create!(key: 'single1', title_multiloc: { 'en' => 'Single 1' })
      field.options.create!(key: 'single2', title_multiloc: { 'en' => 'Single 2' })
      field
    end
    let!(:multiselect_field) do
      field = create(:custom_field_multiselect, resource: custom_form, key: 'multiselect_field', title_multiloc: { 'en' => 'Multi select field' })
      field.options.create!(key: 'option1', title_multiloc: { 'en' => 'Option 1' })
      field.options.create!(key: 'option2', title_multiloc: { 'en' => 'Option 2' })
      field
    end
    let!(:ranking_field) do
      field = create(:custom_field_ranking, resource: custom_form, key: 'ranking_field', title_multiloc: { 'en' => 'Ranking field' })
      field.options.create!(key: 'ranking_one', title_multiloc: { 'en' => 'Ranking one' })
      field.options.create!(key: 'ranking_two', title_multiloc: { 'en' => 'Ranking two' })
      field
    end
    let!(:multiselect_image_field) do
      field = create(
        :custom_field_multiselect_image,
        resource: custom_form,
        title_multiloc: { 'en' => 'Select image field' },
        select_count_enabled: true,
        minimum_select_count: 1,
        maximum_select_count: 2
      )
      field.options.create!(title_multiloc: { 'en' => 'Image one' }, image: create(:custom_field_option_image))
      field.options.create!(title_multiloc: { 'en' => 'Image two' }, image: create(:custom_field_option_image))
      field.options.create!(title_multiloc: { 'en' => 'Image three' }, image: create(:custom_field_option_image))
      field
    end
    let!(:matrix_field) do
      field = create(
        :custom_field_matrix_linear_scale,
        resource: custom_form,
        key: 'matrix_field',
        title_multiloc: { 'en' => 'Matrix field' },
        linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
        linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
        linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
        linear_scale_label_4_multiloc: { 'en' => 'Agree' },
        linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
        maximum: 5
      )
      field.matrix_statements.create!(title_multiloc: { 'en' => 'Matrix statement one' })
      field.matrix_statements.create!(title_multiloc: { 'en' => 'Matrix statement two' })
      field
    end
    let!(:rating_field) { create(:custom_field_rating, resource: custom_form, key: 'rating_field', title_multiloc: { 'en' => 'Rating field' }) }
    let!(:sentiment_linear_scale_field) { create(:custom_field_sentiment_linear_scale, resource: custom_form, key: 'sentiment_field', title_multiloc: { 'en' => 'Sentiment scale field' }) }
    let!(:map_page) { create(:custom_field_page, page_layout: 'map', resource: custom_form, title_multiloc: { 'en' => 'Map page' }) }
    let!(:point_field) { create(:custom_field_point, resource: custom_form, title_multiloc: { 'en' => 'Point field' }) }
    let!(:line_field) { create(:custom_field_line, resource: custom_form, title_multiloc: { 'en' => 'Line field' }) }
    let!(:polygon_field) { create(:custom_field_polygon, resource: custom_form, title_multiloc: { 'en' => 'Polygon field' }) }
    let!(:end_page_field) { create(:custom_field_form_end_page, resource: custom_form) }

    # User field
    let_it_be(:user_text_field) do
      create(:custom_field_text, resource_type: 'User', title_multiloc: { 'en' => 'User text field' })
    end

    context 'no user fields in form' do
      it 'produces a schema to send to GPT' do
        schema = parser.send(:form_schema)

        expect(schema).to eq([
          { id: 1, type: 'text', text: 'Text field' },
          { id: 2, type: 'multiline_text', text: 'Multiline field' },
          { id: 3, type: 'select', text: 'Select field', options: ['Single 1', 'Single 2'] },
          { id: 4, type: 'multiselect', text: 'Multi select field', options: ['Option 1', 'Option 2'] },
          { id: 5, type: 'ranking', text: 'Ranking field', options: ['Ranking one', 'Ranking two'] },
          { id: 6, type: 'multiselect_image', text: 'Select image field', options: ['Image one', 'Image two', 'Image three'] },
          { id: 7,
            type: 'matrix_linear_scale',
            text: 'Matrix field',
            matrix_statements: ['We should send more animals into space', 'We should ride our bicycles more often', 'Matrix statement one', 'Matrix statement two'],
            labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'] },
          { id: 8, type: 'rating', text: 'Rating field' },
          { id: 9, type: 'sentiment_linear_scale', text: 'Sentiment scale field' },
          { id: 10, type: 'point', text: 'Point field' },
          { id: 11, type: 'line', text: 'Line field' },
          { id: 12, type: 'polygon', text: 'Polygon field' }
        ])
      end
    end

    context 'user fields in survey form' do
      before { phase.permissions.find_by(action: 'posting_idea').update!(user_fields_in_form: true) }

      it 'produces a schema with the user fields in' do
        schema = parser.send(:form_schema)
        expect(schema).to eq([
          { id: 1, type: 'text', text: 'Text field' },
          { id: 2, type: 'multiline_text', text: 'Multiline field' },
          { id: 3, type: 'select', text: 'Select field', options: ['Single 1', 'Single 2'] },
          { id: 4, type: 'multiselect', text: 'Multi select field', options: ['Option 1', 'Option 2'] },
          { id: 5, type: 'ranking', text: 'Ranking field', options: ['Ranking one', 'Ranking two'] },
          { id: 6, type: 'multiselect_image', text: 'Select image field', options: ['Image one', 'Image two', 'Image three'] },
          { id: 7,
            type: 'matrix_linear_scale',
            text: 'Matrix field',
            matrix_statements: ['We should send more animals into space', 'We should ride our bicycles more often', 'Matrix statement one', 'Matrix statement two'],
            labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'] },
          { id: 8, type: 'rating', text: 'Rating field' },
          { id: 9, type: 'sentiment_linear_scale', text: 'Sentiment scale field' },
          { id: 10, type: 'point', text: 'Point field' },
          { id: 11, type: 'line', text: 'Line field' },
          { id: 12, type: 'polygon', text: 'Polygon field' },
          { id: 13, type: 'text', text: 'User text field' },
          # The following are the default user fields
          { id: 14, type: 'select', text: 'Member of councils?', options: ['youth council'] },
          { id: 15, type: 'select', text: 'Member of councils?', options: ['youth council'] },
          { id: 16, type: 'select', text: 'Member of councils?', options: ['youth council'] }
        ])
      end
    end
  end
end
