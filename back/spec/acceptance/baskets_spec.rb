# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Baskets' do
  explanation 'A collection of ideas selected by the citizen during participatory budgeting. AKA "cart" (US), "buggy" (American south), "carriage" (New England) or "trolley"'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    @project = create(:continuous_multiple_voting_project)
    create_list(:basket, 2, participation_context: create(:continuous_budgeting_project))
    @basket = create(
      :basket,
      user: @user,
      participation_context: @project
    )
    @ideas = [1, 2, 2].map do |votes|
      create(:idea, project: @project, budget: 2).tap do |idea|
        create(:baskets_idea, idea: idea, basket: @basket, votes: votes)
      end
    end
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
        expect(json_response.dig(:data, :attributes, :total_votes)).to eq 5
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
      parameter :submitted, 'Boolean value to mark the basket as submitted or unsubmitted. Defaults to false.', required: false
      parameter :participation_context_id, 'The id of the phase/project to whom the basket belongs', required: true
      parameter :participation_context_type, 'The type of the participation context (e.g. Project, Phase)', required: true
    end
    ValidationErrorHelper.new.error_fields(self, Basket)

    context 'when authenticated' do
      before { header_token_for @user }

      let(:submitted) { false }
      let(:participation_context_id) { @project.id }
      let(:participation_context_type) { 'Project' }

      example_request 'Create a basket' do
        assert_status 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :submitted_at)).to be_nil
        expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq @user.id
        expect(json_response.dig(:data, :relationships, :participation_context, :data, :id)).to eq participation_context_id
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
    parameter :submitted, 'Boolean value to mark the basket as submitted or unsubmitted. Defaults to false.', scope: :basket, required: true
    ValidationErrorHelper.new.error_fields(self, Basket)

    context 'when authenticated' do
      before { header_token_for @user }

      let(:basket_id) { @basket.id }

      describe do
        let(:submitted) { true }

        example_request 'Update a basket' do
          assert_status 200
          json_response = json_parse(response_body)

          expect(json_response.dig(:data, :attributes, :submitted_at)).to be_present
        end

        context 'when budgeting' do
          before do
            @project = create(:continuous_budgeting_project)
            @basket.update!(participation_context: @project)
          end

          example 'Submitting a basket when the budget of an idea changed uses the new budget', document: false do
            @ideas.first.update!(budget: 7)

            do_request
            assert_status 200
            json_response = json_parse response_body

            expect(
              json_response[:included].select { |included| included[:type] == 'baskets_idea' }.map { |baskets_idea| baskets_idea.dig(:attributes, :votes) }
            ).to contain_exactly 7, 2, 2
            @basket.reload
            expect(@basket.total_votes).to eq 11
          end

          describe do
            let(:submitted) { false }

            example 'Unsubmitting a basket when the budget of an idea changed uses the new budget', document: false do
              @ideas.first.update!(budget: 7)

              do_request
              assert_status 200
              json_response = json_parse response_body

              expect(
                json_response[:included].select { |included| included[:type] == 'baskets_idea' }.map { |baskets_idea| baskets_idea.dig(:attributes, :votes) }
              ).to contain_exactly 7, 2, 2
              @basket.reload
              expect(@basket.total_votes).to eq 11
            end
          end

          example '[error] Submitting a basket when the budget of an idea changed and exceeds the limit uses the new budget', document: false do
            @project.update!(voting_max_total: 10)
            @ideas.first.update!(budget: 7)

            do_request
            assert_status 422
            expect(json_parse(response_body)).to eq({ errors: { total_votes: [{ error: 'less_than_or_equal_to', value: 11, count: 10 }] } })

            @basket.reload
            expect(@basket.baskets_ideas.map(&:votes)).to contain_exactly 7, 2, 2
            expect(@basket.total_votes).to eq 11
          end
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
        assert_status 200
        expect { Basket.find(basket_id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(Basket.count).to eq(old_count - 1)
      end
    end
  end
end
