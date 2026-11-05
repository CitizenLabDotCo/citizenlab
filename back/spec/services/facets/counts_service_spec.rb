# frozen_string_literal: true

require 'rails_helper'

describe Facets::CountsService do
  describe '#counts' do
    let(:status_facet) { Facets::Column.new(:idea_status_id) }
    let(:topic_facet) { Facets::IdeaInputTopic.new }
    let(:facets) { [status_facet, topic_facet] }
    let(:project) { create(:project) }
    let(:status1) { create(:idea_status) }
    let(:status2) { create(:idea_status) }
    let(:input_topic1) { create(:input_topic, project:) }
    let(:input_topic2) { create(:input_topic, project:) }

    before do
      create(:idea, project:, idea_status: status1, input_topics: [input_topic1])
      create(:idea, project:, idea_status: status2, input_topics: [input_topic1, input_topic2])
      create(:idea, project:, idea_status: status2, input_topics: [input_topic2])
    end

    it 'counts each facet on its own scope and the total on the records' do
      # Topic 1 is selected: the status facet counts within that selection, the
      # topic facet ignores it.
      with_topic1 = Idea.with_some_input_topics([input_topic1])

      expect(described_class.new.counts(with_topic1, { status_facet => with_topic1, topic_facet => Idea.all })).to eq({
        'idea_status_id' => { status1.id => 1, status2.id => 1 },
        'input_topic_id' => { input_topic1.id => 2, input_topic2.id => 2 },
        'total' => 2
      })
    end

    it 'returns empty counts for a scope without records' do
      expect(described_class.new.counts(Idea.none, facets.index_with { Idea.none })).to eq({
        'idea_status_id' => {},
        'input_topic_id' => {},
        'total' => 0
      })
    end

    it 'counts a searched scope' do
      create(:idea, project:, idea_status: status1, title_multiloc: { 'en' => 'Repaint the lighthouse' })
      searched = Idea.search_by_all('lighthouse')

      expect(described_class.new.counts(searched, facets.index_with { searched })['total']).to eq 1
    end
  end
end
