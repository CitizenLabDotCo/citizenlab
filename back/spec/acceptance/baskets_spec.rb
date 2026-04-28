# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Baskets' do
  explanation 'A collection of ideas selected by the citizen during participatory budgeting. AKA "cart" (US), "buggy" (American south), "carriage" (New England) or "trolley"'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    @project = create(:single_phase_multiple_voting_project)
    create_list(:basket, 2, phase: create(:budgeting_phase))
    @basket = create(
      :basket,
      user: @user,
      phase: @project.phases.first
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
          phase: {
            data: { id: @basket.phase_id, type: 'phase' }
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
      parameter :phase_id, 'The id of the phase/project to whom the basket belongs', required: true
    end
    ValidationErrorHelper.new.error_fields(self, Basket)

    context 'when authenticated' do
      before { header_token_for @user }

      let(:submitted) { false }
      let(:phase_id) { @project.phases.first.id }

      example_request 'Create a basket' do
        assert_status 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :submitted_at)).to be_nil
        expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq @user.id
        expect(json_response.dig(:data, :relationships, :phase, :data, :id)).to eq phase_id
      end

      example 'A user cannot exceed voting_max_total by creating a second basket', document: false do
        phase = @project.phases.first
        # Cap the phase at the user's already-cast votes — they're now "fully used up".
        phase.update!(voting_max_total: @basket.total_votes)
        @basket.update_counts!

        # Attempt the bypass: POST a 2nd basket and, if accepted, submit it with another full set of votes.
        do_request(basket: { phase_id: phase.id, submitted: false })
        if response_status == 201
          evil_basket = Basket.find(json_parse(response_body).dig(:data, :id))
          create(:baskets_idea, basket: evil_basket, idea: @ideas.first, votes: phase.voting_max_total)
          evil_basket.update(submitted_at: Time.now)
          evil_basket.update_counts!
        end

        user_total = @user.baskets.submitted.where(phase: phase).sum(&:total_votes)
        expect(user_total).to be <= phase.voting_max_total,
          "user cast #{user_total} votes; per-user cap is #{phase.voting_max_total} (bypass via 2nd basket)"
      end

      example '[error] Create a basket in a survey', document: false do
        do_request(
          basket: {
            phase_id: create(:single_phase_typeform_survey_project).phases.first.id
          }
        )

        expect(response_status).to be >= 400
      end

      context 'when the voting phase is over' do
        before { @project.phases.first.update!(start_at: (Time.now - 5.days), end_at: (Time.now - 3.days)) }

        example_request '[error] Create a basket' do
          assert_status 401
        end
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

        example 'Replaying the submit request does not duplicate votes or basket counts', document: false do
          do_request
          assert_status 200

          @basket.reload
          phase = @basket.phase.reload
          project = phase.project.reload
          baseline = {
            total_baskets: Basket.count,
            submitted_baskets: Basket.submitted.count,
            basket_total_votes: @basket.total_votes,
            baskets_ideas_count: @basket.baskets_ideas.count,
            baskets_ideas_votes: @basket.baskets_ideas.pluck(:idea_id, :votes).sort,
            phase_baskets_count: phase.baskets_count,
            phase_votes_count: phase.votes_count,
            project_baskets_count: project.baskets_count,
            project_votes_count: project.votes_count,
            ideas_counts: @ideas.map { |i| i.reload.slice(:baskets_count, :votes_count) }
          }

          10.times do
            do_request
            assert_status 200
          end

          @basket.reload
          phase.reload
          project.reload

          expect(Basket.count).to eq baseline[:total_baskets]
          expect(Basket.submitted.count).to eq baseline[:submitted_baskets]
          expect(@basket.total_votes).to eq baseline[:basket_total_votes]
          expect(@basket.baskets_ideas.count).to eq baseline[:baskets_ideas_count]
          expect(@basket.baskets_ideas.pluck(:idea_id, :votes).sort).to eq baseline[:baskets_ideas_votes]
          expect(phase.baskets_count).to eq baseline[:phase_baskets_count]
          expect(phase.votes_count).to eq baseline[:phase_votes_count]
          expect(project.baskets_count).to eq baseline[:project_baskets_count]
          expect(project.votes_count).to eq baseline[:project_votes_count]
          expect(@ideas.map { |i| i.reload.slice(:baskets_count, :votes_count) }).to eq baseline[:ideas_counts]
        end

        context 'when budgeting' do
          before do
            @project = create(:single_phase_budgeting_project)
            @basket.update!(phase: @project.phases.first)
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
            @project.phases.first.update!(voting_max_total: 10)
            @ideas.first.update!(budget: 7)

            do_request
            assert_status 422
            expect(json_parse(response_body)).to eq({ errors: { total_votes: [{ error: 'less_than_or_equal_to', value: 11, count: 10 }] } })

            @basket.reload
            expect(@basket.baskets_ideas.map(&:votes)).to contain_exactly 7, 2, 2
            expect(@basket.total_votes).to eq 11
          end

          context 'when the voting phase is over' do
            before do
              @project.phases.first.update!(start_at: (Time.now - 5.days), end_at: (Time.now - 3.days))
              @basket.update!(submitted_at: nil)
            end

            let(:submitted) { true }

            example_request '[error] Submit a basket' do
              assert_status 401
            end
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
