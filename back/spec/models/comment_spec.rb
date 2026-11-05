# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Comment do
  it_behaves_like 'location_trackable_participation'

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

      create(:comment, idea: idea)

      expect(project.reload.comments_count).to eq 1
      expect(idea.reload.comments_count).to eq 1
    end

    it 'decrements the comments_count in project and idea for a deleted comment' do
      project = create(:project)
      idea = create(:idea, project: project)
      comment = create(:comment, idea: idea)

      expect(project.reload.comments_count).to eq 1
      expect(idea.reload.comments_count).to eq 1

      comment.update!(publication_status: 'deleted')

      expect(project.reload.comments_count).to eq 0
      expect(idea.reload.comments_count).to eq 0
    end

    it 'decrements the comments_count in project and idea for a destroyed comment' do
      project = create(:project)
      idea = create(:idea, project: project)
      comment = create(:comment, idea: idea)

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

  describe 'anonymous participation' do
    let(:author) { create(:user) }

    context 'creating comments that are not anonymous' do
      it 'has the same author hash for comments in different projects when the author is the same' do
        comment1 = create(:comment, author: author)
        comment2 = create(:comment, author: author)
        expect(comment1.author_hash).to eq comment2.author_hash
      end
    end

    context 'creating anonymous comments' do
      let(:project) { create(:project) }

      context 'ideas' do
        it 'has no author if set to anonymous' do
          comment = create(:comment, anonymous: true)
          expect(comment.author).to be_nil
        end

        it 'has the same author hash on each comment when the author and project are the same' do
          idea1 = create(:idea, project: project)
          idea2 = create(:idea, project: project)
          comment1 = create(:comment, author: author, idea: idea1, anonymous: true)
          comment2 = create(:comment, author: author, idea: idea2, anonymous: true)
          expect(comment1.author_hash).to eq comment2.author_hash
        end

        it 'has a different author hash for comments in different projects when the author is the same' do
          comment1 = create(:comment, author: author, anonymous: true)
          comment2 = create(:comment, author: author, anonymous: true)
          expect(comment1.author_hash).not_to eq comment2.author_hash
        end

        it 'has a different author hash for comments by the same author in the same project when one comment is anonymous and the other is not' do
          idea1 = create(:idea, project: project)
          idea2 = create(:idea, project: project)
          comment1 = create(:comment, author: author, idea: idea1)
          comment2 = create(:comment, author: author, idea: idea2, anonymous: true)
          expect(comment1.author_hash).not_to eq comment2.author_hash
        end
      end

      context 'updating comments' do
        it 'deletes the author if anonymous is updated' do
          comment = create(:comment)
          comment.update!(anonymous: true)
          expect(comment.author).to be_nil
        end

        it 'sets anonymous to false and changes the author hash if an author is supplied on update' do
          comment = create(:comment, anonymous: true)
          old_comment_hash = comment.author_hash
          comment.update!(author: author)
          expect(comment.author).not_to be_nil
          expect(comment.anonymous).to be false
          expect(comment.author_hash).not_to eq old_comment_hash
        end

        it 'generates a different author_hash if the author changes' do
          comment = create(:comment)
          old_comment_hash = comment.author_hash
          comment.update!(author: author)
          expect(comment.author_hash).not_to eq old_comment_hash
        end
      end
    end
  end
end
