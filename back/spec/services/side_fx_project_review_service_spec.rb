# frozen_string_literal: true

require 'rails_helper'

describe SideFxProjectReviewService do
  let(:service) { described_class.new }
  # Reloading the user bc the db persists timestamps with a lower precision
  let(:user) { create(:admin).reload }
  let(:review) { create(:project_review) }

  describe 'after_create' do
    it "logs a 'created' activity job" do
      expect { service.after_create(review, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(review, 'created', user, review.created_at.to_i, { project_id: review.project_id })
    end
  end

  describe 'after_update' do
    include SideFxHelper

    it "logs a 'changed' activity job" do
      # A review can be approved by someone other than the assigned reviewer.
      original_reviewer = review.reviewer
      review.approve!(user)

      expect { service.after_update(review, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(review, 'changed', user, review.updated_at.to_i, {
          project_id: review.project_id,
          payload: {
            project_review: clean_time_attributes(review.attributes),
            change: hash_including(
              approved_at: [nil, review.approved_at],
              reviewer_id: [original_reviewer.id, review.reviewer_id],
              updated_at: [anything, review.approved_at]
            )
          }
        })
    end
  end

  describe 'after_destroy' do
    include SideFxHelper

    it "logs a 'deleted' activity job" do
      frozen_review = review.destroy!

      expect { service.after_destroy(frozen_review, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          "ProjectReview/#{frozen_review.id}", 'deleted', user, frozen_review.updated_at.to_i,
          { payload: { project_review: clean_time_attributes(frozen_review.attributes) } }
        )
    end
  end
end
