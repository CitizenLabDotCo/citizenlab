# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  before { header 'Content-Type', 'application/json' }

  context 'when resident' do
    let(:user) { create(:user) }

    before do
      @user = user
      header_token_for user
      create(:idea_status_proposed)
    end

    get 'web_api/v1/ideas/as_markers' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of ideas per page'
      end
      parameter :topics, 'Filter by topics (OR)', required: false
      parameter :projects, 'Filter by projects (OR)', required: false
      parameter :phase, 'Filter by project phase', required: false
      parameter :author, 'Filter by author (user id)', required: false
      parameter :idea_status, 'Filter by status (idea status id)', required: false
      parameter :search, 'Filter by searching in title and body', required: false
      parameter :publication_status, 'Return only ideas with the specified publication status; returns all pusblished ideas by default', required: false
      parameter :bounding_box, 'Given an [x1,y1,x2,y2] array of doubles (x being latitude and y being longitude), the idea markers are filtered to only retain those within the (x1,y1)-(x2,y2) box.', required: false
      parameter :project_publication_status, "Filter by project publication_status. One of #{AdminPublication::PUBLICATION_STATUSES.join(', ')}", required: false
      parameter :feedback_needed, 'Filter out ideas that need feedback', required: false
      parameter :filter_trending, 'Filter out truly trending ideas', required: false

      describe do
        before do
          factories = %i[idea idea idea proposal idea idea idea]
          locations = [[51.044039, 3.716964], [50.845552, 4.357355], [50.640255, 5.571848], [50.950772, 4.308304], [51.215929, 4.422602], [50.453848, 3.952217], [-27.148983, -109.424659]]
          placenames = ['Ghent', 'Brussels', 'Liège', 'Meise', 'Antwerp', 'Mons', 'Hanga Roa']
          @ideas = factories.zip(locations, placenames).map do |factory, location, placename|
            create(
              factory,
              location_point_geojson: { 'type' => 'Point', 'coordinates' => location },
              title_multiloc: { 'en' => placename }
            )
          end
        end

        example 'List all inputs markers within a bounding box' do
          do_request(bounding_box: '[51.208758,3.224363,50.000667,5.715281]') # Bruges-Bastogne

          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 5
          expect(json_response[:data].map { |d| d.dig(:attributes, :title_multiloc, :en) }.sort).to match %w[Ghent Brussels Liège Meise Mons].sort
        end

        example 'List all inputs markers in a phase of a project', document: false do
          pr = create(:project_with_phases)
          ph1 = pr.phases.first
          ph2 = pr.phases.second
          create(:idea, phases: [ph1], project: pr)
          i2 = create(:idea, phases: [ph2], project: pr)
          i3 = create(:idea, phases: [ph1, ph2], project: pr)

          do_request phase: ph2.id
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].pluck(:id)).to match_array [i2.id, i3.id]
        end
      end
    end

    get 'web_api/v1/ideas/as_xlsx' do
      parameter :project, 'Filter by project', required: false
      parameter :ideas, 'Filter by a given list of idea ids', required: false

      describe do
        before do
          @user = create(:admin)
          header_token_for @user

          @ideas = %w[published published draft published published published].map do |ps|
            create(:idea, publication_status: ps)
          end
        end

        example_request 'XLSX export' do
          expect(status).to eq 200
        end

        describe do
          before do
            @project = create(:single_phase_ideation_project)
            @selected_ideas = @ideas.select(&:published?).shuffle.take 3
            @selected_ideas.each do |idea|
              idea.update! project: @project
            end
          end

          let(:project) { @project.id }

          example_request 'XLSX export by project' do
            expect(status).to eq 200
            worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
            expect(worksheet.count).to eq(@selected_ideas.size + 1)
          end
        end

        describe do
          before do
            @selected_ideas = @ideas.select(&:published?).shuffle.take 2
          end

          let(:ideas) { @selected_ideas.map(&:id) }

          example_request 'XLSX export by idea ids' do
            expect(status).to eq 200
            worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
            expect(worksheet.count).to eq(@selected_ideas.size + 1)
          end
        end

        context 'when the user moderates the project' do
          before do
            @project = create(:project)
            @user = create(:project_moderator, projects: [@project])
            header_token_for(@user)
          end

          let(:project) { @project.id }

          example 'XLSX export', document: false do
            do_request
            expect(status).to eq 200
          end
        end

        context 'when the user moderates another project' do
          before do
            @project = create(:project)
            @user = create(:project_moderator, projects: [create(:project)])
            header_token_for(@user)
          end

          let(:project) { @project.id }

          example '[error] XLSX export', document: false do
            do_request
            expect(status).to eq 401
          end
        end

        context 'when a moderator exports all comments' do
          before do
            @project = create(:project)

            @ideas = create_list(:idea, 3, project: @project)
            @unmoderated_idea = create(:idea)

            @user = create(:project_moderator, projects: [@project])
            header_token_for(@user)
          end

          example 'XLSX export', document: false do
            do_request
            assert_status 200

            worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
            ideas_ids = worksheet.drop(1).collect { |row| row[0].value }

            expect(ideas_ids).to match_array @ideas.pluck(:id)
            expect(ideas_ids).not_to include(@unmoderated_idea.id)
          end
        end

        describe 'when resident' do
          before { resident_header_token }

          example '[error] XLSX export', document: false do
            do_request
            assert_status 401
          end
        end
      end
    end

    get 'web_api/v1/ideas/survey_submissions' do
      describe do
        before do
          @project = create(:single_phase_native_survey_project)
          @idea = create(:native_survey_response, project: @project, author: @user)
          @idea_another_user = create(:native_survey_response, project: @project)
        end

        example_request 'List all survey submissions of user' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:data].pluck(:id)).to eq [@idea.id]
        end
      end
    end

    get 'web_api/v1/ideas/filter_counts' do
      describe do
        before do
          @t1 = create(:topic)
          @t2 = create(:topic)
          @project = create(:single_phase_ideation_project, allowed_input_topics: [@t1, @t2])

          @s1 = create(:idea_status)
          @s2 = create(:idea_status)
          @i1 = create(:idea, project: @project, topics: [@t1, @t2], idea_status: @s1)
          @i2 = create(:idea, project: @project, topics: [@t1], idea_status: @s2)
          @i3 = create(:idea, project: @project, topics: [@t2], idea_status: @s2)
          @i4 = create(:idea, project: @project, topics: [], idea_status: @s2)
          create(:idea, topics: [@t1, @t2], idea_status: @s1, project: create(:project, allowed_input_topics: [@t1, @t2]))

          # a1 -> 3
          # a2 -> 1
          # t1 -> 2
          # t2 -> 2
          # s1 -> 1
          # s2 -> 3
        end

        parameter :topics, 'Filter by topics (OR)', required: false
        parameter :projects, 'Filter by projects (OR)', required: false
        parameter :phase, 'Filter by project phase', required: false
        parameter :author, 'Filter by author (user id)', required: false
        parameter :idea_status, 'Filter by status (idea status id)', required: false
        parameter :search, 'Filter by searching in title and body', required: false
        parameter :publication_status, 'Return only ideas with the specified publication status; returns all pusblished ideas by default', required: false
        parameter :project_publication_status, "Filter by project publication_status. One of #{AdminPublication::PUBLICATION_STATUSES.join(', ')}", required: false
        parameter :feedback_needed, 'Filter out ideas that need feedback', required: false
        parameter :filter_trending, 'Filter out truly trending ideas', required: false

        let(:projects) { [@project.id] }

        example_request 'List idea counts per filter option' do
          assert_status 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :type)).to eq 'filter_counts'
          json_attributes = json_response.dig(:data, :attributes)

          expect(json_attributes[:idea_status_id][@s1.id.to_sym]).to eq 1
          expect(json_attributes[:idea_status_id][@s2.id.to_sym]).to eq 3
          expect(json_attributes[:topic_id][@t1.id.to_sym]).to eq 2
          expect(json_attributes[:topic_id][@t2.id.to_sym]).to eq 2
          expect(json_attributes[:total]).to eq 4
        end

        example 'List idea counts per filter option on topic' do
          do_request topics: [@t1.id], projects: nil
          assert_status 200
        end

        example 'List idea counts per filter option with a search string' do
          do_request search: 'trees'
          assert_status 200
        end
      end
    end

    get 'web_api/v1/ideas/:id' do
      let(:project) { create(:single_phase_budgeting_project) }
      let(:idea) { create(:idea, project: project, phases: project.phases) }
      let!(:baskets) { create_list(:basket, 2, ideas: [idea], phase: project.phases.first) }
      let!(:topic) { create(:topic, ideas: [idea], projects: [idea.project]) }
      let!(:user_reaction) { create(:reaction, user: @user, reactable: idea) }
      let!(:cosponsorship) { create(:cosponsorship, idea: idea, user: @user) }
      let(:id) { idea.id }

      example_request 'Get one idea by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)

        expect(json_response.dig(:data, :id)).to eq idea.id
        expect(json_response.dig(:data, :type)).to eq 'idea'
        expect(json_response.dig(:data, :attributes)).to include(
          slug: idea.slug,
          budget: idea.budget,
          action_descriptors: {
            editing_idea: {
              enabled: false,
              disabled_reason: 'not_author',
              future_enabled_at: nil
            },
            commenting_idea: {
              enabled: true,
              disabled_reason: nil,
              future_enabled_at: nil
            },
            reacting_idea: {
              enabled: false,
              disabled_reason: 'reacting_not_supported',
              cancelling_enabled: false,
              up: {
                enabled: false,
                disabled_reason: 'reacting_not_supported',
                future_enabled_at: nil
              },
              down: {
                enabled: false,
                disabled_reason: 'reacting_not_supported',
                future_enabled_at: nil
              }
            },
            comment_reacting_idea: {
              enabled: true,
              disabled_reason: nil,
              future_enabled_at: nil
            },
            voting: {
              enabled: true,
              disabled_reason: nil,
              future_enabled_at: nil
            }
          }
        )
        expect(json_response.dig(:data, :relationships)).to include(
          topics: {
            data: [{ id: topic.id, type: 'topic' }]
          },
          author: { data: { id: idea.author_id, type: 'user' } },
          idea_status: { data: { id: idea.idea_status_id, type: 'idea_status' } },
          user_reaction: { data: { id: user_reaction.id, type: 'reaction' } },
          cosponsors: { data: [{ id: cosponsorship.user_id, type: 'user' }] }
        )
      end
    end

    get 'web_api/v1/ideas/:id/as_xlsx' do
      let!(:project) { create(:single_phase_native_survey_project) }
      let!(:extra_field_key) { 'new_custom_field_name1' }
      let!(:extra_field_answer) { 'new_custom_field_value1' }
      let!(:form) { create(:custom_form, participation_context: project.phases.first) }
      let!(:text_field) { create(:custom_field_text, key: extra_field_key, required: true, resource: form) }
      let!(:idea) do
        idea = create(:native_survey_response, project: project, author: @user)
        idea.custom_field_values = { extra_field_key => extra_field_answer }
        idea.save!
        idea
      end
      let!(:id) { idea.id }

      example_request 'Export one idea by id' do
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]

        flat_values = worksheet.map { |r| r.cells.map(&:value) }
        question_title = flat_values[0][1]
        expect(question_title).to eq text_field.title_multiloc['en']

        question_answer = flat_values[1][1]
        expect(question_answer).to eq extra_field_answer
      end

      describe 'Errors' do
        let(:other_idea) { create(:native_survey_response, project: project) }
        let(:id) { other_idea.id }

        example '[error] Export an idea by id of which you are not the author', document: false do
          do_request id: other_idea.id
          expect(status).to eq 401
        end
      end
    end

    get 'web_api/v1/ideas/by_slug/:slug' do
      let(:idea) { create(:idea) }
      let(:slug) { idea.slug }

      example_request 'Get one idea by slug' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq idea.id
      end

      describe do
        let(:slug) { 'unexisting-idea' }

        example '[error] Get an unexisting idea', document: false do
          do_request
          expect(status).to eq 404
        end
      end
    end

    get 'web_api/v1/ideas/draft/:phase_id' do
      let(:phase) { create(:native_survey_phase) }
      let(:phase_id) { phase.id }

      context 'idea authored by user' do
        let!(:idea) do
          create(:native_survey_response, project: phase.project, author: @user, publication_status: 'draft', custom_field_values: { 'field' => 'value' })
        end

        before { @user.update!(custom_field_values: { 'gender' => 'male' }) }

        example_request 'Get a single draft idea by phase' do
          assert_status 200
          expect(response_data[:id]).to eq idea.id
          expect(response_data[:attributes]).to include(field: 'value')
          expect(response_data[:attributes]).not_to include(u_gender: 'male')
        end

        context 'when user data in the survey form is enabled' do
          example 'Get a single draft idea by phase including user data' do
            phase.update!(user_fields_in_form: true)
            @user.update!(custom_field_values: { 'gender' => 'male' })
            do_request
            assert_status 200
            expect(response_data[:id]).to eq idea.id
            expect(response_data[:attributes]).to include(field: 'value', u_gender: 'male')
          end
        end
      end

      context 'Idea authored by another user' do
        let!(:idea) { create(:idea, project: phase.project, phases: [phase], creation_phase: phase, publication_status: 'draft') }

        example '[empty idea] No draft ideas for current user', document: false do
          do_request
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).to be_nil
        end
      end

      context 'Idea is not draft' do
        let!(:idea) { create(:idea, project: phase.project, phases: [phase], creation_phase: phase, author: @user) }

        example '[empty idea] No draft ideas', document: false do
          do_request
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).to be_nil
        end
      end

      context 'Idea is not native survey' do
        let!(:idea) { create(:idea, project: phase.project, phases: [phase], author: @user, publication_status: 'draft') }

        example '[empty idea] No native survey idea found', document: false do
          do_request
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).to be_nil
        end
      end

      context 'User is not logged in' do
        let!(:idea) { create(:idea, project: phase.project, phases: [phase], author: @user, publication_status: 'draft') }

        example '[empty idea] User not logged in', document: false do
          header 'Authorization', nil
          do_request
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).to be_nil
        end
      end
    end

    post 'web_api/v1/ideas/similar_ideas' do
      with_options scope: :idea do
        parameter :title_multiloc, 'Multi-locale field with the idea title', extra: 'Maximum 100 characters'
        parameter :body_multiloc, 'Multi-locale field with the idea body', extra: 'Required if not draft'
        parameter :project_id, 'The identifier of the project that hosts the idea'
        parameter :phase_ids, 'The phases the idea is part of, defaults to the current only, only allowed by admins'
      end
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of ideas per page'
      end

      let(:project) { create(:project_with_active_ideation_phase) }
      let(:project_id) { project.id }
      let(:idea) { create(:idea, project:) }
      let(:title_multiloc) { { 'en' => 'My similar idea' } }
      let(:embeddings) { JSON.parse(File.read('spec/fixtures/word_embeddings.json')) }
      let!(:idea_pizza) { create(:embeddings_similarity, embedding: embeddings['pizza'], embeddable: create(:idea, project:)).embeddable }
      let!(:idea_burger) { create(:embeddings_similarity, embedding: embeddings['burger'], embeddable: create(:idea, project:)).embeddable }
      let!(:idea_moon) { create(:embeddings_similarity, embedding: embeddings['moon'], embeddable: create(:idea, project:)).embeddable }
      let!(:idea_bats) { create(:embeddings_similarity, embedding: embeddings['bats'], embeddable: create(:idea, project:)).embeddable }

      describe do
        before do
          allow_any_instance_of(CohereMultilingualEmbeddings).to receive(:embedding) do
            embeddings['pizza']
          end

          SettingsService.new.activate_feature! 'input_iq'
          project.phases.first.update!(similarity_threshold_title: 0.3, similarity_threshold_body: 0.0)
        end

        example_request 'Get similar ideas' do
          assert_status 200
          expect(json_parse(response_body)[:data].pluck(:id)).to eq [idea_pizza.id]
        end

        example 'Caches the request' do
          expect_any_instance_of(SimilarIdeasService).to receive(:similar_ideas).once.and_call_original
          do_request
          assert_status 200
          do_request
          assert_status 200
        end

        example 'Fetches the similarity thresholds from the corresponding phase' do
          expect_any_instance_of(SimilarIdeasService).to receive(:similar_ideas).with(
            title_threshold: 0.3,
            body_threshold: 0.0,
            scope: anything,
            limit: 5
          ).and_call_original
          do_request
          assert_status 200
        end

        example 'Excludes ideas outside the project or not visible to the current user' do
          idea_outside_project = create(:embeddings_similarity, embedding: embeddings['pizza'], embeddable: create(:idea, project: create(:project))).embeddable
          idea_outside_scope = create(:embeddings_similarity, embedding: embeddings['pizza'], embeddable: create(:idea, project:, publication_status: 'draft')).embeddable
          do_request
          assert_status 200
          expect(json_parse(response_body)[:data].pluck(:id)).to eq [idea_pizza.id]
          expect(json_parse(response_body)[:data].pluck(:id)).not_to include(idea_outside_project.id)
          expect(json_parse(response_body)[:data].pluck(:id)).not_to include(idea_outside_scope.id)
        end
      end
    end

    delete 'web_api/v1/ideas/:id' do
      let(:id) { input.id }

      context 'when the idea belongs to a phase' do
        let!(:input) { create(:idea, author: user, project: project, publication_status: 'published') }
        let(:project) { create(:project_with_phases) }
        let(:phase) { project.phases.first }

        before do
          allow_any_instance_of(IdeaPolicy).to receive(:destroy?).and_return(true)
          input.update!(phases: [phase])
        end

        example 'the count starts at 1' do
          expect(phase.reload.ideas_count).to eq 1
        end

        example_request 'Delete an idea' do
          expect(response_status).to eq 200
          expect { Idea.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
          expect(project.reload.ideas_count).to eq 0
          expect(phase.reload.ideas_count).to eq 0
        end
      end

      describe do
        let(:input) { create(:proposal, author: user) }

        example_request 'Delete a proposal' do
          assert_status 200
          expect { Idea.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      context 'when a voting context' do
        let(:project) { create(:single_phase_budgeting_project) }
        let(:input) { create(:idea, project: project, phases: project.phases) }

        example_request '[error] Normal resident cannot delete an idea in a voting context', document: false do
          assert_status 401
          expect(json_parse(response_body)).to include_response_error(:base, 'Unauthorized!')
        end
      end
    end
  end

  context 'when not logged in' do
    let(:user) { create(:user) }
    let(:project) { create(:single_phase_proposals_project) }

    let(:ineligible_proposal) do
      create(
        :idea,
        project: project,
        idea_status: create(:proposals_status, code: 'ineligible')
      )
    end

    let(:expired_proposal) do
      create(
        :idea,
        project: project,
        idea_status: create(:proposals_status, code: 'expired')
      )
    end

    let(:proposed_proposal) do
      create(
        :idea,
        project: project,
        idea_status: create(:proposals_status, code: 'proposed')
      )
    end

    let(:upvote_disabled_reason) do
      response_data.dig(
        :attributes,
        :action_descriptors,
        :reacting_idea,
        :up,
        :disabled_reason
      )
    end

    get 'web_api/v1/ideas/by_slug/:slug' do
      example 'Includes not_reactable_status_code in response when ineligible' do
        do_request slug: ineligible_proposal.slug

        expect(status).to eq 200
        expect(upvote_disabled_reason).to eq 'not_reactable_status_code'
      end

      example 'Includes not_reactable_status_code in response when expired' do
        do_request slug: expired_proposal.slug

        expect(status).to eq 200
        expect(upvote_disabled_reason).to eq 'not_reactable_status_code'
      end

      example 'Includes user_not_signed_in in response when proposed' do
        do_request slug: proposed_proposal.slug

        expect(status).to eq 200
        expect(upvote_disabled_reason).to eq 'user_not_signed_in'
      end
    end
  end
end
