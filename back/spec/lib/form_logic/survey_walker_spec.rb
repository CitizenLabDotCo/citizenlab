# frozen_string_literal: true

require 'rails_helper'

# The same fixtures run in front/app/utils/formLogic/walkSurvey.test.ts, so the Ruby walker
# and the TS walker cannot drift apart.
RSpec.describe FormLogic::SurveyWalker do
  fixture_dir = Rails.root.join('spec/fixtures/form_logic/walker')
  files = Dir[fixture_dir.join('*.json')]

  it 'still has a full corpus' do
    expect(files.size).to be >= 12
    expect(files.sum { |file| JSON.parse(File.read(file))['cases'].size }).to be >= 200
  end

  files.each do |file|
    fixture = JSON.parse(File.read(file))

    describe File.basename(file) do
      fixture['cases'].each do |test_case|
        program = test_case['program']
        program = fixture.fetch('programs').fetch(program) if program.is_a?(String)

        it test_case['description'] do
          walker = described_class.new(program)

          if test_case['raises']
            expect { walker.walk(test_case['answers']) }.to raise_error(FormLogic::InvalidProgram)
          else
            expect(walker.walk(test_case['answers']).to_h).to eq(test_case['expected'])
          end
        end
      end
    end
  end
end
