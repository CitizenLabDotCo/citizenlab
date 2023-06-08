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
      comment = create(:internal_comment, body_text: '<p>Test</p><script>The script tags should be removed!</script>')
      expect(comment.body_text).to eq('<p>Test</p>The script tags should be removed!')
    end
  end

  describe 'counters' do
    it 'increments the internal_comments_count in project and idea for a new published internal_comment' do
      project = create(:project)
      idea = create(:idea, project: project)

      expect(project.internal_comments_count).to eq 0
      expect(idea.internal_comments_count).to eq 0

      create(:internal_comment, post: idea)

      expect(project.reload.internal_comments_count).to eq 1
      expect(idea.reload.internal_comments_count).to eq 1
    end

    it 'decrements the internal_comments_count in project and idea for a deleted internal_comment' do
      project = create(:project)
      idea = create(:idea, project: project)
      comment = create(:internal_comment, post: idea)

      expect(project.reload.internal_comments_count).to eq 1
      expect(idea.reload.internal_comments_count).to eq 1

      comment.update!(publication_status: 'deleted')

      expect(project.reload.internal_comments_count).to eq 0
      expect(idea.reload.internal_comments_count).to eq 0
    end

    it 'decrements the internal_comments_count in project and idea for a destroyed internal_comment' do
      project = create(:project)
      idea = create(:idea, project: project)
      comment = create(:internal_comment, post: idea)

      expect(project.reload.internal_comments_count).to eq 1
      expect(idea.reload.internal_comments_count).to eq 1

      comment.destroy

      expect(project.reload.internal_comments_count).to eq 0
      expect(idea.reload.internal_comments_count).to eq 0
    end

    it 'supports bulk counter fixing' do
      expect { described_class.counter_culture_fix_counts }.not_to raise_error
    end
  end
end
