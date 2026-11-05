# frozen_string_literal: true

require 'rails_helper'

describe Analysis::TagStats do
  describe '#co_occurence_matrix' do
    it 'calculates co-occurrence matrix for tags' do
      analysis = create(:analysis)
      tag1, tag2, tag3 = create_list(:tag, 3, analysis: analysis)
      idea1, idea2, idea3 = create_list(:idea, 3, project: analysis.project)
      create(:tagging, tag: tag1, input: idea1)
      create(:tagging, tag: tag1, input: idea3)
      create(:tagging, tag: tag2, input: idea2)
      create(:tagging, tag: tag3, input: idea3)

      service = described_class.new(Analysis::Tag.all)

      expect(service.co_occurence_matrix).to eq({
        tag1 => {
          tag1 => { diff: 0, intersection: 2 },
          tag2 => { diff: 2, intersection: 0 },
          tag3 => { diff: 1, intersection: 1 }
        },
        tag2 => {
          tag1 => { diff: 1, intersection: 0 },
          tag2 => { diff: 0, intersection: 1 },
          tag3 => { diff: 1, intersection: 0 }
        },
        tag3 => {
          tag1 => { diff: 0, intersection: 1 },
          tag2 => { diff: 1, intersection: 0 },
          tag3 => { diff: 0, intersection: 1 }
        }
      })
    end
  end

  describe '#dependent_tags' do
    it 'identifies dependent tags based on co-occurrence' do
      analysis = create(:analysis)
      tag1, tag2, tag3, _tag4 = create_list(:tag, 4, analysis: analysis)
      idea1, idea2, idea3 = create_list(:idea, 3, project: analysis.project)
      create(:tagging, tag: tag1, input: idea1)
      create(:tagging, tag: tag1, input: idea3)
      create(:tagging, tag: tag2, input: idea2)
      create(:tagging, tag: tag2, input: idea3)
      create(:tagging, tag: tag3, input: idea3)

      service = described_class.new(Analysis::Tag.all)

      expect(service.dependent_tags).to eq({
        tag3 => [tag1, tag2]
      })
    end
  end
end
