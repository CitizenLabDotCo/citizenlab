# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::CommentsSummary do
  subject { comments_summary }

  let(:comments_summary) { build(:comments_summary) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  describe 'missing_comments_count' do
    subject { comments_summary.missing_comments_count }

    let(:project) { create(:project_with_active_ideation_phase) }
    let(:input) { create(:idea, project: project) }
    let(:comments) { create_list(:comment, 3, idea: input) }
    let(:comments_summary) { create(:comments_summary, idea: input, comments_ids: comments.map(&:id)) }

    context 'when the comments didn\'t change' do
      it { is_expected.to eq 0 }
    end

    context 'when comments were added' do
      before do
        create_list(:comment, 2, idea: input)
        input.reload
      end

      it { is_expected.to eq 2 }
    end

    context 'when comments were deleted' do
      before do
        comments.first.destroy!
      end

      it { is_expected.to eq 0 }
    end
  end
end
