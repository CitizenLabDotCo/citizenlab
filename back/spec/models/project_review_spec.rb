# frozen_string_literal: true

require 'rails_helper'
require 'test_prof/recipes/rspec/factory_default'

RSpec.describe ProjectReview do
  subject(:project_review) { build(:project_review) }

  it { is_expected.to be_valid }
  it { is_expected.to belong_to(:project) }
  it { is_expected.to belong_to(:reviewer).class_name('User').optional }
  it { is_expected.to validate_uniqueness_of(:project_id).case_insensitive }

  describe 'validations' do
    describe 'on create' do
      it 'is invalid without a requester' do
        project_review.requester = nil
        expect(project_review).not_to be_valid
        expect(project_review.errors[:requester]).to include('must be present')
      end
    end

    describe 'on update' do
      let(:project_review) { create(:project_review) }

      it 'allows nullifying the requester' do
        project_review.requester = nil
        expect(project_review).to be_valid
      end

      it 'prevents changing the requester' do
        project_review.requester = create(:user)
        expect(project_review).not_to be_valid
        expect(project_review.errors[:requester]).to include('cannot be changed')
      end

      it 'prevents changing the project' do
        project_review.project = create(:project)
        expect(project_review).not_to be_valid
        expect(project_review.errors[:project]).to include('cannot be changed')
      end

      it 'prevents removing approval' do
        project_review.approve!(create(:user))
        project_review.approved_at = nil
        expect(project_review).not_to be_valid
        expect(project_review.errors[:approved_at]).to include('cannot be removed once set (cannot remove approval)')
      end

      describe 'when approved' do
        let(:project_review) { create(:project_review, :approved) }

        it 'prevents changing the reviewer' do
          project_review.reviewer = create(:user)
          expect(project_review).not_to be_valid
          expect(project_review.errors[:reviewer]).to include('cannot be changed')
        end
      end
    end
  end

  it 'fails to remove approval' do
    review = create(:project_review, :approved)
    expect(review.update(approved_at: nil)).to be(false)
    expect(review.errors[:approved_at]).to include('cannot be removed once set (cannot remove approval)')
  end

  describe '#approved?' do
    it 'is not approved by default' do
      expect(project_review).not_to be_approved
      expect(project_review.approved_at).to be_nil
    end

    it 'can be approved' do
      project_review.approved_at = Time.current
      expect(project_review).to be_approved
    end
  end

  describe '#approve!' do
    it 'approves the project review' do
      old_reviewer = project_review.reviewer
      new_reviewer = create(:user)

      expect { project_review.approve!(new_reviewer) }
        .to  change(project_review, :approved_at).from(nil).to(be_within(1.second).of(Time.current))
        .and change(project_review, :reviewer).from(old_reviewer).to(new_reviewer)
        .and change(project_review, :approved?).from(false).to(true)

      expect(project_review.updated_at).to eq(project_review.approved_at)
    end

    it 'fails if the project review is already approved' do
      review = create(:project_review, :approved)
      expect { review.approve!(create(:user)) }
        .to raise_error(ActiveRecord::RecordInvalid)
        .with_message('Validation failed: Project review is already approved')
    end

    it 'fails to approve with nil reviewer' do
      review = create(:project_review)
      expect { review.approve!(nil) }
        .to raise_error(ActiveRecord::RecordInvalid)
        .with_message('Validation failed: Reviewer must be present when approving')
    end
  end
end
