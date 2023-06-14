# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Baskets' do
  explanation 'A collection of ideas selected by the citizen during participatory budgeting. AKA "cart" (US), "buggy" (American south), "carriage" (New England) or "trolley"'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    @ideas = create_list(:idea, 3, project: create(:project), idea_status: create(:idea_status), author: @user)
    create_list(:basket, 2, participation_context: create(:continuous_budgeting_project))
    @basket = create(:basket, ideas: @ideas, user: @user, participation_context: create(:continuous_budgeting_project))
  end

  get 'web_api/v1/baskets/:basket_id' do
    let(:basket_id) { @basket.id }

    context 'when authenticated' do
      before { header_token_for @user }

      example_request 'Get one basket by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)

        expect(json_response.dig(:data, :id)).to eq @basket.id
        expect(json_response.dig(:data, :type)).to eq 'basket'
        expect(json_response.dig(:data, :attributes)).to include(
          total_budget: 2250,
          budget_exceeds_limit?: false
        )
        expect(json_response.dig(:data, :relationships)).to include(
          participation_context: {
            data: { id: @basket.participation_context_id, type: 'project' }
          },
          user: {
            data: { id: @basket.user_id, type: 'user' }
          }
        )
        expect(json_response.dig(:data, :relationships, :ideas, :data).pluck(:id)).to match_array @ideas.map(&:id)
        expect(json_response[:included].map { |h| h.dig(:attributes, :slug) }).to match_array @ideas.map(&:slug)
      end
    end
  end

  post 'web_api/v1/baskets' do
    with_options scope: :basket do
      parameter :submitted_at, 'The time at which the basket was submitted to the city', required: false
      parameter :user_id, 'The id of the user to whom the basket belongs', required: true
      parameter :participation_context_id, 'The id of the phase/project to whom the basket belongs', required: true
      parameter :participation_context_type, 'The type of the participation context (e.g. Project, Phase)', required: true
      parameter :idea_ids, 'An array of idea ids that have been added to basket', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Basket)

    context 'when authenticated' do
      before { header_token_for @user }

      let(:basket) { build(:basket, user: @user, participation_context: create(:continuous_budgeting_project)) }
      let(:user_id) { basket.user_id }
      let(:participation_context_id) { basket.participation_context_id }
      let(:participation_context_type) { basket.participation_context_type }
      let(:idea_ids) { basket.idea_ids }

      example_request 'Create a basket' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq user_id
        expect(json_response.dig(:data, :relationships, :ideas, :data).pluck(:id)).to match_array basket.idea_ids
        expect(json_response.dig(:data, :relationships, :participation_context, :data, :id)).to eq participation_context_id
      end

      example '[error] Create a basket in a survey' do
        do_request(
          basket: {
            participation_context_id: create(:continuous_survey_project).id,
            participation_context_type: 'Project'
          }
        )

        expect(response_status).to be >= 400
      end
    end
  end

  patch 'web_api/v1/baskets/:basket_id' do
    with_options scope: :basket do
      parameter :submitted_at, 'The time at which the basket was submitted to the city'
      parameter :user_id, 'The id of the user to whom the basket belongs'
      parameter :participation_context_id, 'The id of the phase/project to whom the basket belongs'
      parameter :participation_context_type, 'The type of the participation context (e.g. Project, Phase)'
      parameter :idea_ids, 'An array of idea ids that have been added to basket'
    end
    ValidationErrorHelper.new.error_fields(self, Basket)

    context 'when authenticated' do
      before { header_token_for @user }

      let(:basket_id) { @basket.id }

      describe do
        let(:idea_ids) { create_list(:idea, 3).map(&:id) }

        example_request 'Update a basket' do
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :relationships, :ideas, :data).pluck(:id)).to match_array idea_ids
        end
      end

      example "'baskets_count' is not updated when adding/removing the idea to an unsubmitted basket", document: false do
        idea = create(:idea)
        @basket.update!(ideas: [idea], submitted_at: Time.zone.now)
        SideFxBasketService.new.update_basket_counts
        old_baskets_count = idea.reload.baskets_count

        do_request basket: { idea_ids: [create(:idea).id], submitted_at: nil }
        expect(idea.reload.baskets_count).to eq(old_baskets_count - 1)
      end

      example "'baskets_count' is updated when adding/removing the idea to a submitted basket", document: false do
        idea = create(:idea)
        @basket.update!(ideas: [idea])
        SideFxBasketService.new.update_basket_counts
        old_baskets_count = idea.reload.baskets_count

        do_request basket: { idea_ids: [create(:idea).id], submitted_at: Time.zone.now }
        expect(idea.reload.baskets_count).to eq(old_baskets_count - 1)
      end

      example "'baskets_count' is updated when submitting a basket", document: false do
        idea = create(:idea)
        @basket.update!(ideas: [idea], submitted_at: nil)
        SideFxBasketService.new.update_basket_counts
        old_baskets_count = idea.reload.baskets_count

        do_request basket: { submitted_at: Time.zone.now }
        expect(idea.reload.baskets_count).to eq(old_baskets_count + 1)
      end

      example "'baskets_count' is updated when unsubmitting a basket", document: false do
        idea = create(:idea)
        @basket.update!(ideas: [idea], submitted_at: Time.zone.now)
        SideFxBasketService.new.update_basket_counts
        old_baskets_count = idea.reload.baskets_count

        do_request basket: { submitted_at: nil, ideas: [] }
        expect(idea.reload.baskets_count).to eq(old_baskets_count - 1)
      end

      describe "'baskets_count' stay up to date after removing an idea from the basket" do
        before do
          @trolley = create_list(:basket, 3, ideas: [idea], participation_context: create(:continuous_budgeting_project)).first
          @trolley.update(user: @user)
        end

        let(:idea) { create(:idea) }
        let(:idea_ids) { [] }
        let(:basket_id) { @trolley.id }
        let(:submitted_at) { Time.zone.now }

        example '', document: false do
          do_request
          expect(idea.reload.baskets_count).to eq 2
        end
      end
    end
  end

  delete 'web_api/v1/baskets/:basket_id' do
    context 'when authenticated' do
      before { header_token_for @user }

      let(:basket_id) { @basket.id }

      example 'Delete a basket' do
        old_count = Basket.count
        do_request
        expect(response_status).to eq 200
        expect { Basket.find(basket_id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(Basket.count).to eq(old_count - 1)
      end
    end
  end
end
