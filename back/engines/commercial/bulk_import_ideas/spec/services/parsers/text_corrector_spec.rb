require 'rails_helper'

RSpec.describe BulkImportIdeas::Parsers::Pdf::TextCorrector do
  subject(:corrector) { described_class.new(phase, idea_rows) }

  let(:correctable_fields) do
    [build(:custom_field, key: 'field1', input_type: 'multiline_text')]
  end
  let(:phase) do
    custom_form = build(:custom_form, custom_fields: correctable_fields)
    project = build(:project, custom_form: custom_form)
    create(:phase, project: project)
  end
  let(:idea_rows) do
    [{ id: 1, title: 'text', custom_field_values: { field1: 'wrong value' } }]
  end

  describe '#correct' do
    context 'when idea_rows is not blank' do
      let(:gpt_response) { '[{ "id": 1, "custom_field_values": { "field1": "corrected value" } }]' }

      before do
        allow_any_instance_of(Analysis::LLM::GPT4Turbo).to receive(:chat).and_return(gpt_response)
      end

      it 'returns idea_rows with corrected texts' do
        expect(corrector.correct).to eq([{ id: 1, title: 'text', custom_field_values: { field1: 'corrected value' } }])
      end
    end
  end
end
