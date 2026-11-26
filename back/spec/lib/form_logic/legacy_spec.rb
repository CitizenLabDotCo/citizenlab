# frozen_string_literal: true

require 'rails_helper'

# Stored (legacy) logic through the whole engine: normalize, compile, walk. The same fixtures
# pin today's respondent paths in
# front/app/components/CustomFieldsForm/SurveyForm/logic.characterization.test.ts.
RSpec.describe FormLogic do
  files = Rails.root.glob('spec/fixtures/form_logic/legacy/*.json')

  it 'still has a full corpus' do
    expect(files.sum { |file| JSON.parse(File.read(file))['cases'].size }).to be >= 70
  end

  files.each do |file|
    describe File.basename(file) do
      JSON.parse(File.read(file))['cases'].each do |test_case|
        it test_case['description'] do
          fields = test_case['fields'].map { |attributes| FormLogic::Field.from_h(attributes) }
          ids_by_key = fields.to_h { |field| [field.key, field.id] }
          keys_by_id = ids_by_key.invert
          answers = test_case['answers'].transform_keys { |key| ids_by_key.fetch(key) }

          path = described_class.walk(fields, answers).path.map { |id| keys_by_id.fetch(id) }

          expected = test_case.dig('expected', 'path') || test_case.dig('divergent', 'engine')
          expect(path).to eq(expected)
        end
      end
    end
  end
end
