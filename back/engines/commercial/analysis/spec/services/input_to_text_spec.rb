# frozen_string_literal: true

require 'rails_helper'

describe Analysis::InputToText do
  describe '#execute' do
    it 'works with ideation built-in textual fields' do
      custom_form = create(:custom_form, :with_default_fields)
      service = described_class.new(custom_form.custom_fields.filter(&:support_free_text_value?))
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
  end
end
