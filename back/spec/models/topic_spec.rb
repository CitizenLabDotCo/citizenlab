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
    # topic other: ideas 1, 2, 4, 5 (4)
    # topic 3: idea 6 (1)
    # topic 4: ideas 2, 4, 5 (3)
    # topic 5: ideas 1, 2, 3, 4, 5 (5)
    let_it_be(:topics) { create_list(:topic, 6, code: Topic::DEFAULT_CODES[0]).tap { |topics| topics[2].update!(code: 'other') } }
    let_it_be(:idea1) { create(:idea, topics: [topics[0], topics[2], topics[5]]) }
    let_it_be(:idea2) { create(:idea, topics: [topics[2], topics[4], topics[5]]) }
    let_it_be(:idea3) { create(:idea, topics: [topics[0], topics[5]]) }
    let_it_be(:idea4) { create(:idea, topics: [topics[2], topics[4], topics[5]]) }
    let_it_be(:idea5) { create(:idea, topics: [topics[2], topics[4], topics[5]]) }
    let_it_be(:idea6) { create(:idea, topics: [topics[0], topics[3]]) }

    it 'sorts from fewest ideas to most ideas when asking asc' do
      sorted_topics = described_class.order_ideas_count(Idea.where(id: [idea2.id, idea3.id, idea4.id, idea5.id, idea6.id]), direction: :asc)
      expect(sorted_topics.size).to eq 6
      expect(sorted_topics).to eq [topics[1], topics[3], topics[0], topics[4], topics[5], topics[2]]
    end

    it 'sorts from most ideas to fewest ideas when asking desc' do
      sorted_topics = described_class.order_ideas_count(Idea.where(id: [idea1.id, idea3.id, idea6.id]), direction: :desc)
      expect(sorted_topics.size).to eq 6
      expect(sorted_topics.map(&:id).take(3)).to eq [topics[0].id, topics[5].id, topics[3].id]
      expect(sorted_topics.map(&:id).last).to eq topics[2].id
    end
  end

  describe 'sanitization of simple multilocs' do
    let(:multiloc) do
      {
        'en' => 'Something <script>alert("XSS")</script> something',
        'fr-BE' => 'Something <img src=x onerror=alert(1)>',
        'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
      }
    end

    shared_examples 'sanitizes HTML in multiloc' do |field_name, options = {}|
      it "removes all HTML tags from #{field_name}" do
        topic = build(:topic, field_name => multiloc)
        topic.save!

        expect(topic.public_send(field_name)['en']).to eq('Something alert("XSS") something')

        # Use different expectation for fr-BE based on options
        if options[:strip_spaces]
          expect(topic.public_send(field_name)['fr-BE']).to eq('Something')
        else
          expect(topic.public_send(field_name)['fr-BE']).to eq('Something ')
        end

        expect(topic.public_send(field_name)['nl-BE']).to eq('Plain text with formatting')
      end
    end

    include_examples 'sanitizes HTML in multiloc', :description_multiloc
    include_examples 'sanitizes HTML in multiloc', :title_multiloc, strip_spaces: true
  end
end
