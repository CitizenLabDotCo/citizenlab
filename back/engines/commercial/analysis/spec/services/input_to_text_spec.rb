# frozen_string_literal: true

require 'rails_helper'

describe Analysis::InputToText do
  describe '#execute' do
    it 'works with ideation built-in textual fields' do
      custom_form = create(:custom_form, :with_default_fields)
      custom_fields = custom_form.custom_fields.filter(&:support_free_text_value?)
      analysis = create(:analysis, main_custom_field: custom_fields.first, additional_custom_fields: custom_fields.drop(1))
      service = described_class.new(analysis)
      input = build(
        :idea,
        title_multiloc: { en: 'New pool' },
        body_multiloc: { en: '<p>Please please please, I want to <b>swim<b/></p>' },
        location_description: 'South Street 14'
      )
      expect(service.execute(input)).to eq({
        'Title' => 'New pool',
        'Description' => 'Please please please, I want to swim',
        'Location' => 'South Street 14'
      })
    end

    it 'works with non built-in textual fields' do
      custom_field = create(:custom_field_text, title_multiloc: { en: 'Where did you hear from us?' })
      service = described_class.new(build(:analysis, main_custom_field: custom_field))
      input = build(
        :idea,
        custom_field_values: {
          custom_field.key => 'Newspaper'
        }
      )
      expect(service.execute(input)).to eq({
        'Where did you hear from us?' => 'Newspaper'
      })
    end

    it 'omits fields with blank answers' do
      custom_field = create(:custom_field_text, title_multiloc: { en: 'Where did you hear from us?' })
      service = described_class.new(build(:analysis, main_custom_field: custom_field))
      input1 = build(
        :idea,
        custom_field_values: {
          custom_field.key => ''
        }
      )
      input2 = build(
        :idea,
        custom_field_values: {}
      )
      expect(service.execute(input1)).to eq({})
      expect(service.execute(input2)).to eq({})
    end

    it 'respects the `override_field_labels` option' do
      custom_field = create(:custom_field_text, title_multiloc: { en: 'Where did you hear from us?' })
      service = described_class.new(build(:analysis, main_custom_field: custom_field))
      input = build(
        :idea,
        custom_field_values: {
          custom_field.key => 'Newspaper'
        }
      )
      override_field_labels = {
        custom_field.id => 'QUESTION_1'
      }
      expect(service.execute(input, override_field_labels: override_field_labels)).to eq({
        'QUESTION_1' => 'Newspaper'
      })
    end

    it 'includes the id when passed the `include_id: true` option' do
      service = described_class.new(build(:analysis))
      input = build(:idea)
      expect(service.execute(input, include_id: true)).to eq({ 'ID' => input.id })
    end

    it 'truncates long values when passed the `truncate_values` option' do
      custom_form = create(:custom_form, :with_default_fields)
      custom_fields = custom_form.custom_fields.filter(&:support_free_text_value?)
      analysis = create(:analysis, main_custom_field: custom_fields.first, additional_custom_fields: custom_fields.drop(1))
      service = described_class.new(analysis)
      input = build(:idea, body_multiloc: { en: 'This is a way too long sentence!' })
      expect(service.execute(input, truncate_values: 20)).to include({ 'Description' => 'This is a way too...' })
    end
  end

  describe '#formatted' do
    it 'generates a sensible text representation from the custom_fields' do
      main_custom_field = build(:custom_field_text, title_multiloc: { en: 'Where did you hear from us?' })
      additional_custom_field = build(:custom_field_text, title_multiloc: { en: 'Would you recommend us to a friend?' })
      service = described_class.new(build(:analysis, main_custom_field: main_custom_field, additional_custom_fields: [additional_custom_field]))

      input = build(
        :idea,
        custom_field_values: {
          main_custom_field.key => 'Newspaper',
          additional_custom_field.key => 'Yes, I would'
        }
      )

      expect(service.formatted(input)).to eq(
        <<~TEXT
          ### Where did you hear from us?
          Newspaper
          
          ### Would you recommend us to a friend?
          Yes, I would
        TEXT
      )
    end

    it 'respects the `override_field_labels` option' do
      custom_fields = [
        create(:custom_field_text, title_multiloc: { en: 'Where did you hear from us?' }),
        create(:custom_field_text, title_multiloc: { en: 'Would you recommend us to a friend?' }),
        create(:custom_field_text, title_multiloc: { en: 'Hair color?' })
      ]
      analysis = create(:analysis, main_custom_field: custom_fields.first, additional_custom_fields: custom_fields.drop(1))
      service = described_class.new(analysis)

      input = build(
        :idea,
        custom_field_values: {
          custom_fields[0].key => 'Newspaper',
          custom_fields[1].key => 'Yes, I would',
          custom_fields[2].key => 'Blonde'
        }
      )

      override_field_labels = {
        custom_fields[0].id => 'QUESTION_1',
        custom_fields[2].id => 'QUESTION_2'
      }

      expect(service.formatted(input, override_field_labels: override_field_labels)).to eq(
        <<~TEXT
          ### QUESTION_1
          Newspaper
          
          ### Would you recommend us to a friend?
          Yes, I would

          ### QUESTION_2
          Blonde
        TEXT
      )
    end

    it 'includes the id when passed the `include_id: true` option' do
      service = described_class.new(build(:analysis))
      input = build(:idea)
      expect(service.formatted(input, include_id: true)).to eq(
        <<~TEXT
          ### ID
          #{input.id}
        TEXT
      )
    end
  end
end
