# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputTopic do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:input_topic)).to be_valid
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
    let_it_be(:project) { create(:project) }
    let_it_be(:input_topics) { create_list(:input_topic, 6, project:) }
    let_it_be(:idea1) { create(:idea, project:, input_topics: [input_topics[0], input_topics[2], input_topics[5]]) }
    let_it_be(:idea2) { create(:idea, project:, input_topics: [input_topics[2], input_topics[4], input_topics[5]]) }
    let_it_be(:idea3) { create(:idea, project:, input_topics: [input_topics[0], input_topics[5]]) }
    let_it_be(:idea4) { create(:idea, project:, input_topics: [input_topics[2], input_topics[4], input_topics[5]]) }
    let_it_be(:idea5) { create(:idea, project:, input_topics: [input_topics[2], input_topics[4], input_topics[5]]) }
    let_it_be(:idea6) { create(:idea, project:, input_topics: [input_topics[0], input_topics[3]]) }

    it 'sorts from fewest ideas to most ideas when asking asc' do
      sorted_topics = described_class.order_ideas_count(Idea.where(id: [idea2.id, idea3.id, idea4.id, idea5.id, idea6.id]), direction: :asc)
      expect(sorted_topics.size).to eq 6
      # input_topics[1]: 0 ideas, input_topics[3]: 1 idea, input_topics[0]: 2 ideas, input_topics[2] & input_topics[4]: 3 ideas each (tied), input_topics[5]: 4 ideas
      expect(sorted_topics.map(&:id).take(3)).to eq [input_topics[1].id, input_topics[3].id, input_topics[0].id]
      expect(sorted_topics.map(&:id)[3..4]).to contain_exactly(input_topics[2].id, input_topics[4].id)
      expect(sorted_topics.map(&:id).last).to eq input_topics[5].id
    end

    it 'sorts from most ideas to fewest ideas when asking desc' do
      sorted_topics = described_class.order_ideas_count(Idea.where(id: [idea1.id, idea3.id, idea6.id]), direction: :desc)
      expect(sorted_topics.size).to eq 6
      expect(sorted_topics.map(&:id).take(2)).to eq [input_topics[0].id, input_topics[5].id]
      expect([input_topics[2].id, input_topics[3].id]).to include(sorted_topics.map(&:id)[2]) # either topic 2 or 3 (tied with 1 idea each)
    end
  end
end
