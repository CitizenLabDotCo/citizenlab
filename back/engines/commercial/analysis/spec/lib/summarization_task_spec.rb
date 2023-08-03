# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::SummarizationTask do
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

      expect { summarization_task.execute }
        .to change { summarization_task.summary.summary }.from(nil).to(kind_of(String))

      summarization_task.reload
      expect(summarization_task.summary.summary.split.length).to eq 2
      expect(summarization_task).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
    end
  end
end
