# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Comment do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:internal_comment)).to be_valid
    end
  end

  describe 'body sanitizer' do
    it 'sanitizes script tags in the body' do
      internal_comment = create(:internal_comment, body: '<p>Test</p><script>The script tags should be removed!</script>')
      expect(internal_comment.body).to eq('<p>Test</p>The script tags should be removed!')
    end
  end

  describe 'counters' do
    it 'increments the internal_comments_count of idea for a new published internal_comment' do
      idea = create(:idea, project: create(:project))

      expect(idea.internal_comments_count).to eq 0

      create(:internal_comment, idea: idea)

      expect(idea.reload.internal_comments_count).to eq 1
    end

    it 'decrements the internal_comments_count of idea for a deleted internal_comment' do
      idea = create(:idea, project: create(:project))
      internal_comment = create(:internal_comment, idea: idea)

      expect(idea.reload.internal_comments_count).to eq 1

      internal_comment.update!(publication_status: 'deleted')

      expect(idea.reload.internal_comments_count).to eq 0
    end

    it 'decrements the internal_comments_count of idea for a destroyed internal_comment' do
      idea = create(:idea, project: create(:project))
      internal_comment = create(:internal_comment, idea: idea)

      expect(idea.reload.internal_comments_count).to eq 1

      internal_comment.destroy

      expect(idea.reload.internal_comments_count).to eq 0
    end

    it 'supports bulk counter fixing' do
      expect { described_class.counter_culture_fix_counts }.not_to raise_error
    end
  end
end
