# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::SummarizationMethod do
  describe 'Bogus summarization' do
    it 'works' do
      analysis = create(:analysis, custom_fields: [create(
        :custom_field,
        :for_custom_form,
        code: 'title_multiloc',
        key: 'title_multiloc'
      )])

      summarization_task = create(
        :summarization_task,
        analysis: analysis,
        state: 'queued',
        summary: create(:summary, analysis: analysis, summary: nil, summarization_method: 'bogus', filters: { comments_from: 5 })
      )
      with_options project: summarization_task.analysis.project do
        create(:idea, comments_count: 5)
        create(:idea, comments_count: 10)
        create(:idea, comments_count: 0)
      end

      summarization_method = Analysis::SummarizationMethod::Base.for_summarization_method(
        'bogus',
        summarization_task
      )

      expect { summarization_method.execute }
        .to change { summarization_task.summary.summary }.from(nil).to(kind_of(String))

      summarization_task.reload
      expect(summarization_task.summary.summary.split.length).to eq 2
      expect(summarization_task).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
    end
  end

  describe 'Gpt4 summarization' do
    it 'works' do
      analysis = create(:analysis, custom_fields: [create(
        :custom_field,
        :for_custom_form,
        code: 'title_multiloc',
        key: 'title_multiloc'
      )])

      summarization_task = create(
        :summarization_task,
        analysis: analysis,
        state: 'queued',
        summary: create(:summary, analysis: analysis, summary: nil, summarization_method: 'gpt4', filters: { comments_from: 5 })
      )
      idea3 = with_options project: summarization_task.analysis.project do
        create(:idea, comments_count: 5)
        create(:idea, comments_count: 0)
        create(:idea, comments_count: 10)
      end

      mock_openai_api = instance_double(Analysis::OpenaiApi)
      summarization_method = Analysis::SummarizationMethod::Base.for_summarization_method(
        'gpt4',
        summarization_task,
        openai_api: mock_openai_api
      )

      expect(mock_openai_api).to receive(:chat).with(anything) do |value|
        expect(value.dig(:parameters, :messages, 0, :content)).to include(idea3.id)
        value[:parameters][:stream].call({
          'choices' => [
            'delta' => {
              'content' => 'Complete'
            }
          ]
        })
        value[:parameters][:stream].call({
          'choices' => [
            'delta' => {
              'content' => ' summary'
            }
          ]
        })
      end

      expect { summarization_method.execute }
        .to change { summarization_task.summary.summary }.from(nil).to('Complete summary')
        .and change { summarization_task.summary.prompt }.from(nil).to(kind_of(String))

      expect(summarization_task).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
    end
  end
end
