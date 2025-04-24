# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::QAndAMethod do
  describe 'Bogus q_and_a' do
    it 'works' do
      analysis = create(:analysis, main_custom_field: create(
        :custom_field,
        :for_custom_form,
        code: 'title_multiloc',
        key: 'title_multiloc'
      ))

      q_and_a_task = create(
        :q_and_a_task,
        analysis: analysis,
        state: 'queued',
        question: create(:analysis_question, question: 'Are there other suggestions?', q_and_a_method: 'bogus', insight_attributes: { analysis: analysis, filters: { comments_from: 5 } })
      )
      with_options project: q_and_a_task.analysis.project do
        create(:idea, comments_count: 5)
        create(:idea, comments_count: 10)
        create(:idea, comments_count: 0)
      end

      plan = Analysis::QAndAPlan.new(
        q_and_a_method_class: Analysis::QAndAMethod::Bogus
      )

      q_and_a_method = Analysis::QAndAMethod::Bogus.new(q_and_a_task.question)

      expect { q_and_a_method.execute(plan) }
        .to change { q_and_a_task.question.answer }.from(nil).to(kind_of(String))

      q_and_a_task.reload
      expect(q_and_a_task.question.answer.split.length).to eq 2
      expect(q_and_a_task).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
    end
  end

  describe 'OnePassLLM q_and_a' do
    let(:analysis) do
      create(:analysis, main_custom_field: create(
        :custom_field,
        :for_custom_form,
        code: 'title_multiloc',
        key: 'title_multiloc'
      ))
    end
    let(:question) { create(:analysis_question, q_and_a_method: 'one_pass_llm', question: 'What is the most popular theme?', insight_attributes: { analysis: analysis, filters: { comments_from: 5 } }) }
    let(:q_and_a_task) { create(:q_and_a_task, analysis: analysis, state: 'queued', question: question) }
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
      plan = Analysis::QAndAMethod::OnePassLLM.new(question).generate_plan
      expect(plan).to have_attributes({
        q_and_a_method_class: Analysis::QAndAMethod::OnePassLLM,
        llm: kind_of(Analysis::LLM::Base),
        accuracy: 0.8,
        include_id: true,
        shorten_labels: false,
        include_comments: true
      })

      mock_llm = instance_double(Analysis::LLM::GPT41)
      plan.llm = mock_llm
      expect(mock_llm).to receive(:chat_async).with(kind_of(String)) do |prompt, &block|
        expect(prompt).to include(inputs[2].id)
        expect(prompt).to include('What is the most popular theme?')
        block.call 'Nothing'
        block.call ' else'
      end

      expect { plan.q_and_a_method_class.new(question).execute(plan) }
        .to change { q_and_a_task.question.answer }.from(nil).to('Nothing else')
        .and change { q_and_a_task.question.prompt }.from(nil).to(kind_of(String))
        .and change { q_and_a_task.question.accuracy }.from(nil).to(0.8)
        .and change { q_and_a_task.question.inputs_ids }.from(nil).to(match_array([inputs[1].id, inputs[2].id]))

      expect(q_and_a_task.reload).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
    end

    it 'includes the comments in the prompt' do
      create(:comment, idea: inputs[1], body_multiloc: { en: 'I want to comment on that' })

      plan = Analysis::QAndAMethod::OnePassLLM.new(question).generate_plan
      mock_llm = instance_double(Analysis::LLM::GPT41)
      plan.llm = mock_llm
      expect(mock_llm).to receive(:chat_async) do |prompt|
        expect(prompt).to include('I want to comment on that')
      end
      plan.q_and_a_method_class.new(question).execute(plan)
    end
  end
end
