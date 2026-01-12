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
  end
end
