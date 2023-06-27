# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Baskets' do
  explanation 'A collection of ideas selected by the citizen during participatory budgeting. AKA "cart" (US), "buggy" (American south), "carriage" (New England) or "trolley"'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    @project = create(:continuous_budgeting_project)
    @ideas = create_list(:idea, 3, project: @project, idea_status: create(:idea_status), author: @user)
    create_list(:basket, 2, participation_context: create(:continuous_budgeting_project))
    @basket = create(
      :basket,
      user: @user,
      participation_context: @project,
      baskets_ideas_attributes: [{ idea_id: @ideas[0].id, votes: 1 }, { idea_id: @ideas[1].id, votes: 2 }, { idea_id: @ideas[2].id, votes: 2 }]
    )
  end

  get 'web_api/v1/baskets/:basket_id' do
    let(:basket_id) { @basket.id }

    context 'when authenticated' do
      before { header_token_for @user }

      example_request 'Get one basket by id' do
        assert_status 200
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
        expect(
          json_response[:included].select { |included| included[:type] == 'baskets_idea' }.map { |baskets_idea| baskets_idea.dig(:attributes, :votes) }
        ).to contain_exactly 1, 2, 2
        expect(json_response.dig(:data, :relationships, :ideas, :data).pluck(:id)).to match_array @ideas.map(&:id)
        expect(json_response[:included].select { |included| included[:type] == 'idea' }.map { |h| h.dig(:attributes, :slug) }).to match_array @ideas.map(&:slug)
      end
    end
  end

  post 'web_api/v1/baskets' do
    with_options scope: :basket do
      parameter :submitted_at, 'The time at which the basket was submitted to the city', required: false
      parameter :user_id, 'The id of the user to whom the basket belongs', required: true
      parameter :participation_context_id, 'The id of the phase/project to whom the basket belongs', required: true
      parameter :participation_context_type, 'The type of the participation context (e.g. Project, Phase)', required: true
      parameter :baskets_ideas_attributes, 'Array with baskets_ideas objects', required: false
    end
    with_options scope: %i[basket baskets_ideas_attributes] do
      parameter :idea_id, 'The ID of the idea added to the basket', required: true
      parameter :votes, 'The number of times the idea is voted on', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Basket)

    context 'when authenticated' do
      before { header_token_for @user }

      let(:basket) { build(:basket, user: @user, participation_context: @project) }
      let(:user_id) { basket.user_id }
      let(:participation_context_id) { basket.participation_context_id }
      let(:participation_context_type) { basket.participation_context_type }
      let(:ideas) { create_list(:idea, 2, project: @project) }
      let(:baskets_ideas_attributes) { [{ idea_id: ideas.first.id, votes: 2 }, { idea_id: ideas.last.id, votes: 3 }] }

      # TODO: Cover 2 cases: 1) Setting the votes for a non-budgeting voting method; 2) Overwriting the votes with budgets for budgeting
      example_request 'Create a basket' do
        assert_status 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq user_id
        expect(json_response.dig(:data, :relationships, :ideas, :data).pluck(:id)).to match_array ideas.map(&:id)
        expect(json_response.dig(:data, :relationships, :participation_context, :data, :id)).to eq participation_context_id
        expect(
          json_response[:included].select { |included| included[:type] == 'baskets_idea' }.map { |baskets_idea| baskets_idea.dig(:attributes, :votes) }
        ).to contain_exactly 2, 3
      end

      example '[error] Create a basket in a survey', document: false do
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
      parameter :baskets_ideas_attributes, 'Array with baskets_ideas objects', required: false
    end
    with_options scope: %i[basket baskets_ideas_attributes] do
      parameter :idea_id, 'The ID of the idea added to the basket', required: true
      parameter :votes, 'The number of times the idea is voted on', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Basket)

    context 'when authenticated' do
      before { header_token_for @user }

      let(:basket_id) { @basket.id }

      describe do
        let(:new_ideas) { create_list(:idea, 2, project: @project) }
        let(:idea_ids) { new_ideas.map(&:id) + [@ideas.first.id] }
        let(:baskets_ideas_attributes) do
          new_ideas.map { |idea| { idea_id: idea.id } } + [
            { idea_id: @ideas.first.id, votes: 4 },
            { idea_id: @ideas.last.id, votes: 0 } # Delete
          ]
        end

        example_request 'Update a basket' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :relationships, :ideas, :data).pluck(:id)).to match_array idea_ids
          expect(
            json_response[:included].select { |included| included[:type] == 'baskets_idea' }.map { |baskets_idea| baskets_idea.dig(:attributes, :votes) }
          ).to contain_exactly 1, 1, 4
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
