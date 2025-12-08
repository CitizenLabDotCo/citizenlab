require 'rails_helper'

describe IdeasCountService do
  describe '#counts' do
    let(:topic1) { create(:topic) }
    let(:topic2) { create(:topic) }

    let!(:idea1) { create(:idea, topics: [topic1]) }
    let!(:idea2) { create(:idea, topics: [topic1, topic2]) }

    it 'returns the expected result' do
      result = described_class.counts(Idea.all)

      expect(result).to eq({
        'idea_status_id' => {
          idea1.idea_status_id => 1,
          idea2.idea_status_id => 1
        },
        'topic_id' => {
          topic1.id => 2,
          topic2.id => 1
        }
      })
    end
  end
end
