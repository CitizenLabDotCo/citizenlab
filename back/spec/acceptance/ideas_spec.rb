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
      create(:idea_status_proposed)
      header_token_for user
    end

    get 'web_api/v1/ideas' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of ideas per page'
      end
      parameter :topics, 'Filter by topics (OR)', required: false
      parameter :projects, 'Filter by projects (OR)', required: false
      parameter :phase, 'Filter by project phase', required: false
      parameter :basket_id, 'Filter by basket', required: false
      parameter :author, 'Filter by author (user id)', required: false
      parameter :idea_status, 'Filter by status (idea status id)', required: false
      parameter :search, 'Filter by searching in title and body', required: false
      parameter :sort, "Either 'new', '-new', 'trending', '-trending', 'popular', '-popular', 'author_name', '-author_name', 'likes_count', '-likes_count', 'dislikes_count', '-dislikes_count', 'status', '-status', 'baskets_count', '-baskets_count', 'votes_count', '-votes_count', 'budget', '-budget', 'random'", required: false
      parameter :publication_status, 'Filter by publication status; returns all published ideas by default', required: false
      parameter :project_publication_status, "Filter by project publication_status. One of #{AdminPublication::PUBLICATION_STATUSES.join(', ')}", required: false
      parameter :feedback_needed, 'Filter out ideas that need feedback', required: false
      parameter :filter_trending, 'Filter out truly trending ideas', required: false

      describe do
        before do
          @ideas = %w[published published draft published published published].map do |ps|
            create(:idea, publication_status: ps)
          end
          survey_project = create(:single_phase_native_survey_project)
          create(:idea, project: survey_project, creation_phase: survey_project.phases.first)
        end

        example_request 'List all published ideas (default behaviour)' do
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 5
          expect(json_response[:data].map { |d| d.dig(:attributes, :publication_status) }).to all(eq 'published')
        end

        example 'Don\'t list drafts (default behaviour)', document: false do
          do_request publication_status: 'draft'
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 0
        end

        example 'List all ideas for a topic' do
          t1 = create(:topic)

          i1 = @ideas.first
          i1.project.update!(allowed_input_topics: Topic.all)
          i1.topics << t1
          i1.save!

          do_request topics: [t1.id]
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq i1.id
        end

        example 'List all ideas for a topic with other filters enabled', document: false do
          t1 = create(:topic)

          i1 = @ideas.first
          i1.project.update!(allowed_input_topics: Topic.all)
          i1.topics << t1
          i1.save!

          do_request topics: [t1.id], sort: 'random'
          expect(status).to eq(200)
        end

        example 'List all ideas which match one of the given topics', document: false do
          t1 = create(:topic)
          t2 = create(:topic)
          t3 = create(:topic)

          i1 = @ideas[0]
          i1.project.update!(allowed_input_topics: Topic.all)
          i1.topics = [t1, t3]
          i1.save!
          i2 = @ideas[1]
          i2.project.update!(allowed_input_topics: Topic.all)
          i2.topics = [t2]
          i2.save!
          i3 = @ideas[3]
          i3.project.update!(allowed_input_topics: Topic.all)
          i3.topics = [t3, t1, t2]
          i3.save!

          do_request topics: [t1.id, t2.id]
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 3
          expect(json_response[:data].pluck(:id)).to match_array [i1.id, i2.id, i3.id]
        end

        example 'List all ideas in a project' do
          l = create(:single_phase_ideation_project)
          i = create(:idea, project: l)

          do_request projects: [l.id]

          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq i.id
        end

        example 'List all ideas in any of the given projects', document: false do
          i1 = create(:idea)
          i2 = create(:idea)

          do_request projects: [i1.project.id, i2.project.id]

          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].pluck(:id)).to match_array [i1.id, i2.id]
        end

        example 'List all ideas in a phase of a project' do
          pr = create(:project_with_phases)
          ph1 = pr.phases.first
          ph2 = pr.phases.second
          ideas = [
            create(:idea, phases: [ph1], project: pr),
            create(:idea, phases: [ph2], project: pr),
            create(:idea, phases: [ph1, ph2], project: pr)
          ]

          do_request phase: ph2.id
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].pluck(:id)).to match_array [ideas[1].id, ideas[2].id]
        end

        example 'List all ideas in a basket' do
          basket = create(:basket)
          [@ideas[1], @ideas[2], @ideas[5]].each { _1.baskets << basket }

          do_request(basket_id: basket.id)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].pluck(:id)).to match_array [@ideas[1].id, @ideas[5].id]
        end

        example 'List all ideas in published projects' do
          idea = create(:idea, project: create(:project, admin_publication_attributes: { publication_status: 'archived' }))
          do_request(project_publication_status: 'published')
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 5
          expect(json_response[:data].pluck(:id)).not_to include(idea.id)
        end

        example 'List all ideas for an idea status' do
          status = create(:idea_status)
          i = create(:idea, idea_status: status)

          do_request idea_status: status.id
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq i.id
        end

        example 'List all ideas for a user' do
          u = create(:user)
          i = create(:idea, author: u)

          do_request author: u.id
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq i.id
        end

        example 'List all ideas that need feedback' do
          proposed = create(:idea_status_proposed)
          i = create(:idea, idea_status: proposed)

          do_request feedback_needed: true
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq i.id
        end

        example 'Search for ideas' do
          initiatives = [
            create(:idea, title_multiloc: { en: 'This idea is uniqque' }),
            create(:idea, title_multiloc: { en: 'This one origiinal' })
          ]

          do_request search: 'uniqque'
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq initiatives[0].id
        end

        example 'List all ideas sorted by new' do
          i1 = create(:idea)

          do_request sort: 'new'
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 6
          expect(json_response[:data][0][:id]).to eq i1.id
        end

        example 'List all ideas by random ordering', document: false do
          create(:idea)

          do_request sort: 'random'
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 6
        end

        example 'List all ideas includes the user_reaction and user_follower', document: false do
          reaction = create(:reaction, user: @user)
          follower = create(:follower, followable: create(:idea), user: @user)

          do_request
          json_response = json_parse(response_body)
          expect(json_response[:data].filter_map { |d| d.dig(:relationships, :user_reaction, :data, :id) }.first).to eq reaction.id
          expect(json_response[:data].filter_map { |d| d.dig(:relationships, :user_follower, :data, :id) }.first).to eq follower.id
          expect(json_response[:included].pluck(:id)).to include reaction.id
        end

        example 'Search for ideas should work with trending ordering', document: false do
          i1 = Idea.first
          i1.title_multiloc['nl-BE'] = 'Park met blauwe bomen'
          i1.title_multiloc['en'] = 'A park with orange grass'
          i1.save!

          do_request search: 'Park', sort: 'trending'
          expect(status).to eq(200)
        end

        example 'Default trending ordering', document: false do
          do_request project_publication_status: 'published', sort: 'trending'
          expect(status).to eq(200)
        end

        example 'List all ideas in a phase of a project - baskets_count and votes_count are overwritten with values from ideas_phase' do
          pr = create(:project_with_active_budgeting_phase)
          phase = pr.phases.first
          ideas = create_list(:idea, 2, phases: [phase], project: pr)
          basket = create(:basket, phase: phase, submitted_at: nil)
          basket2 = create(:basket, phase: phase, submitted_at: nil)
          basket.update!(ideas: ideas, submitted_at: Time.zone.now)
          basket2.update!(ideas: ideas, submitted_at: Time.zone.now)
          SideFxBasketService.new.after_update basket, user
          SideFxBasketService.new.after_update basket2, user

          # Different phase (should be ignored in the counts)
          phase2 = create(:single_voting_phase, project: pr)
          basket3 = create(:basket, phase: phase2, submitted_at: nil)
          basket3.update!(ideas: ideas, submitted_at: Time.zone.now)
          SideFxBasketService.new.after_update basket3, user

          do_request phase: phase.id
          assert_status 200

          expect(response_data.size).to eq 2
          expect(response_data.pluck(:id)).to match_array [ideas[0].id, ideas[1].id]
          ideas_phases = json_response_body[:included].map { |i| i if i[:type] == 'ideas_phase' }.compact!
          expect(ideas_phases.size).to eq 2
          expect(ideas_phases[0][:attributes][:baskets_count]).to eq 2
          expect(ideas_phases[1][:attributes][:baskets_count]).to eq 2

          # Check the value in idea has also been overwritten
          expect(ideas[0].reload[:baskets_count]).to eq 3
          expect(response_data[0][:attributes][:baskets_count]).to eq 2
        end
      end
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
          locations = [[51.044039, 3.716964], [50.845552, 4.357355], [50.640255, 5.571848], [50.950772, 4.308304], [51.215929, 4.422602], [50.453848, 3.952217], [-27.148983, -109.424659]]
          placenames = ['Ghent', 'Brussels', 'Liège', 'Meise', 'Antwerp', 'Mons', 'Hanga Roa']
          @ideas = locations.zip(placenames).map do |location, placename|
            create(
              :idea,
              location_point_geojson: { 'type' => 'Point', 'coordinates' => location },
              title_multiloc: { 'en' => placename }
            )
          end
        end

        example 'List all idea markers within a bounding box' do
          do_request(bounding_box: '[51.208758,3.224363,50.000667,5.715281]') # Bruges-Bastogne

          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 5
          expect(json_response[:data].map { |d| d.dig(:attributes, :title_multiloc, :en) }.sort).to match %w[Ghent Brussels Liège Meise Mons].sort
        end

        example 'List all idea markers in a phase of a project', document: false do
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
          user_reaction: { data: { id: user_reaction.id, type: 'reaction' } }
        )
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
          create(:idea, project: phase.project, phases: [phase], creation_phase: phase, author: @user, publication_status: 'draft')
        end

        example_request 'Get a single draft idea by phase' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).to eq idea.id
        end
      end

      context 'Idea authored by another user' do
        let!(:idea) { create(:idea, project: phase.project, phases: [phase], creation_phase: phase, publication_status: 'draft') }

        example '[error] No draft ideas for current user', document: false do
          do_request
          expect(status).to eq 404
        end
      end

      context 'Idea is not draft' do
        let!(:idea) { create(:idea, project: phase.project, phases: [phase], creation_phase: phase, author: @user) }

        example '[error] No draft ideas', document: false do
          do_request
          expect(status).to eq 404
        end
      end

      context 'Idea is not native survey' do
        let!(:idea) { create(:idea, project: phase.project, phases: [phase], author: @user, publication_status: 'draft') }

        example '[error] No native survey idea found', document: false do
          do_request
          expect(status).to eq 404
        end
      end
    end

    delete 'web_api/v1/ideas/:id' do
      context 'when the idea belongs to a phase' do
        let!(:idea) { create(:idea, author: user, project: project, publication_status: 'published') }
        let(:project) { create(:project_with_phases) }
        let(:phase) { project.phases.first }
        let(:id) { idea.id }

        before do
          allow_any_instance_of(IdeaPolicy).to receive(:destroy?).and_return(true)
          idea.ideas_phases.create!(phase: phase)
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

      context 'when a voting context' do
        let(:project) { create(:single_phase_budgeting_project) }
        let(:idea) { create(:idea, project: project, phases: project.phases) }
        let(:id) { idea.id }

        example_request '[error] Normal resident cannot delete an idea in a voting context', document: false do
          assert_status 401
          expect(json_parse(response_body)).to include_response_error(:base, 'Unauthorized!')
        end
      end
    end
  end
end
