# frozen_string_literal: true

require 'rails_helper'

describe Analysis::InputToText do
  describe '#execute' do
    it 'works with ideation built-in textual fields' do
      custom_form = create(:custom_form, :with_default_fields)
      custom_fields = custom_form.custom_fields.filter(&:supports_free_text_value?)
      service = described_class.new(custom_fields)
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
      custom_fields = [
        build(:custom_field_text, title_multiloc: { en: 'Where did you hear from us?' })
      ]
      service = described_class.new(custom_fields)
      input = build(
        :idea,
        custom_field_values: {
          custom_fields[0].key => 'Newspaper'
        }
      )
      expect(service.execute(input)).to eq({
        'Where did you hear from us?' => 'Newspaper'
      })
    end

    it 'omits fields with blank answers' do
      custom_fields = [
        build(:custom_field_text, title_multiloc: { en: 'Where did you hear from us?' })
      ]
      service = described_class.new(custom_fields)
      input1 = build(
        :idea,
        custom_field_values: {
          custom_fields[0].key => ''
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
      custom_fields = [
        create(:custom_field_text, title_multiloc: { en: 'Where did you hear from us?' })
      ]
      service = described_class.new(custom_fields)
      input = build(
        :idea,
        custom_field_values: {
          custom_fields[0].key => 'Newspaper'
        }
      )
      override_field_labels = {
        custom_fields[0].id => 'QUESTION_1'
      }
      expect(service.execute(input, override_field_labels: override_field_labels)).to eq({
        'QUESTION_1' => 'Newspaper'
      })
    end

    it 'includes the id when passed the `include_id: true` option' do
      service = described_class.new([])
      input = build(:idea)
      expect(service.execute(input, include_id: true)).to eq({ 'ID' => input.id })
    end

    it 'truncates long values when passed the `truncate_values` option' do
      custom_form = create(:custom_form, :with_default_fields)
      service = described_class.new(custom_form.custom_fields.filter(&:supports_free_text_value?))
      input = build(:idea, body_multiloc: { en: 'This is a way too long sentence!' })
      expect(service.execute(input, truncate_values: 20)).to include({ 'Description' => 'This is a way too...' })
    end

    it 'includes the other field' do
      custom_field = create(:custom_field_select, title_multiloc: { en: 'What\'s your favourite option?' })
      create(:custom_field_option, custom_field: custom_field, key: 'other', title_multiloc: { 'en' => 'Other' }, other: true)
      service = described_class.new([custom_field])
      input = build(
        :idea,
        custom_field_values: {
          custom_field.key => 'other',
          "#{custom_field.key}_other" => 'Because none of the above'
        }
      )
      expect(service.execute(input)).to eq({
        'What\'s your favourite option?' => 'Other',
        'Type your answer' => 'Because none of the above'
      })
    end

    it 'works with a sentiment linear scale field that has no follow-up field' do
      custom_fields = [
        build(:custom_field_sentiment_linear_scale, title_multiloc: { en: 'How do you feel about our service?' })
      ]
      service = described_class.new(custom_fields)
      input = build(
        :idea,
        custom_field_values: {
          custom_fields[0].key => 3
        }
      )
      expect(service.execute(input)).to eq({
        'How do you feel about our service?' => 3
      })
    end
  end

  describe '#formatted' do
    it 'generates a sensible text representation from the custom_fields' do
      custom_fields = [
        build(:custom_field_text, title_multiloc: { en: 'Where did you hear from us?' }),
        build(:custom_field_text, title_multiloc: { en: 'Would you recommend us to a friend?' })
      ]
      service = described_class.new(custom_fields)

      input = build(
        :idea,
        custom_field_values: {
          custom_fields[0].key => 'Newspaper',
          custom_fields[1].key => 'Yes, I would'
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
      service = described_class.new(custom_fields)

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
      service = described_class.new([])
      input = build(:idea)
      expect(service.formatted(input, include_id: true)).to eq(
        <<~TEXT
          ### ID
          #{input.id}
        TEXT
      )
    end

    it 'generates multiple lines for ranking fields' do
      custom_field = create(:custom_field_ranking, :with_options)
      service = described_class.new([custom_field])

      input = build(
        :idea,
        custom_field_values: {
          custom_field.key => %w[by_bike by_train]
        }
      )

      expect(service.formatted(input)).to eq(
        <<~TEXT
          ### Rank your favourite means of public transport
          1. By bike
          2. By train
        TEXT
      )
    end

    it 'generates multiple lines for matrix linear scale fields' do
      custom_field = create(:custom_field_matrix_linear_scale)
      create(:custom_field_matrix_statement, custom_field: custom_field, key: 'more_benches_in_park', title_multiloc: { en: 'We need more benches in the park' })
      service = described_class.new([custom_field.reload])

      input = build(
        :idea,
        custom_field_values: {
          custom_field.key => { 'send_more_animals_to_space' => 5, 'more_benches_in_park' => 2 }
        }
      )

      expect(service.formatted(input)).to eq(
        <<~TEXT
          ### Please indicate how strong you agree or disagree with the following statements.
          We should send more animals into space - 5 (Strongly agree)
          We need more benches in the park - 2
        TEXT
      )
    end
  end

  it 'respects the `include_comments` option' do
    custom_field = create(:custom_field_text, title_multiloc: { en: 'Where did you hear from us?' })
    service = described_class.new([custom_field])

    input = build(
      :idea,
      custom_field_values: {
        custom_field.key => 'Newspaper'
      },
      comments: [build(:comment, body_multiloc: { en: 'This is a comment' })]
    )

    expect(service.formatted(input, include_comments: true)).to include('This is a comment')
    expect(service.formatted(input, include_comments: false)).not_to include('This is a comment')
  end
end
