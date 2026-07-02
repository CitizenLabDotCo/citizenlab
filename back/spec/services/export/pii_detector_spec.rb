# frozen_string_literal: true

require 'rails_helper'

describe Export::PiiDetector do
  subject(:detector) { described_class.new }

  let(:llm) { instance_double(Analysis::LLM::ClaudeHaiku45) }
  let(:form) { create(:custom_form) }
  # Form questions (resource_type 'CustomForm').
  let(:name_field) { create(:custom_field, resource: form, key: 'q_name', title_multiloc: { 'en' => 'Your name' }) }
  let(:colour_field) { create(:custom_field, resource: form, key: 'q_colour', title_multiloc: { 'en' => 'Favourite colour' }) }
  # `custom_field` defaults to a registration (resource_type 'User') field.
  let(:user_field) { create(:custom_field, key: 'residence') }

  before do
    allow_any_instance_of(LLMSelector).to receive(:llm_class_for_use_case)
      .and_return(class_double(Analysis::LLM::ClaudeHaiku45, new: llm))
  end

  describe '#personal_data_keys' do
    it 'classifies all fields (including user fields) via the LLM' do
      allow(llm).to receive(:chat).and_return(%w[q_name residence])

      expect(detector.personal_data_keys([name_field, colour_field, user_field]))
        .to contain_exactly('q_name', 'residence')
    end

    it 'does not auto-flag user fields — the LLM decides' do
      allow(llm).to receive(:chat).and_return([])

      expect(detector.personal_data_keys([user_field])).to be_empty
    end

    it 'ignores keys the model returns that were not sent to it' do
      allow(llm).to receive(:chat).and_return(%w[q_name made_up])

      expect(detector.personal_data_keys([name_field, colour_field])).to contain_exactly('q_name')
    end

    it 'parses models that return the JSON array as text' do
      allow(llm).to receive(:chat).and_return('["q_name"]')

      expect(detector.personal_data_keys([name_field, colour_field])).to contain_exactly('q_name')
    end

    it 'falls back to flagging the structural user fields when the LLM call fails' do
      allow(llm).to receive(:chat).and_raise(StandardError)
      allow(ErrorReporter).to receive(:report)

      expect(detector.personal_data_keys([name_field, user_field])).to contain_exactly('residence')
      expect(ErrorReporter).to have_received(:report)
    end
  end
end
