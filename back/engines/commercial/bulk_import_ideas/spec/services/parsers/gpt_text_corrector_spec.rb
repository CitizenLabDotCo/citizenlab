require 'rails_helper'

RSpec.describe BulkImportIdeas::Parsers::Pdf::GPTTextCorrector do
  subject(:corrector) { described_class.new(phase, idea_rows) }

  let_it_be(:correctable_fields) do
    [
      build(:custom_field, key: 'field1', input_type: 'multiline_text'),
      build(:custom_field, key: 'title_multiloc', input_type: 'text')
    ]
  end
  let_it_be(:phase) do
    custom_form = build(:custom_form, custom_fields: correctable_fields)
    project = build(:project, custom_form: custom_form)
    create(:phase, project: project)
  end
  let_it_be(:idea_rows) do
    [
      { id: '1', project_id: '1', title_multiloc: { en: 'title' }, custom_field_values: { field1: 'wrong value' } },
      { id: '2', project_id: '2', title_multiloc: { en: 'title 2' }, custom_field_values: { field1: 'wrong value 2' } }
    ]
  end

  describe '#correct' do
    context 'when idea_rows is blank' do
      let(:idea_rows) { [] }

      it 'returns idea_rows' do
        expect(corrector.correct).to eq(idea_rows)
        expect_any_instance_of(Analysis::LLM::GPT4Turbo).not_to receive(:chat)
      end
    end

    context 'when idea_rows is not blank' do
      let(:gpt_response) do
        [
          { id: '1', title_multiloc: { en: 'corrected title' }, custom_field_values: { field1: 'corrected value' } },
          { id: '2', title_multiloc: { en: 'corrected title 2' }, custom_field_values: { field1: 'corrected value 2' } }
        ].to_json
      end

      before do
        allow_any_instance_of(Analysis::LLM::GPT4Turbo).to receive(:chat).and_return(gpt_response)
      end

      it 'returns idea_rows with corrected texts' do
        expect(corrector.correct).to eq([
          { id: '1', project_id: '1', title_multiloc: { en: 'corrected title' }, custom_field_values: { field1: 'corrected value' } },
          { id: '2', project_id: '2', title_multiloc: { en: 'corrected title 2' }, custom_field_values: { field1: 'corrected value 2' } }
        ])
      end

      context "when GPT doesn't return JSON" do
        let(:gpt_response) { 'What is JSON?' }

        it 'returns idea_rows' do
          expect(ErrorReporter).to receive(:report_msg)
          expect(corrector.correct).to eq(idea_rows)
        end
      end

      context 'when GPT returns empty response' do
        let(:gpt_response) { '' }

        it 'returns idea_rows' do
          expect(ErrorReporter).to receive(:report_msg)
          expect(corrector.correct).to eq(idea_rows)
        end
      end

      context 'when GPT returns invalid JSON' do
        let(:gpt_response) { '[,]' }

        it 'returns idea_rows' do
          expect(ErrorReporter).to receive(:report_msg)
          expect(corrector.correct).to eq(idea_rows)
        end
      end
    end
  end
end
