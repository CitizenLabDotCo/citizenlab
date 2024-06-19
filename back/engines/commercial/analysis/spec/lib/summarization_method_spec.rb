# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::SummarizationMethod do
  describe 'Bogus summarization' do
    it 'works' do
      analysis = create(:analysis, main_custom_field: create(
        :custom_field,
        :for_custom_form,
        code: 'title_multiloc',
        key: 'title_multiloc'
      ))

      summarization_task = create(
        :summarization_task,
        analysis: analysis,
        state: 'queued',
        summary: create(:summary, summary: nil, summarization_method: 'bogus', insight_attributes: { analysis: analysis, filters: { comments_from: 5 } })
      )
      with_options project: summarization_task.analysis.project do
        create(:idea, comments_count: 5)
        create(:idea, comments_count: 10)
        create(:idea, comments_count: 0)
      end

      plan = Analysis::SummarizationPlan.new(
        summarization_method_class: Analysis::SummarizationMethod::Bogus
      )

      summarization_method = Analysis::SummarizationMethod::Bogus.new(summarization_task.summary)

      expect { summarization_method.execute(plan) }
        .to change { summarization_task.summary.summary }.from(nil).to(kind_of(String))

      summarization_task.reload
      expect(summarization_task.summary.summary.split.length).to eq 2
      expect(summarization_task).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
    end
  end

  describe 'OnePassLLM summarization' do
    let(:analysis) do
      create(:analysis, main_custom_field: create(
        :custom_field,
        :for_custom_form,
        code: 'title_multiloc',
        key: 'title_multiloc'
      ))
    end
    let(:summary) { create(:summary, summary: nil, summarization_method: 'one_pass_llm', insight_attributes: { analysis: analysis, filters: { comments_from: 5 } }) }
    let(:summarization_task) { create(:summarization_task, analysis: analysis, state: 'queued', summary: summary) }
    let(:inputs) do
      with_options project: analysis.project do
        [
          create(:idea, comments_count: 0),
          create(:idea, comments_count: 5),
          create(:idea, comments_count: 10)
        ]
      end
    end

    it 'works' do
      plan = Analysis::SummarizationMethod::OnePassLLM.new(summary).generate_plan
      expect(plan).to have_attributes({
        summarization_method_class: Analysis::SummarizationMethod::OnePassLLM,
        llm: kind_of(Analysis::LLM::Base),
        accuracy: 0.8,
        include_id: true,
        shorten_labels: false
      })

      mock_llm = instance_double(Analysis::LLM::GPT4Turbo)
      plan.llm = mock_llm
      expect(mock_llm).to receive(:chat_async).with(kind_of(String)) do |prompt, &block|
        expect(prompt).to include(inputs[2].id)
        block.call 'Complete'
        block.call ' summary'
      end

      mock_locale = instance_double(Locale)
      expect(Locale)
        .to receive(:monolingual)
        .and_return(mock_locale)
      expect(mock_locale).to receive(:language_copy).and_return('High Valyrian')
      expect_any_instance_of(Analysis::LLM::Prompt)
        .to receive(:fetch)
        .with('summarization', project_title: kind_of(String), inputs_text: kind_of(String), language: 'High Valyrian')
        .and_call_original

      expect { plan.summarization_method_class.new(summary).execute(plan) }
        .to change { summarization_task.summary.summary }.from(nil).to('Complete summary')
        .and change { summarization_task.summary.prompt }.from(nil).to(kind_of(String))
        .and change { summarization_task.summary.accuracy }.from(nil).to(0.8)
        .and change { summarization_task.summary.inputs_ids }.from(nil).to(match_array([inputs[1].id, inputs[2].id]))

      expect(summarization_task.reload).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
    end
  end
end
