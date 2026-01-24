require 'rails_helper'

describe IdeasCountService do
  describe '#counts' do
    let(:project) { create(:project) }
    let(:input_topic1) { create(:input_topic, project: project) }
    let(:input_topic2) { create(:input_topic, project: project) }

    let!(:idea1) { create(:idea, project: project, input_topics: [input_topic1]) }
    let!(:idea2) { create(:idea, project: project, input_topics: [input_topic1, input_topic2]) }

    it 'returns the expected result' do
      result = described_class.counts(Idea.all)

      expect(result).to eq({
        'idea_status_id' => {
          idea1.idea_status_id => 1,
          idea2.idea_status_id => 1
        },
        'input_topic_id' => {
          input_topic1.id => 2,
          input_topic2.id => 1
        }
      })
    end

    it 'aggregates child input topic counts to parent topics' do
      parent_topic = create(:input_topic, project: project)
      child_topic = create(:input_topic, project: project, parent: parent_topic)

      create(:idea, project: project, input_topics: [child_topic])

      result = described_class.counts(Idea.all, ['input_topic_id'])

      expect(result['input_topic_id'][child_topic.id]).to eq(1)
      expect(result['input_topic_id'][parent_topic.id]).to eq(1)
    end
  end
end
