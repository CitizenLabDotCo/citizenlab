require 'rails_helper'

RSpec.describe BulkImportIdeas::Parsers::Pdf::GPTTextCorrector do
  subject(:corrector) { described_class.new(phase, idea_rows) }

  let_it_be(:correctable_fields) do
    [
      build(:custom_field, key: 'field1', input_type: 'multiline_text'),
      build(:custom_field, key: 'title_multiloc', code: 'title_multiloc', input_type: 'text'),
      build(:custom_field, key: 'body_multiloc', code: 'body_multiloc', input_type: 'multiline_text')
    ]
  end
  let_it_be(:phase) do
    custom_form = build(:custom_form, custom_fields: correctable_fields)
    project = build(:project, custom_form: custom_form)
    create(:phase, project: project)
  end

  let(:idea_rows) do
    [
      { id: 1, project_id: '1', title_multiloc: { en: 'title' }, custom_field_values: { field1: 'wrong value' } },
      { id: 2, project_id: '2', title_multiloc: { en: 'title 2' }, custom_field_values: { field1: 'wrong value 2' } }
    ]
  end

  describe '#correct' do
    context 'when idea_rows is blank' do
      let(:idea_rows) { [] }

      it 'returns idea_rows' do
        expect(corrector.correct).to eq(idea_rows)
        expect_any_instance_of(Analysis::LLM::GPT41).not_to receive(:chat)
      end
    end

    context 'when idea_rows is not blank' do
      let(:gpt_response) do
        [
          { id: 1, title_multiloc: { en: 'corrected title' }, custom_field_values: { field1: 'corrected value' } },
          { id: 2, title_multiloc: { en: 'corrected title 2' }, custom_field_values: { field1: 'corrected value 2' } }
        ].to_json
      end

      before do
        allow_any_instance_of(Analysis::LLM::GPT41).to receive(:chat).and_return(gpt_response)
      end

      it 'returns idea_rows with corrected texts' do
        expect_any_instance_of(Analysis::LLM::GPT41).to receive(:chat).once.with(/title_multiloc.*field1/).and_return(gpt_response)

        expect(corrector.correct).to eq([
          { id: 1, project_id: '1', title_multiloc: { en: 'corrected title' }, custom_field_values: { field1: 'corrected value' } },
          { id: 2, project_id: '2', title_multiloc: { en: 'corrected title 2' }, custom_field_values: { field1: 'corrected value 2' } }
        ])
      end

      context 'when custom fields are empty' do
        let(:idea_rows) do
          [
            { id: 1, project_id: '1', title_multiloc: { en: 'title' } },
            { id: 2, project_id: '2', title_multiloc: { en: 'title 2' } }
          ]
        end
        let(:gpt_response) do
          [
            { id: 1, title_multiloc: { en: 'corrected title' } },
            { id: 2, title_multiloc: { en: 'corrected title 2' } }
          ].to_json
        end

        it 'returns idea_rows with corrected texts' do
          expect_any_instance_of(Analysis::LLM::GPT41).to receive(:chat).once.with(/title_multiloc/).and_return(gpt_response)

          expect(corrector.correct).to eq([
            { id: 1, project_id: '1', title_multiloc: { en: 'corrected title' } },
            { id: 2, project_id: '2', title_multiloc: { en: 'corrected title 2' } }
          ])
        end
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

    context 'when running real GPT', skip: 'These tests are added to run manualy. They will make real requests to GPT API.' do
      context 'when processing Dutch' do
        subject(:corrector) { described_class.new(phase, idea_rows) }

        let(:idea_rows) do
          [
            {
              :id => 1, :title_multiloc => { :'nl-BE' => 'Test Sharon' }, :body_multiloc => { :'nl-BE' => 'me af of dit ook Ik Uraa Uraag werkt' }
            },
            {
              :id => 2, :title_multiloc => { :'nl-BE' => 'Test 5' }, :body_multiloc => { :'nl-BE' => 'Dit is nog een ingevuld test formulier' }
            },
            {
              :id => 3,
              :title_multiloc => { :'nl-BE' => 'Test 1' },
              :body_multiloc => { :'nl-BE' => 'Dit is een 2e harte test met het originele formulier' }
            }
          ]
        end

        it 'returns correct texts' do
          puts '### Dutch'
          pp 'Document AI output', idea_rows.map { _1[:body_multiloc][:'nl-BE'] }
          actual_texts = [
            'Ik vraag me af of dit ook werkt',
            'Dit is nog een ingevuld test formulier',
            # "harte" has a typo. It should be "harde"
            'Dit is een 2e harde test met het originele formulier'
          ]
          pp 'Actual texts', actual_texts
          corrected_texts = corrector.correct.map { _1[:body_multiloc][:'nl-BE'] }
          pp 'Corrected texts', corrected_texts

          expect(corrected_texts).to eq(actual_texts)
        end
      end

      context 'when processing English' do
        let(:idea_rows) do
          [
            {
              :id => 1,
              :title_multiloc => { :en => 'Another idea title' },
              :body_multiloc => { :en => 'Some noe des description here. Once upon small child by a time there was a the name "Bob" He lived in a of Castle by the side a large of mountain.' }
            },
            {
              :id => 2,
              :title_multiloc => { :en => 'This is a title and I like it' },
              :body_multiloc =>
              { :en =>
                'This should show how the text does on multiple get Jumbled Jumbled if you put stuff lines. you? Did nice holiday? How are have you a' }
            }
          ]
        end

        it 'returns correct texts' do
          puts '### English'
          pp 'Document AI output', idea_rows.map { _1[:body_multiloc][:en] }
          actual_texts = [
            'Some more description here. Once upon a time there was a small child by the name of "Bob". He lived in a Castle by the side of a large mountain.',
            'This should show how the text does get jumbled if you put stuff on multiple lines. How are you? Did you have a nice holiday?'
          ]
          pp 'Actual texts', actual_texts
          corrected_texts = corrector.correct.map { _1[:body_multiloc][:en] }
          pp 'Corrected texts', corrected_texts

          expect(corrected_texts).to eq(actual_texts)
        end
      end
    end
  end
end
