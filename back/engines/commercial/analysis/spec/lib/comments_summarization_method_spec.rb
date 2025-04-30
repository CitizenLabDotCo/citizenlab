# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::CommentsSummarizationMethod do
  describe 'Bogus summarization' do
    it 'works' do
      input = create(:idea)
      create_list(:comment, 5, idea: input)

      comments_summary = create(:comments_summary, idea: input, summary: nil)

      summarization_method = Analysis::CommentsSummarizationMethod::Bogus.new(comments_summary)

      expect { summarization_method.execute }
        .to change { comments_summary.summary }.from(nil).to(kind_of(String))
      expect(comments_summary.reload.summary.split.size).to eq 5
      expect(comments_summary.background_task).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
    end
  end

  describe 'OnePassLLM summarization' do
    it 'works' do
      input = create(:idea)
      create_list(:comment, 3, idea: input)

      comments_summary = create(:comments_summary, idea: input, summary: nil)

      mock_llm = Analysis::LLM::GPT41.new
      summarization_method = Analysis::CommentsSummarizationMethod::OnePassLLM.new(comments_summary, llm: mock_llm)
      expect(mock_llm).to receive(:chat_async).with(kind_of(String)) do |prompt, &block|
        expect(prompt).to include('a very good idea')
        block.call 'Complete'
        block.call ' summary'
      end

      expect { summarization_method.execute }
        .to change { comments_summary.summary }.from(nil).to('Complete summary')
        .and change { comments_summary.prompt }.from(nil).to(kind_of(String))
        .and change { comments_summary.accuracy }.from(nil).to(0.8)
        .and change { comments_summary.reload.generated_at }.from(nil).to(be_present)

      expect(comments_summary.background_task).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
    end
  end
end
