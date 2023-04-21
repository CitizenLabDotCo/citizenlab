# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Comment do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:comment)).to be_valid
    end
  end

  describe 'body sanitizer' do
    it 'sanitizes script tags in the body' do
      comment = create(:comment, body_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script>'
      })
      expect(comment.body_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!' })
    end
  end

  describe 'counters' do
    it 'increments the comments_count in project and idea for a new published comment' do
      project = create(:project)
      idea = create(:idea, project: project)

      expect(project.comments_count).to eq 0
      expect(idea.comments_count).to eq 0

      create(:comment, post: idea)

      expect(project.reload.comments_count).to eq 1
      expect(idea.reload.comments_count).to eq 1
    end

    it 'decrements the comments_count in project and idea for a deleted comment' do
      project = create(:project)
      idea = create(:idea, project: project)
      comment = create(:comment, post: idea)

      expect(project.reload.comments_count).to eq 1
      expect(idea.reload.comments_count).to eq 1

      comment.update!(publication_status: 'deleted')

      expect(project.reload.comments_count).to eq 0
      expect(idea.reload.comments_count).to eq 0
    end

    it 'decrements the comments_count in project and idea for a destroyed comment' do
      project = create(:project)
      idea = create(:idea, project: project)
      comment = create(:comment, post: idea)

      expect(project.reload.comments_count).to eq 1
      expect(idea.reload.comments_count).to eq 1

      comment.destroy

      expect(project.reload.comments_count).to eq 0
      expect(idea.reload.comments_count).to eq 0
    end

    it 'support bulk counter fixing' do
      expect { described_class.counter_culture_fix_counts }.not_to raise_error
    end
  end
end
