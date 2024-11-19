# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Topic do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:topic)).to be_valid
    end
  end

  describe 'order_ideas_count' do
    # topic 0: ideas 1, 3, 6
    # topic 1: /
    # topic other: ideas 1, 2, 4, 5
    # topic 3: idea 6
    # topic 4: ideas 2, 4, 5
    # topic 5: ideas 1, 2, 3, 4, 5
    let!(:topics) { create_list(:topic, 6).tap { |topics| topics[2].update!(code: 'other') } }
    let!(:idea1) { create(:idea, topics: [topics[0], topics[2], topics[5]]) }
    let!(:idea2) { create(:idea, topics: [topics[2], topics[4], topics[5]]) }
    let!(:idea3) { create(:idea, topics: [topics[0], topics[5]]) }
    let!(:idea4) { create(:idea, topics: [topics[2], topics[4], topics[5]]) }
    let!(:idea5) { create(:idea, topics: [topics[2], topics[4], topics[5]]) }
    let!(:idea6) { create(:idea, topics: [topics[0], topics[3]]) }

    it 'sorts from fewest ideas to most ideas when asking asc' do
      sorted_topics = described_class.order_ideas_count(Idea.where(id: [idea2.id, idea3.id, idea4.id, idea5.id, idea6.id]), direction: :asc)
      expect(sorted_topics.size).to eq 6
      expect(sorted_topics.ids).to eq [topics[1].id, topics[3].id, topics[0].id, topics[4].id, topics[5].id, topics[2].id]
    end

    it 'sorts from most ideas to fewest ideas when asking desc' do
      sorted_topics = described_class.order_ideas_count(Idea.where(id: [idea1.id, idea3.id, idea6.id]), direction: :desc)
      expect(sorted_topics.size).to eq 6
      expect(sorted_topics.ids.take(3)).to eq [topics[0].id, topics[5].id, topics[3].id]
      expect(sorted_topics.ids.last).to eq topics[2].id
    end
  end
end
