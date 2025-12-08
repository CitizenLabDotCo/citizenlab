# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::QAndAMethod do
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

    it 'generates a Q&A plan with default parameters' do
      plan = Analysis::QAndAMethod::OnePassLLM.new(question).generate_plan
      expect(plan).to have_attributes({
        q_and_a_method_class: Analysis::QAndAMethod::OnePassLLM,
        llm: kind_of(Analysis::LLM::Base),
        accuracy: 0.8,
        include_id: true,
        shorten_labels: false,
        include_comments: true
      })

      mock_llm = instance_double(Analysis::LLM::GPT41).tap do |llm|
        expect(llm).to receive(:chat_async) do |message, &block|
          prompt = message.inputs.sole
          expect(prompt).to include(inputs[2].id)
          expect(prompt).to include('What is the most popular theme?')

          block.call 'Nothing'
          block.call ' else'
        end
      end

      plan.llm = mock_llm

      expect { plan.q_and_a_method_class.new(question).execute(plan) }
        .to change { q_and_a_task.question.answer }.from(nil).to('Nothing else')
        .and change { q_and_a_task.question.prompt }.from(nil).to(kind_of(String))
        .and change { q_and_a_task.question.accuracy }.from(nil).to(0.8)
        .and change { q_and_a_task.question.inputs_ids }.from(nil).to(contain_exactly(inputs[1].id, inputs[2].id))

      expect(q_and_a_task.reload).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
    end

    it 'includes the comments in the prompt' do
      create(:comment, idea: inputs[1], body_multiloc: { en: 'I want to comment on that' })

      mock_llm = instance_double(Analysis::LLM::GPT41).tap do |llm|
        expect(llm).to receive(:chat_async) do |message|
          prompt = message.inputs.sole
          expect(prompt).to include('I want to comment on that')
        end
      end

      plan = Analysis::QAndAMethod::OnePassLLM.new(question).generate_plan
      plan.llm = mock_llm

      plan.q_and_a_method_class.new(question).execute(plan)
    end
  end
end
