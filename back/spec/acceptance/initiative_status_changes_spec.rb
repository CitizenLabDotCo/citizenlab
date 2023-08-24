# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'InitiativeStatusChange' do
  explanation 'Initiative status changes allow admins to apply manual status changes on initiatives.'

  before do
    header 'Content-Type', 'application/json'
    @initiative = create(:initiative)
    @changes = create_list(:initiative_status_change, 2, initiative: @initiative)
  end

  get 'web_api/v1/initiatives/:initiative_id/initiative_status_changes' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of status changes per page'
    end

    before { admin_header_token }

    let(:initiative_id) { @initiative.id }

    example_request 'List all status changes of an initiative' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response.dig(:data, 0, :attributes, :created_at)).to be_present
    end
  end

  get 'web_api/v1/initiative_status_changes/:id' do
    before { admin_header_token }

    let(:id) { @changes.first.id }

    example_request 'Get one status changes on an initiative by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @changes.first.id
    end
  end

  context 'when authenticated' do
    before do
      @user = create(:admin)
      header_token_for @user

      @status_review_pending = create(:initiative_status_review_pending)
      @status_changes_requested = create(:initiative_status_changes_requested)
      @status_proposed = create(:initiative_status_proposed)
      @status_expired = create(:initiative_status_expired)
      @status_threshold_reached = create(:initiative_status_threshold_reached)
      @status_answered = create(:initiative_status_answered)
      @status_ineligible = create(:initiative_status_ineligible)

      create(
        :initiative_status_change,
        initiative: @initiative, initiative_status: @status_threshold_reached
      )
    end

    post 'web_api/v1/initiatives/:initiative_id/initiative_status_changes' do
      with_options scope: :initiative_status_change do
        parameter :initiative_status_id, 'The new initiative status', required: true
        parameter :user_id, 'The user who made the status change', required: false
        parameter :official_feedback_id, 'An existing official feedback can be used', required: false
      end
      with_options scope: %i[initiative_status_change official_feedback_attributes] do
        parameter :body_multiloc, 'Multi-locale field with the feedback body', required: false
        parameter :author_multiloc, 'Multi-locale field with describing the author', required: false
      end
      ValidationErrorHelper.new.error_fields(self, InitiativeStatusChange)

      let(:initiative_id) { @initiative.id }
      let(:initiative_status_id) { @status_answered.id }
      let(:feedback) { build(:official_feedback) }
      let(:body_multiloc) { feedback.body_multiloc }
      let(:author_multiloc) { feedback.author_multiloc }

      example_request 'Create a status change on an initiative with new feedback' do
        assert_status 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq @user.id
        expect(@initiative.reload.official_feedbacks_count).to eq 1
      end

      describe do
        let(:official_feedback_id) { create(:official_feedback, post: @initiative).id }
        let(:body_multiloc) { nil }
        let(:author_multiloc) { nil }

        example_request 'Create a status change on an initiative using an existing feedback' do
          assert_status 201
          expect(@initiative.reload.official_feedbacks_count).to eq 1
        end
      end

      describe do
        let(:body_multiloc) { nil }
        let(:author_multiloc) { nil }

        example_request '[error] Create a status change on an initiative without feedback' do
          assert_status 422
        end
      end

      describe do
        let(:initiative_status_id) { @status_expired.id }

        example_request '[error] Create a status change through an invalid transition' do
          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to include_response_error(:base, 'initiative_status_transition_not_allowed')
        end
      end

      describe do
        let(:initiative_status_id) { @status_threshold_reached.id }

        example_request '[error] Create a status change to the same status' do
          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to include_response_error(:base, 'initiative_status_transition_without_change')
        end
      end

      # If the review feature is off, the initiative_status_change with code 'proposed'
      # is created at the model level when the initiative is published.
      # Thus, this POST request can only happen when the review feature is on.
      context 'when the the status change is to the proposed status' do
        let(:new_initiative) { create(:initiative) }
        let!(:_initiative_status_change) do
          create(
            :initiative_status_change,
            initiative: new_initiative,
            initiative_status: @status_review_pending
          )
        end

        let(:initiative_id) { new_initiative.id }
        let(:initiative_status_id) { @status_proposed.id }

        example 'creation of status change record' do
          expect(Initiative.find(initiative_id).editing_locked).to be false

          # results in the logging of an Initiative 'proposed' activity
          expect { do_request }
            .to have_enqueued_job(LogActivityJob)
            .with(instance_of(Initiative), 'proposed', @user, instance_of(Integer))
            .exactly(1).times
          assert_status 201
          # results in the setting of editing_locked: true
          expect(Initiative.find(initiative_id).editing_locked).to be true
        end
      end

      context 'when the the status change is to the changes_requested status' do
        let(:new_initiative) { create(:initiative) }
        let!(:_initiative_status_change) do
          create(
            :initiative_status_change,
            initiative: new_initiative,
            initiative_status: @status_changes_requested
          )
        end

        let(:initiative_id) { new_initiative.id }
        let(:initiative_status_id) { @status_review_pending.id }

        example 'creation of status change record' do
          expect(Initiative.find(initiative_id).editing_locked).to be false

          # does not result in the logging of an Initiative 'proposed' activity
          expect { do_request }
            .not_to have_enqueued_job(LogActivityJob)
            .with(instance_of(Initiative), 'proposed', anything, anything)
          assert_status 201
          # does not result in locked editing
          expect(Initiative.find(initiative_id).editing_locked).to be false
        end
      end
    end
  end

  context 'when resident' do
    before do
      resident_header_token

      @status_proposed = create(:initiative_status_proposed)
      @status_expired = create(:initiative_status_expired)
      @status_threshold_reached = create(:initiative_status_threshold_reached)
      @status_answered = create(:initiative_status_answered)
      @status_ineligible = create(:initiative_status_ineligible)

      create(
        :initiative_status_change,
        initiative: @initiative, initiative_status: @status_threshold_reached
      )
    end

    post 'web_api/v1/initiatives/:initiative_id/initiative_status_changes' do
      with_options scope: :initiative_status_change do
        parameter :initiative_status_id, 'The new initiative status', required: true
        parameter :user_id, 'The user who made the status change', required: false
        parameter :official_feedback_id, 'An existing official feedback can be used', required: false
      end
      with_options scope: %i[initiative_status_change official_feedback_attributes] do
        parameter :body_multiloc, 'Multi-locale field with the feedback body', required: false
        parameter :author_multiloc, 'Multi-locale field with describing the author', required: false
      end
      ValidationErrorHelper.new.error_fields(self, InitiativeStatusChange)

      let(:initiative_id) { @initiative.id }
      let(:initiative_status_id) { @status_answered.id }
      let(:feedback) { build(:official_feedback) }
      let(:body_multiloc) { feedback.body_multiloc }
      let(:author_multiloc) { feedback.author_multiloc }

      example_request '[error] Create an official feedback on an initiative' do
        expect(response_status).to eq 401
      end
    end
  end
end
