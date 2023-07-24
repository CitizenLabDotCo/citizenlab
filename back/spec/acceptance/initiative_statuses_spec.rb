# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'InitiativeStatuses' do
  explanation 'Initivative statuses reflect the cities attitude towards an initiative.'

  before do
    header 'Content-Type', 'application/json'
    @statuses = create_list(:initiative_status, 3)
  end

  get 'web_api/v1/initiative_statuses' do
    example_request 'List all initiative statuses' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].pluck(:id)).to match_array @statuses.map(&:id)
    end
  end

  get 'web_api/v1/initiative_statuses/:id' do
    let(:id) { @statuses.first.id }

    example_request 'Get one initiative status by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @statuses.first.id
    end
  end

  context 'with default statuses' do
    before do
      InitiativeStatus.destroy_all
      Initiative.destroy_all

      @status_approval_pending = create(:initiative_status_approval_pending)
      @status_approval_rejected = create(:initiative_status_approval_rejected)
      @status_proposed = create(:initiative_status_proposed)
      @status_expired = create(:initiative_status_expired)
      @status_threshold_reached = create(:initiative_status_threshold_reached)
      @status_answered = create(:initiative_status_answered)
      @status_ineligible = create(:initiative_status_ineligible)

      @default_codes = InitiativeStatus::CODES - ['custom']
      @not_approval_codes = InitiativeStatus::NOT_APPROVAL_CODES - ['custom']
    end

    get 'web_api/v1/initiative_statuses' do
      context 'when admin' do
        before do
          admin = create(:admin)
          header_token_for admin
        end

        context 'when approval feature is not fully activated' do
          context 'when no initiatives exist with status approval_pending or approval_rejected' do
            example_request 'List all initiative statuses' do
              expect(status).to eq(200)
              expect(Initiative.approval_required?).to be false
              json_response = json_parse(response_body)
              expect(json_response[:data].pluck(:attributes).pluck(:code)).to match_array @not_approval_codes
            end
          end

          context 'when an initiative exists with status approval_pending' do
            example 'List all initiative statuses' do
              create(
                :initiative_status_change,
                initiative: build(:initiative), initiative_status: @status_approval_pending
              )

              do_request
              expect(status).to eq(200)
              expect(Initiative.approval_required?).to be false
              json_response = json_parse(response_body)
              expect(json_response[:data].pluck(:attributes).pluck(:code)).to match_array @default_codes
            end
          end

          context 'when an initiative exists with status approval_rejected' do
            example 'List all initiative statuses' do
              create(
                :initiative_status_change,
                initiative: build(:initiative), initiative_status: @status_approval_rejected
              )

              do_request
              expect(status).to eq(200)
              expect(Initiative.approval_required?).to be false
              json_response = json_parse(response_body)
              expect(json_response[:data].pluck(:attributes).pluck(:code)).to match_array @default_codes
            end
          end
        end

        context 'when approval feature is fully activated' do
          before do
            SettingsService.new.activate_feature! 'initiative_approval'

            configuration = AppConfiguration.instance
            configuration.settings['initiatives'] = {
              enabled: true,
              allowed: true,
              require_approval: true, # This is also required to activate the feature
              reacting_threshold: 2,
              days_limit: 20,
              threshold_reached_message: { 'en' => 'Threshold reached' },
              eligibility_criteria: { 'en' => 'Eligibility criteria' }
            }
            configuration.save!
          end

          example_request 'List all initiative statuses' do
            expect(status).to eq(200)
            expect(Initiative.approval_required?).to be true
            json_response = json_parse(response_body)
            expect(json_response[:data].pluck(:attributes).pluck(:code)).to match_array @default_codes
          end
        end
      end

      context 'when signed-in user' do
        before do
          @user = create(:user)
          header_token_for @user
        end

        context 'when user authored no intiatives with approval_pending or approval_rejected status' do
          example_request 'List all initiative statuses' do
            create(
              :initiative_status_change,
              initiative: build(:initiative, author: build(:user)), initiative_status: @status_approval_pending
            )
            create(
              :initiative_status_change,
              initiative: build(:initiative, author: build(:user)), initiative_status: @status_approval_rejected
            )

            expect(status).to eq(200)
            json_response = json_parse(response_body)
            expect(json_response[:data].pluck(:attributes).pluck(:code)).to match_array @not_approval_codes
          end
        end

        context 'when user authored an intiative with approval_pending status' do
          example 'List all initiative statuses' do
            create(
              :initiative_status_change,
              initiative: build(:initiative, author: @user), initiative_status: @status_approval_pending
            )

            do_request
            expect(status).to eq(200)
            json_response = json_parse(response_body)
            expect(json_response[:data].pluck(:attributes).pluck(:code))
              .to match_array @not_approval_codes + ['approval_pending']
          end
        end

        context 'when user authored an intiative with approval_rejected status' do
          example 'List all initiative statuses' do
            create(
              :initiative_status_change,
              initiative: build(:initiative, author: @user), initiative_status: @status_approval_rejected
            )

            do_request
            expect(status).to eq(200)
            json_response = json_parse(response_body)
            expect(json_response[:data].pluck(:attributes).pluck(:code))
              .to match_array @not_approval_codes + ['approval_rejected']
          end
        end
      end
    end
  end
end
