# frozen_string_literal: true

require 'rails_helper'

describe Facets::IdeaInputTopic do
  describe '#counts' do
    let(:project) { create(:project) }
    let(:parent_topic) { create(:input_topic, project:) }
    let(:child_topic) { create(:input_topic, project:, parent: parent_topic) }
    let(:other_topic) { create(:input_topic, project:) }

    it 'counts the ideas per topic' do
      create(:idea, project:, input_topics: [other_topic])
      create(:idea, project:, input_topics: [other_topic, parent_topic])

      expect(described_class.new.counts(Idea.all)).to eq({ other_topic.id => 2, parent_topic.id => 1 })
    end

    it 'counts the ideas of a child topic for its parent as well' do
      create(:idea, project:, input_topics: [child_topic])
      create(:idea, project:, input_topics: [parent_topic])

      expect(described_class.new.counts(Idea.all)).to eq({ parent_topic.id => 2, child_topic.id => 1 })
    end

    it 'counts an idea tagged with a parent topic and one of its children once for the parent' do
      idea = create(:idea, project:, input_topics: [child_topic])
      # Bypasses the join model, which would drop the parent tag.
      IdeasInputTopic.insert({ idea_id: idea.id, input_topic_id: parent_topic.id })

      expect(described_class.new.counts(Idea.all)).to eq({ parent_topic.id => 1, child_topic.id => 1 })
    end

    it 'only counts the ideas in the scope' do
      create(:idea, project:, input_topics: [other_topic])
      create(:idea, input_topics: [other_topic])

      expect(described_class.new.counts(Idea.where(project:))).to eq({ other_topic.id => 1 })
    end
  end
end
