# frozen_string_literal: true

require 'rails_helper'

# The same fixture runs in front/app/utils/formLogic/interpret.test.ts, so the Ruby evaluator
# and the TS interpreter cannot drift apart.
RSpec.describe FormLogic::Evaluator do
  fixture = JSON.parse(Rails.root.join('spec/fixtures/form_logic/programs.json').read)

  it 'still has a full corpus' do
    expect(fixture['cases'].size).to be >= 15
  end

  fixture['cases'].each do |test_case|
    it test_case['description'] do
      result = described_class.new(test_case['program']).evaluate(test_case['answers'])

      expect(
        'path' => result.path,
        'visible_keys' => result.visible_keys,
        'required_keys' => result.required_keys,
        'answers' => result.answers
      ).to eq(test_case['expected'])
    end
  end
end
