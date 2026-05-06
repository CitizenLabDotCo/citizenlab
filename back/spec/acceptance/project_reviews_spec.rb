# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project reviews' do
  explanation <<~EXPLANATION
    Lightweight reviews for projects which are used to give a formal approval before a project can be published.
  EXPLANATION

  context 'as an admin' do
    before do
      header 'Content-Type', 'application/json'
      @user = create(:admin)
      header_token_for(@user)
    end

    post 'web_api/v1/projects/:project_id/review' do
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

  context 'as a space moderator' do
    before do
      header 'Content-Type', 'application/json'
      @space = create(:space)
      @user = create(:space_moderator, spaces: [@space])
      header_token_for(@user)
    end

    post 'web_api/v1/projects/:project_id/review' do
      with_options scope: :project_review do
        parameter :reviewer_id, <<~DESC, required: false
          The ID of the user to whom the review request is assigned.
        DESC
      end

      describe 'when the project is in the moderated space' do
        let(:project) { create(:project, space: @space) }
        let(:project_id) { project.id }

        example 'Can create a review request for the project' do
          do_request
          assert_status 201
          review = ProjectReview.find(response_data[:id])
          expect(review.project_id).to eq(project_id)
          expect(review.requester_id).to eq(@user.id)
        end
      end

      describe 'when the project is not in the moderated space' do
        let(:project_id) { create(:project).id }

        example 'Cannot create a review request', document: false do
          do_request
          assert_status 401
        end
      end
    end

    get 'web_api/v1/projects/:project_id/review' do
      describe 'when the project is in the moderated space' do
        let!(:project_in_space) { create(:project, space: @space) }
        let!(:project_review) { create(:project_review, project: project_in_space) }
        let(:project_id) { project_review.project_id }

        example_request 'Get a project review' do
          assert_status 200
          expect(response_data[:id]).to eq(project_review.id)
        end
      end

      describe 'when the project is not in the moderated space' do
        let!(:project_review) { create(:project_review) }
        let(:project_id) { project_review.project_id }

        example 'Unauthorized (401)', document: false do
          do_request
          assert_status 401
        end
      end
    end

    patch 'web_api/v1/projects/:project_id/review' do
      with_options scope: :project_review do
        parameter :state, <<~DESC, required: true
          The status of the review. Currently only `approved` is supported.
        DESC
      end

      describe 'when the project has a review' do
        let!(:project_in_space) { create(:project, space: @space) }
        let!(:project_review) { create(:project_review, project: project_in_space) }
        let(:project_id) { project_review.project_id }
        let(:reviewer) { @user }
        let(:state) { 'approved' }

        example 'Can approve the project review if can moderate space' do
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

        example 'Cannot approve the project review if cannot moderate space' do
          another_space = create(:space)
          project_in_other_space = create(:project, space: another_space)
          other_project_review = create(:project_review, project: project_in_other_space)

          do_request project_id: other_project_review.project_id
          assert_status 401

          expect(other_project_review.reload).not_to be_approved
        end
      end

      describe 'when the project does not have a review' do
        let(:project_id) { create(:project).id }

        example 'Unauthorized (401)', document: false do
          do_request
          assert_status 401
        end
      end
    end

    delete 'web_api/v1/projects/:project_id/review' do
      describe 'when the project has a review' do
        let!(:project_in_space) { create(:project, space: @space) }
        let!(:project_review) { create(:project_review, project: project_in_space) }
        let(:project_id) { project_review.project_id }

        example 'Can delete the project review if can moderate space' do
          side_fx = SideFxProjectReviewService.new
          allow(SideFxProjectReviewService).to receive(:new).and_return(side_fx)
          expect(side_fx).to receive(:before_destroy).and_call_original
          expect(side_fx).to receive(:after_destroy).and_call_original

          do_request

          assert_status 204
          expect { project_review.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end

        example 'Cannot delete the project review if cannot moderate space' do
          another_space = create(:space)
          project_in_other_space = create(:project, space: another_space)
          other_project_review = create(:project_review, project: project_in_other_space)

          do_request project_id: other_project_review.project_id
          assert_status 401

          expect { other_project_review.reload }.not_to raise_error
        end
      end

      describe 'when the project does not have a review' do
        let(:project_id) { create(:project).id }

        example 'Unauthorized (401)', document: false do
          do_request
          assert_status 401
        end
      end
    end
  end

  context 'as a folder moderator' do
    before do
      header 'Content-Type', 'application/json'
      @project_in_folder = create(:project)
      @folder = create(:project_folder, projects: [@project_in_folder]).tap { @project_in_folder.reload }
      @user = create(:project_folder_moderator, project_folders: [@folder])
      header_token_for(@user)
    end

    post 'web_api/v1/projects/:project_id/review' do
      with_options scope: :project_review do
        parameter :reviewer_id, <<~DESC, required: false
          The ID of the user to whom the review request is assigned.
        DESC
      end

      describe 'when the project is in the moderated folder' do
        let(:project_id) { @project_in_folder.id }

        example 'Can create a review request for the project' do
          do_request
          assert_status 201
          review = ProjectReview.find(response_data[:id])
          expect(review.project_id).to eq(project_id)
          expect(review.requester_id).to eq(@user.id)
        end
      end

      describe 'when the project is not in the moderated folder' do
        let(:project_id) { create(:project).id }

        example 'Cannot create a review request', document: false do
          do_request
          assert_status 401
        end
      end
    end

    get 'web_api/v1/projects/:project_id/review' do
      describe 'when the project is in the moderated folder' do
        let!(:project_review) { create(:project_review, project: @project_in_folder) }
        let(:project_id) { project_review.project_id }

        example_request 'Get a project review' do
          assert_status 200
          expect(response_data[:id]).to eq(project_review.id)
        end
      end

      describe 'when the project is not in the moderated folder' do
        let!(:project_review) { create(:project_review) }
        let(:project_id) { project_review.project_id }

        example 'Unauthorized (401)', document: false do
          do_request
          assert_status 401
        end
      end
    end

    patch 'web_api/v1/projects/:project_id/review' do
      with_options scope: :project_review do
        parameter :state, <<~DESC, required: true
          The status of the review. Currently only `approved` is supported.
        DESC
      end

      describe 'when the project has a review' do
        let!(:project_review) { create(:project_review, project: @project_in_folder) }
        let(:project_id) { project_review.project_id }
        let(:reviewer) { @user }
        let(:state) { 'approved' }

        example 'Can approve the project review if can moderate folder' do
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

        example 'Cannot approve the project review if cannot moderate folder' do
          other_folder_project = create(:project)
          create(:project_folder, projects: [other_folder_project]).tap { other_folder_project.reload }
          other_project_review = create(:project_review, project: other_folder_project)

          do_request project_id: other_project_review.project_id
          assert_status 401

          expect(other_project_review.reload).not_to be_approved
        end
      end

      describe 'when the project does not have a review' do
        let(:project_id) { create(:project).id }

        example 'Unauthorized (401)', document: false do
          do_request
          assert_status 401
        end
      end
    end

    delete 'web_api/v1/projects/:project_id/review' do
      describe 'when the project has a review' do
        let!(:project_review) { create(:project_review, project: @project_in_folder) }
        let(:project_id) { project_review.project_id }

        example 'Can delete the project review if can moderate folder' do
          side_fx = SideFxProjectReviewService.new
          allow(SideFxProjectReviewService).to receive(:new).and_return(side_fx)
          expect(side_fx).to receive(:before_destroy).and_call_original
          expect(side_fx).to receive(:after_destroy).and_call_original

          do_request

          assert_status 204
          expect { project_review.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end

        example 'Cannot delete the project review if cannot moderate folder' do
          other_folder_project = create(:project)
          create(:project_folder, projects: [other_folder_project]).tap { other_folder_project.reload }
          other_project_review = create(:project_review, project: other_folder_project)

          do_request project_id: other_project_review.project_id
          assert_status 401

          expect { other_project_review.reload }.not_to raise_error
        end
      end

      describe 'when the project does not have a review' do
        let(:project_id) { create(:project).id }

        example 'Unauthorized (401)', document: false do
          do_request
          assert_status 401
        end
      end
    end
  end

  context 'as a project moderator' do
    before do
      header 'Content-Type', 'application/json'
      @project = create(:project)
      @user = create(:project_moderator, projects: [@project])
      header_token_for(@user)
    end

    post 'web_api/v1/projects/:project_id/review' do
      with_options scope: :project_review do
        parameter :reviewer_id, <<~DESC, required: false
          The ID of the user to whom the review request is assigned.
        DESC
      end

      describe 'when the project is moderated by the user' do
        let(:project_id) { @project.id }

        example 'Can create a review request for the project' do
          do_request
          assert_status 201
          review = ProjectReview.find(response_data[:id])
          expect(review.project_id).to eq(project_id)
          expect(review.requester_id).to eq(@user.id)
        end
      end

      describe 'when the project is not moderated by the user' do
        let(:project_id) { create(:project).id }

        example 'Cannot create a review request', document: false do
          do_request
          assert_status 401
        end
      end
    end

    get 'web_api/v1/projects/:project_id/review' do
      describe 'when the project is moderated by the user' do
        let!(:project_review) { create(:project_review, project: @project) }
        let(:project_id) { project_review.project_id }

        example_request 'Get a project review' do
          assert_status 200
          expect(response_data[:id]).to eq(project_review.id)
        end
      end

      describe 'when the project is not moderated by the user' do
        let!(:project_review) { create(:project_review) }
        let(:project_id) { project_review.project_id }

        example 'Unauthorized (401)', document: false do
          do_request
          assert_status 401
        end
      end
    end

    patch 'web_api/v1/projects/:project_id/review' do
      with_options scope: :project_review do
        parameter :state, <<~DESC, required: true
          The status of the review. Currently only `approved` is supported.
        DESC
      end

      describe 'when the project is moderated by the user' do
        let!(:project_review) { create(:project_review, project: @project, requester: @user) }
        let(:project_id) { project_review.project_id }
        let(:state) { 'approved' }

        example 'Cannot approve the project review', document: false do
          do_request
          assert_status 401
          expect(project_review.reload).not_to be_approved
        end
      end
    end

    delete 'web_api/v1/projects/:project_id/review' do
      describe 'when the user is the requester of the review' do
        let!(:project_review) { create(:project_review, project: @project, requester: @user) }
        let(:project_id) { project_review.project_id }

        example 'Can delete the project review' do
          do_request
          assert_status 204
          expect { project_review.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      describe 'when the user is not the requester of the review' do
        let!(:project_review) { create(:project_review, project: @project) }
        let(:project_id) { project_review.project_id }

        example 'Cannot delete the project review', document: false do
          do_request
          assert_status 401
          expect { project_review.reload }.not_to raise_error
        end
      end
    end
  end
end
