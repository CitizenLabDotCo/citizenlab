# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Topic do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:topic)).to be_valid
    end
  end

  it { is_expected.to validate_presence_of(:title_multiloc) }

  describe 'order_ideas_count' do
    # topic 0: ideas 1, 3, 6 (3)
    # topic 1: / (0)
    # topic 2: ideas 1, 2, 4, 5 (4)
    # topic 3: idea 6 (1)
    # topic 4: ideas 2, 4, 5 (3)
    # topic 5: ideas 1, 2, 3, 4, 5 (5)
    let_it_be(:topics) { create_list(:topic, 6) }
    let_it_be(:idea1) { create(:idea, topics: [topics[0], topics[2], topics[5]]) }
    let_it_be(:idea2) { create(:idea, topics: [topics[2], topics[4], topics[5]]) }
    let_it_be(:idea3) { create(:idea, topics: [topics[0], topics[5]]) }
    let_it_be(:idea4) { create(:idea, topics: [topics[2], topics[4], topics[5]]) }
    let_it_be(:idea5) { create(:idea, topics: [topics[2], topics[4], topics[5]]) }
    let_it_be(:idea6) { create(:idea, topics: [topics[0], topics[3]]) }

    it 'sorts from fewest ideas to most ideas when asking asc' do
      sorted_topics = described_class.order_ideas_count(Idea.where(id: [idea2.id, idea3.id, idea4.id, idea5.id, idea6.id]), direction: :asc)
      expect(sorted_topics.size).to eq 6
      # topics[1]: 0 ideas, topics[3]: 1 idea, topics[0]: 2 ideas, topics[2] & topics[4]: 3 ideas each (tied), topics[5]: 4 ideas
      expect(sorted_topics.map(&:id).take(3)).to eq [topics[1].id, topics[3].id, topics[0].id]
      expect(sorted_topics.map(&:id)[3..4]).to match_array [topics[2].id, topics[4].id]
      expect(sorted_topics.map(&:id).last).to eq topics[5].id
    end

    it 'sorts from most ideas to fewest ideas when asking desc' do
      sorted_topics = described_class.order_ideas_count(Idea.where(id: [idea1.id, idea3.id, idea6.id]), direction: :desc)
      expect(sorted_topics.size).to eq 6
      expect(sorted_topics.map(&:id).take(3)).to eq [topics[0].id, topics[5].id, topics[2].id]
    end
  end
end
