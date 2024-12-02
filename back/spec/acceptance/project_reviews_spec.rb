# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project reviews' do
  explanation <<~EXPLANATION
    Lightweight reviews for projects which are used to give a formal approval before a project can be published.
  EXPLANATION

  before do
    header 'Content-Type', 'application/json'
  end

  post 'web_api/v1/projects/:project_id/review' do
    before { admin_header_token }

    with_options scope: :project_review do
      parameter :reviewer_id, <<~DESC, required: false
        The ID of the user to whom the review request is assigned.
      DESC
    end

    let(:project) { create(:project) }
    let(:project_id) { project.id }

    example 'Create a review request for the project' do
      side_fx = SideFxProjectReviewService.new
      allow(SideFxProjectReviewService).to receive(:new).and_return(side_fx)
      expect(side_fx).to receive(:before_create).and_call_original
      expect(side_fx).to receive(:after_create).and_call_original

      do_request

      assert_status 201
      review = ProjectReview.find(response_data[:id])
      expect(review.project_id).to eq(project_id)
      expect(review).not_to be_approved
    end

    example 'Create a review request with a specific reviewer', document: false do
      reviewer = create(:admin)

      do_request(project_review: { reviewer_id: reviewer.id })
      assert_status 201

      review = ProjectReview.find(response_data[:id])
      expect(review.reviewer_id).to eq(reviewer.id)
    end

    example '[error] Prevent creating multiple reviews for the same project', document: false do
      create(:project_review, project: project)
      do_request
      assert_status 422
      expect(json_response_body).to match(errors: { project_id: ['has already been taken'] })
    end
  end

  get 'web_api/v1/projects/:project_id/review' do
    before { admin_header_token }

    describe 'when the project has a review' do
      let!(:project_review) { create(:project_review) }
      let(:project_id) { project_review.project_id }

      example_request 'Get a project review' do
        assert_status 200
        expect(response_data).to match(
          id: project_review.id,
          type: 'project_review',
          attributes: {
            state: project_review.state,
            approved_at: project_review.approved_at&.iso8601(3),
            created_at: project_review.created_at.iso8601(3),
            updated_at: project_review.updated_at.iso8601(3)
          },
          relationships: {
            project: { data: { id: project_review.project_id, type: 'project' } },
            requester: { data: { id: project_review.requester_id, type: 'user' } },
            reviewer: { data: { id: project_review.reviewer_id, type: 'user' } }
          }
        )
      end
    end

    describe 'when the project does not have a review' do
      let(:project_id) { create(:project).id }

      example 'No Content (204)', document: false do
        do_request
        assert_status 204
      end
    end
  end

  patch 'web_api/v1/projects/:project_id/review' do
    before do
      @user = create(:admin)
      header_token_for(@user)
    end

    with_options scope: :project_review do
      parameter :state, <<~DESC, required: true
        The status of the review. Currently only `approved` is supported.
      DESC
    end

    describe 'when the project has a review' do
      let!(:project_review) { create(:project_review) }
      let(:project_id) { project_review.project_id }
      let(:reviewer) { @user }
      let(:state) { 'approved' }

      example 'Approve the project review' do
        side_fx = SideFxProjectReviewService.new
        allow(SideFxProjectReviewService).to receive(:new).and_return(side_fx)
        expect(side_fx).to receive(:before_update).and_call_original
        expect(side_fx).to receive(:after_update).and_call_original

        do_request
        assert_status 200

        expect(project_review.reload).to be_approved
        expect(response_data).to include(
          id: project_review.id,
          type: 'project_review',
          attributes: hash_including(
            state: 'approved',
            approved_at: project_review.approved_at&.iso8601(3)
          ),
          relationships: hash_including(
            reviewer: { data: { id: reviewer.id, type: 'user' } }
          )
        )
      end
    end

    describe 'when the project does not have a review' do
      let(:project_id) { create(:project).id }

      example 'Not Found (404)', document: false do
        do_request
        assert_status 404
      end
    end
  end

  delete 'web_api/v1/projects/:project_id/review' do
    before { admin_header_token }

    describe 'when the project has a review' do
      let!(:project_review) { create(:project_review) }
      let(:project_id) { project_review.project_id }

      example 'Delete the project review' do
        side_fx = SideFxProjectReviewService.new
        allow(SideFxProjectReviewService).to receive(:new).and_return(side_fx)
        expect(side_fx).to receive(:before_destroy).and_call_original
        expect(side_fx).to receive(:after_destroy).and_call_original

        do_request

        assert_status 204
        expect { project_review.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    describe 'when the project does not have a review' do
      example 'Not Found (404)', document: false do
        do_request
        assert_status 404
      end
    end
  end
end
