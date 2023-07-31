# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource BasketsIdea do
  explanation 'Ideas included in a basket, with the count of votes.'

  before { header 'Content-Type', 'application/json' }

  let(:user) { create(:user) }
  let(:project) { create(:continuous_multiple_voting_project) }
  let(:basket) { create(:basket, participation_context: project, user: user) }

  context 'when resident' do
    before { header_token_for user }

    get 'web_api/v1/baskets/:basket_id/baskets_ideas' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of events per page'
      end

      let(:basket_id) { basket.id }
      let!(:ideas) { create_baskets_ideas basket, votes: [3, 2, 1] }

      example_request 'List all baskets_ideas of a basket' do
        assert_status 200
        json_response = json_parse response_body

        expect(json_response[:data].pluck(:attributes).pluck(:votes)).to contain_exactly 3, 2, 1
        expect(json_response[:included].select { |included| included[:type] == 'idea' }.pluck(:id)).to match_array ideas.map(&:id)
      end
    end

    get 'web_api/v1/baskets_ideas/:id' do
      let!(:ideas) { create_baskets_ideas basket, votes: [3, 2, 1] }
      let(:id) { basket.baskets_ideas.where(votes: 2).first.id }

      example_request 'Get one baskets_idea by ID' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :id)).to eq id
        expect(json_response.dig(:data, :attributes, :votes)).to eq 2
        expect(json_response[:included].pluck(:id)).to include ideas[1].id
      end
    end

    post 'web_api/v1/baskets/:basket_id/baskets_ideas' do
      with_options scope: :baskets_idea do
        parameter :idea_id, 'The ID of the idea added to the basket.', required: true
        parameter :votes, 'The number of times the idea is voted on. Defaults to 1.', required: false
      end
      ValidationErrorHelper.new.error_fields self, BasketsIdea

      let(:basket_id) { basket.id }
      let(:idea_id) { create(:idea, project: project).id }
      let(:votes) { 3 }

      example_request 'Add an idea to a basket' do
        assert_status 201
        json_response = json_parse response_body

        expect(json_response.dig(:data, :attributes, :votes)).to eq 3
        expect(json_response[:included].pluck(:id)).to include idea_id
      end

      context 'when budgeting' do
        let(:project) { create(:continuous_budgeting_project) }
        let(:idea_id) { create(:idea, project: project, budget: 10).id }

        example 'Add an idea to a basket', document: false do
          do_request
          assert_status 201
          json_response = json_parse response_body

          expect(json_response.dig(:data, :attributes, :votes)).to eq 10
          expect(json_response[:included].pluck(:id)).to include idea_id
        end
      end
    end

    patch 'web_api/v1/baskets_ideas/:id' do
      parameter :votes, 'The number of times the idea is voted on.', scope: :baskets_idea, required: true
      ValidationErrorHelper.new.error_fields self, BasketsIdea

      let(:ideas) { create_baskets_ideas basket, votes: [3, 2, 1] }
      let(:baskets_idea) { basket.baskets_ideas.find_by(idea_id: ideas.first.id) }
      let(:id) { baskets_idea.id }
      let(:votes) { 4 }

      example_request 'Update a baskets_idea' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :votes)).to eq 4
      end

      context 'when budgeting' do
        let(:project) { create(:continuous_budgeting_project) }

        let(:ideas) do
          [3, 2].map do |budget|
            create(:idea, project: project, budget: budget).tap do |idea|
              create(:baskets_idea, idea: idea, basket: basket)
            end
          end
        end

        example 'The votes of a baskets_idea cannot be changed', document: false do
          do_request
          assert_status 200
          json_response = json_parse response_body

          expect(json_response.dig(:data, :attributes, :votes)).to eq 3
        end
      end
    end

    delete 'web_api/v1/baskets_ideas/:id' do
      let(:baskets_idea) { create(:baskets_idea, basket: basket) }
      let(:id) { baskets_idea.id }

      example_request 'Delete a baskets_idea' do
        assert_status 200
        expect { BasketsIdea.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    put 'web_api/v1/baskets/ideas/:idea_id' do
      with_options scope: :baskets_idea do
        parameter :idea_id, 'The ID of the idea added to the basket.', required: true
        parameter :votes, 'The number of times the idea is voted on. If set to nil, the relationship between basket and idea will be deleted.', required: false
      end
      ValidationErrorHelper.new.error_fields self, BasketsIdea

      let(:idea) { create(:idea, project: project) }
      let(:idea_id) { idea.id }

      context 'basket and basket_idea do not exist' do
        let(:votes) { 1 }

        example_request 'Add an idea to a basket & create the basket' do
          assert_status 200

          expect(response_data.dig(:attributes, :votes)).to eq 1
          expect(json_response_body[:included].pluck(:id)).to include idea_id
        end
      end

      context 'basket already exists' do
        let!(:basket) { create(:basket, participation_context: project, user: user) }

        context 'basket_idea does not exist' do
          let(:votes) { 2 }

          example_request 'Add an idea to an existing basket' do
            assert_status 200
            expect(response_data.dig(:attributes, :votes)).to eq 2
            expect(json_response_body[:included].pluck(:id)).to include idea_id
            expect(response_data.dig(:relationships, :basket, :data, :id)).to eq basket.id
          end
        end

        context 'basket_idea already exists' do
          let!(:baskets_idea) { create(:baskets_idea, basket: basket, idea: idea) }
          let(:votes) { 3 }

          example_request 'Update an idea in an existing basket' do
            assert_status 200
            expect(response_data.dig(:attributes, :votes)).to eq 3
            expect(json_response_body[:included].pluck(:id)).to include idea_id
            expect(response_data[:id]).to eq baskets_idea.id
            expect(response_data.dig(:relationships, :basket, :data, :id)).to eq basket.id
          end
        end

        context 'basket_idea already exists and votes is set to nil' do
          let!(:baskets_idea) { create(:baskets_idea, basket: basket, idea: idea) }
          let(:votes) { nil }

          example_request 'Delete an idea in an existing basket' do
            assert_status 200
            expect(response_data[:id]).to eq baskets_idea.id
            expect(response_data.dig(:attributes, :votes)).to be_nil
            expect(response_data.dig(:relationships, :idea, :data, :id)).to eq idea_id
            expect { baskets_idea.reload }.to raise_error(ActiveRecord::RecordNotFound)
          end
        end

        context 'basket_idea already exists and votes is set to zero' do
          let!(:baskets_idea) { create(:baskets_idea, basket: basket, idea: idea) }
          let(:votes) { 0 }

          example_request 'Delete an idea in an existing basket' do
            assert_status 200
            expect(response_data[:id]).to eq baskets_idea.id
            expect(response_data.dig(:attributes, :votes)).to eq 0
            expect(response_data.dig(:relationships, :idea, :data, :id)).to eq idea_id
            expect { baskets_idea.reload }.to raise_error(ActiveRecord::RecordNotFound)
          end
        end

        context 'basket_idea does not exist and votes is set to nil' do
          let(:votes) { nil }

          example_request 'Return the baskets_idea that was never persisted' do
            assert_status 200
            expect(response_data[:id]).to be_nil
            expect(response_data.dig(:attributes, :votes)).to be_nil
            expect(response_data.dig(:relationships, :idea, :data, :id)).to eq idea_id
            expect(BasketsIdea.find_by(idea: idea)).to be_nil
          end
        end
      end

      context 'idea does not exist' do
        let(:idea_id) { 'NON_EXISTENT' }
        let(:votes) { 1 }

        example_request 'Add an non existent idea to a basket' do
          assert_status 404
        end
      end
    end
  end

  def create_baskets_ideas(basket, votes: [3, 2, 1])
    votes.map do |v|
      create(:baskets_idea, basket: basket, idea: create(:idea, project: basket.participation_context.project), votes: v).idea
    end
  end
end
