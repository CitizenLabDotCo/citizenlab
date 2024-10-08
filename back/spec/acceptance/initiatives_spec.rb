# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Initiatives' do
  explanation 'Proposals from citizens (but more spontaneous than ideas) to the city.'

  before do
    header 'Content-Type', 'application/json'
    @first_admin = create(:admin)
    @initiatives = %w[published published draft published published published].map { |ps| create(:initiative, publication_status: ps, assignee: create(:admin)) }
    @user = create(:user)
    header_token_for @user
  end

  # TODO: cleanup-after-proposals-migration
  get 'web_api/v1/initiatives' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of initiatives per page'
    end
    parameter :author, 'Filter by author (user id)', required: false
    parameter :publication_status, 'Filter by publication status; returns all publlished initiatives by default', required: false
    parameter :topics, 'Filter by topics (OR)', required: false
    parameter :areas, 'Filter by areas (OR)', required: false
    parameter :initiative_status, 'Filter by status (initiative status id)', required: false
    parameter :assignee, 'Filter by assignee (user id)', required: false
    parameter :search, 'Filter by searching in title and body', required: false
    parameter :feedback_needed, 'Filter out initiatives that need feedback', required: false
    parameter :sort, "Either 'trending' (default), 'new', '-new', 'author_name', '-author_name', 'likes_count', '-likes_count', 'status', '-status', 'random'", required: false

    example_request 'List all published initiatives (default behaviour)' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
      expect(json_response[:data].map { |d| d.dig(:attributes, :publication_status) }).to all(eq 'published')
    end

    example "Don't list drafts (default behaviour)", document: false do
      do_request publication_status: 'draft'

      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 0
    end

    example 'List all initiatives which match one of the given topics', document: false do
      t1 = create(:topic)
      t2 = create(:topic)

      i1 = @initiatives[0]
      i1.topics = [t1]
      i1.save
      i2 = @initiatives[1]
      i2.topics = [t2]
      i2.save

      do_request topics: [t1.id, t2.id]
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].pluck(:id)).to match_array [i1.id, i2.id]
    end

    example 'List all initiatives which match one of the given areas', document: false do
      a1 = create(:area)
      a2 = create(:area)

      i1 = @initiatives.first
      i1.areas = [a1]
      i1.save
      i2 = @initiatives.second
      i2.areas = [a2]
      i2.save

      do_request areas: [a1.id, a2.id]
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].pluck(:id)).to match_array [i1.id, i2.id]
    end

    example 'List all initiatives for a user' do
      u = create(:user)
      i = create(:initiative, author: u)

      do_request author: u.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example 'List all initiatives for an initiative status', document: false do
      status = create(:initiative_status)
      i = create(:initiative, initiative_status: status)

      do_request initiative_status: status.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example 'List all initiatives for an assignee', document: false do
      a = create(:admin)
      i = create(:initiative, assignee: a)

      do_request assignee: a.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example 'List all unassigned initiatives' do
      create(:initiative, assignee: create(:admin))
      initiatives = create_list(:initiative, 2, assignee: nil)

      do_request assignee: 'unassigned'

      assert_status 200
      json_response = json_parse response_body
      expect(json_response[:data].size).to eq 2
      expect(json_response[:data].pluck(:id)).to match_array initiatives.map(&:id)
    end

    example 'List all initiatives that need feedback', document: false do
      threshold_reached = create(:initiative_status_threshold_reached)
      i = create(:initiative, initiative_status: threshold_reached)

      do_request feedback_needed: true
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example 'Search for initiatives', document: false do
      create(:user)
      initiatives = [
        create(:initiative, title_multiloc: { en: 'This initiative is uniqque' }),
        create(:initiative, title_multiloc: { en: 'This one origiinal' })
      ]

      do_request search: 'uniqque'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq initiatives[0].id
    end

    example 'List all initiatives sorted by new', document: false do
      create(:user)
      i1 = create(:initiative)

      do_request sort: 'new'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example 'List all initiatives by random ordering', document: false do
      create(:user)
      create(:initiative)

      do_request sort: 'random'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
    end

    example 'List all initiatives includes the user_reaction and user_follower', document: false do
      initiative = create(:initiative)
      reaction = create(:reaction, reactable: initiative, user: @user)
      follower = create(:follower, followable: create(:initiative), user: @user)

      do_request
      json_response = json_parse(response_body)
      expect(json_response[:data].filter_map { |d| d.dig(:relationships, :user_reaction, :data, :id) }.first).to eq reaction.id
      expect(json_response[:data].filter_map { |d| d.dig(:relationships, :user_follower, :data, :id) }.first).to eq follower.id
      expect(json_response[:included].pluck(:id)).to include reaction.id
    end
  end

  # TODO: cleanup-after-proposals-migration
  get 'web_api/v1/initiatives/as_markers' do
    before do
      locations = [[51.044039, 3.716964], [50.845552, 4.357355], [50.640255, 5.571848], [50.950772, 4.308304], [51.215929, 4.422602], [50.453848, 3.952217], [-27.148983, -109.424659]]
      placenames = ['Ghent', 'Brussels', 'Liège', 'Meise', 'Antwerp', 'Mons', 'Hanga Roa']
      @initiatives.each do |i|
        i.location_point_geojson = { 'type' => 'Point', 'coordinates' => locations.pop }
        i.title_multiloc['en'] = placenames.pop
        i.publication_status = 'published'
        i.save!
      end
    end

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of initiatives per page'
    end
    parameter :author, 'Filter by author (user id)', required: false
    parameter :publication_status, 'Return only initiatives with the specified publication status; returns all pusblished initiatives by default', required: false
    parameter :bounding_box, 'Given an [x1,y1,x2,y2] array of doubles (x being latitude and y being longitude), the markers are filtered to only retain those within the (x1,y1)-(x2,y2) box.', required: false
    parameter :topics, 'Filter by topics (OR)', required: false
    parameter :areas, 'Filter by areas (OR)', required: false
    parameter :assignee, 'Filter by assignee (user id)', required: false
    parameter :search, 'Filter by searching in title and body', required: false

    example 'List all markers within a bounding box' do
      do_request(bounding_box: '[51.208758,3.224363,50.000667,5.715281]') # Bruges-Bastogne

      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
      expect(json_response[:data].map { |d| d.dig(:attributes, :title_multiloc, :en) }.sort).to match %w[Brussels Liège Meise Mons].sort
    end
  end

  # TODO: move-old-proposals-test
  get 'web_api/v1/initiatives/as_xlsx' do
    before { admin_header_token }

    parameter :initiatives, 'Filter by a given list of initiative ids', required: false

    example_request 'XLSX export' do
      assert_status 200
    end

    describe do
      before do
        @selected_initiatives = @initiatives.select(&:published?).shuffle.take 2
      end

      let(:initiatives) { @selected_initiatives.map(&:id) }

      example_request 'XLSX export by initiative ids', document: false do
        assert_status 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq(@selected_initiatives.size + 1)
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

  # TODO: cleanup-after-proposals-migration
  get 'web_api/v1/initiatives/filter_counts' do
    before do
      Initiative.all.each(&:destroy!)
      @t1 = create(:topic)
      @t2 = create(:topic)
      @a1 = create(:area)
      @a2 = create(:area)
      @s1 = create(:initiative_status)
      @s2 = create(:initiative_status)
      @i1 = create(:initiative, topics: [@t1, @t2], areas: [@a1], initiative_status: @s1)
      @i2 = create(:initiative, topics: [@t1], areas: [@a1, @a2], initiative_status: @s2)
      @i3 = create(:initiative, topics: [@t2], areas: [], initiative_status: @s2)
      @i4 = create(:initiative, topics: [], areas: [@a1], initiative_status: @s2)

      # a1 -> 3
      # a2 -> 1
      # t1 -> 2
      # t2 -> 2
      # s1 -> 1
      # s2 -> 3
    end

    parameter :topics, 'Filter by topics (OR)', required: false
    parameter :areas, 'Filter by areas (OR)', required: false
    parameter :author, 'Filter by author (user id)', required: false
    parameter :assignee, 'Filter by assignee (user id)', required: false
    parameter :initiative_status, 'Filter by status (initiative status id)', required: false
    parameter :search, 'Filter by searching in title and body', required: false
    parameter :publication_status, 'Return only initiatives with the specified publication status; returns all pusblished initiatives by default', required: false

    example_request 'List initiative counts per filter option' do
      assert_status 200
      json_response = json_parse response_body
      expect(json_response.dig(:data, :type)).to eq 'filter_counts'

      expect(json_response.dig(:data, :attributes, :initiative_status_id)[@s1.id.to_sym]).to eq 1
      expect(json_response.dig(:data, :attributes, :initiative_status_id)[@s2.id.to_sym]).to eq 3
      expect(json_response.dig(:data, :attributes, :area_id)[@a1.id.to_sym]).to eq 3
      expect(json_response.dig(:data, :attributes, :area_id)[@a2.id.to_sym]).to eq 1
      expect(json_response.dig(:data, :attributes, :topic_id)[@t1.id.to_sym]).to eq 2
      expect(json_response.dig(:data, :attributes, :topic_id)[@t2.id.to_sym]).to eq 2
      expect(json_response.dig(:data, :attributes, :total)).to eq 4
    end

    example 'List initiative counts per filter option on topic', document: false do
      do_request topics: [@t1.id]
      assert_status 200
    end

    example 'List initiative counts per filter option on area', document: false do
      do_request areas: [@a1.id]
      assert_status 200
    end

    example 'List initiative counts when also using search filtering AND sort', document: false do
      do_request(search: 'uniqque', sort: 'new')
      assert_status 200
    end
  end

  get 'web_api/v1/initiatives/:id' do
    let(:initiative) { @initiatives.first }
    let(:id) { initiative.id }

    example_request 'Get one initiative by id' do
      assert_status 200
      expect(response_data[:id]).to eq initiative.id
      expect(response_data[:attributes]).to include(
        anonymous: false,
        author_hash: initiative.author_hash
      )
    end
  end

  get 'web_api/v1/initiatives/by_slug/:slug' do
    let(:slug) { @initiatives.first.slug }

    example_request 'Get one initiative by slug' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @initiatives.first.id
    end

    describe do
      let(:slug) { 'unexisting-initiative' }

      example '[error] Get an unexisting initiative', document: false do
        do_request
        assert_status 404
      end
    end
  end

  # TODO: cleanup-after-proposals-migration
  post 'web_api/v1/initiatives' do
    before do
      create(:initiative_status, code: 'proposed')
    end

    with_options scope: :initiative do
      parameter :author_id, 'The user id of the user owning the initiative. This can only be specified by moderators and is inferred from the JWT token for residents.'
      parameter :publication_status, 'Publication status', required: true, extra: "One of #{Post::PUBLICATION_STATUSES.join(',')}"
      parameter :title_multiloc, 'Multi-locale field with the initiative title', required: true, extra: 'Maximum 100 characters'
      parameter :body_multiloc, 'Multi-locale field with the initiative body', extra: 'Required if not draft'
      parameter :location_point_geojson, 'A GeoJSON point that situates the location the initiative applies to'
      parameter :location_description, 'A human readable description of the location the initiative applies to'
      parameter :header_bg, 'Base64 encoded header image'
      parameter :topic_ids, 'Array of ids of the associated topics'
      parameter :area_ids, 'Array of ids of the associated areas'
      parameter :assignee_id, 'The user id of the admin that takes ownership. Set automatically if not provided. Only allowed for admins.'
      parameter :anonymous, 'Post this initiative anonymously - true/false'
      parameter :cosponsor_ids, 'Array of user ids of the desired cosponsors'
    end
    ValidationErrorHelper.new.error_fields(self, Initiative)

    let(:initiative) { build(:initiative) }
    let(:publication_status) { 'published' }
    let(:title_multiloc) { initiative.title_multiloc }
    let(:body_multiloc) { initiative.body_multiloc }
    let(:location_point_geojson) { { type: 'Point', coordinates: [51.11520776293035, 3.921154106874878] } }
    let(:location_description) { 'Stanley Road 4' }
    let(:header_bg) { file_as_base64 'header.jpg', 'image/jpeg' }
    let(:topic_ids) { create_list(:topic, 2).map(&:id) }
    let(:area_ids) { create_list(:area, 2).map(&:id) }
    let(:assignee_id) { create(:admin).id }

    describe do
      before do
        @user.add_role 'admin'
        @user.save!
      end

      example_request 'Create an initiative' do
        assert_status 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :location_point_geojson)).to eq location_point_geojson
        expect(json_response.dig(:data, :attributes, :location_description)).to eq location_description
        expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
        expect(json_response.dig(:data, :relationships, :areas, :data).pluck(:id)).to match_array area_ids
        expect(json_response.dig(:data, :relationships, :assignee, :data, :id)).to eq assignee_id
      end

      example 'Check for the automatic creation of a like by the author when an initiative is created', document: false do
        do_request
        json_response = json_parse(response_body)
        new_initiative = Initiative.find(json_response.dig(:data, :id))
        expect(new_initiative.reactions.size).to eq 1
        expect(new_initiative.reactions[0].mode).to eq 'up'
        expect(new_initiative.reactions[0].user.id).to eq @user.id
        expect(json_response[:data][:attributes][:likes_count]).to eq 1
      end

      example 'Check for the automatic assignement of the default assignee', document: false do
        do_request(initiative: { assignee_id: nil })
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :assignee, :data, :id)).to eq @first_admin.id
      end
    end

    example_group 'with permissions on phase' do
      let(:group) { create(:group) }

      before do
        Permissions::PermissionsUpdateService.new.update_global_permissions
        Permission.find_by(permission_scope: nil, action: 'posting_initiative')
          .update!(permitted_by: 'users', groups: [group])
      end

      example '[error] Not authorized to create an initiative', document: false do
        do_request
        assert_status 401
      end

      example 'Create an initiative (group permission)' do
        group.add_member(@user).save!
        do_request
        assert_status 201
      end
    end

    describe do
      before { SettingsService.new.activate_feature! 'blocking_profanity' }

      let(:title_multiloc) { { 'nl-BE' => 'Fuck' } }
      let(:body_multiloc) { { 'fr-FR' => 'Fuck' } }

      example_request '[error] Create an initiative with blocked words' do
        assert_status 422
        json_response = json_parse(response_body)
        title_multiloc_error = json_response
          .dig(:errors, :title_multiloc)&.select { |err| err[:error] == 'includes_banned_words' }
        body_multiloc_error = json_response
          .dig(:errors, :body_multiloc)&.select { |err| err[:error] == 'includes_banned_words' }
        expect(title_multiloc_error).to be_present
        expect(body_multiloc_error).to be_present
      end
    end

    describe 'anomymous posting of inititatives' do
      let(:allow_anonymous_participation) { true }
      let(:anonymous) { true }

      before do
        config = AppConfiguration.instance
        config.settings['initiatives']['allow_anonymous_participation'] = allow_anonymous_participation
        config.save!
      end

      example_request 'Create an anonymous initiative' do
        assert_status 201
        expect(response_data.dig(:relationships, :author, :data, :id)).to be_nil
        expect(response_data.dig(:attributes, :anonymous)).to be true
        expect(response_data.dig(:attributes, :author_name)).to be_nil
      end

      example 'Does not log activities for the author', document: false do
        expect { do_request }.not_to have_enqueued_job(LogActivityJob).with(anything, anything, @user, anything)
      end

      example 'Does not add the author as a follower of the initiative', document: false do
        expect { do_request }.not_to change(Follower, :count)
        initiative_id = response_data[:id]
        expect(Follower.where(followable_id: initiative_id, user: @user)).not_to exist
      end

      describe 'when anonymous posting is not allowed' do
        let(:allow_anonymous_participation) { false }

        example_request 'Rejects the anonymous parameter' do
          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to include_response_error(:base, 'anonymous_participation_not_allowed')
        end
      end
    end

    describe 'cosponsor_ids' do
      let(:cosponsor) { create(:user) }
      let(:cosponsor_ids) { [cosponsor.id] }

      example 'Update the cosponsors of an initiative' do
        expect { do_request }
          .to have_enqueued_job(LogActivityJob)
          .with(instance_of(CosponsorsInitiative), 'created', @user, instance_of(Integer))
          .exactly(1).times

        assert_status 201
        json_response = json_parse(response_body)

        expect(json_response.dig(:data, :relationships, :cosponsors, :data).pluck(:id)).to match_array cosponsor_ids
      end
    end
  end

  # TODO: cleanup-after-proposals-migration
  patch 'web_api/v1/initiatives/:id' do
    before do
      create(:initiative_status, code: 'proposed')
      @initiative = create(:initiative, author: @user)
    end

    with_options scope: :initiative do
      parameter :author_id, 'The user id of the user owning the initiative. This can only be specified by moderators and is inferred from the JWT token for residents.'
      parameter :publication_status, "Either #{Post::PUBLICATION_STATUSES.join(', ')}"
      parameter :title_multiloc, 'Multi-locale field with the initiative title', extra: 'Maximum 100 characters'
      parameter :body_multiloc, 'Multi-locale field with the initiative body', extra: 'Required if not draft'
      parameter :location_point_geojson, 'A GeoJSON point that situates the location the initiative applies to'
      parameter :location_description, 'A human readable description of the location the initiative applies to'
      parameter :header_bg, 'Base64 encoded header image'
      parameter :topic_ids, 'Array of ids of the associated topics'
      parameter :area_ids, 'Array of ids of the associated areas'
      parameter :assignee_id, 'The user id of the admin that takes ownership. Only allowed for admins.'
      parameter :anonymous, 'Post this initiative anonymously - true/false'
      parameter :cosponsor_ids, 'Array of user ids of the desired cosponsors'
    end
    ValidationErrorHelper.new.error_fields(self, Initiative)

    describe 'published initiatives' do
      let(:id) { @initiative.id }
      let(:location_point_geojson) { { type: 'Point', coordinates: [51.4365635, 3.825930459] } }
      let(:location_description) { 'Watkins Road 8' }
      let(:header_bg) { file_as_base64 'header.jpg', 'image/jpeg' }
      let(:topic_ids) { create_list(:topic, 2).map(&:id) }
      let(:area_ids) { create_list(:area, 2).map(&:id) }

      describe do
        let(:title_multiloc) { { 'en' => 'Changed title' } }

        example_request 'Update an initiative' do
          expect(status).to be 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
          expect(json_response.dig(:data, :attributes, :location_point_geojson)).to eq location_point_geojson
          expect(json_response.dig(:data, :attributes, :location_description)).to eq location_description
          expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
          expect(json_response.dig(:data, :relationships, :areas, :data).pluck(:id)).to match_array area_ids
        end
      end

      describe do
        let(:id) { @initiative.id }
        let(:header_bg) { file_as_base64 'header.jpg', 'image/jpeg' }

        example 'The header image can be updated and the file is present', document: false do
          do_request
          expect(@initiative.reload.header_bg_url).to be_present
          expect(@initiative.reload.header_bg.file).to be_present
        end
      end

      describe do
        let(:id) { @initiative.id }

        example 'The header image can be removed' do
          @initiative.update!(header_bg: Rails.root.join('spec/fixtures/header.jpg').open)
          expect(@initiative.reload.header_bg_url).to be_present
          do_request initiative: { header_bg: nil }
          expect(@initiative.reload.header_bg_url).to be_nil
        end
      end

      describe do
        let(:topic_ids) { [] }
        let(:area_ids) { [] }

        example 'Remove the topics/areas', document: false do
          @initiative.topics = create_list(:topic, 2)
          @initiative.areas = create_list(:area, 2)
          do_request
          expect(status).to be 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
          expect(json_response.dig(:data, :relationships, :areas, :data).pluck(:id)).to match_array area_ids
        end
      end

      describe do
        let(:assignee_id) { create(:admin).id }

        example 'Changing the assignee as a non-admin does not work', document: false do
          do_request
          expect(status).to be 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :relationships, :assignee)).to be_nil
        end
      end

      describe 'changing the author of my own initiative' do
        let(:author_id) { create(:admin).id }

        example '[Error] Cannot change the author from your own id as a non-admin', document: false do
          do_request
          expect(@initiative.reload.author_id).not_to eq author_id
        end
      end

      describe 'changing the author of another authors initiative' do
        let(:author_id) { @user.id }

        example '[Error] Cannot update another authors record to your own id as a non-admin', document: false do
          @initiative.update!(author: create(:user))
          do_request
          assert_status 401
          expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'Unauthorized!'
        end
      end

      describe 'updating anomymous initiatives' do
        let(:allow_anonymous_participation) { true }
        let(:anonymous) { true }

        before do
          config = AppConfiguration.instance
          config.settings['initiatives']['allow_anonymous_participation'] = allow_anonymous_participation
          config.save!
        end

        example_request 'Change a published initiative to anonymous' do
          assert_status 200
          expect(response_data.dig(:relationships, :author, :data, :id)).to be_nil
          expect(response_data.dig(:attributes, :anonymous)).to be true
          expect(response_data.dig(:attributes, :author_name)).to be_nil
        end

        example '[Error] Cannot update an anonymous initiative as a non-admin' do
          @initiative.update!(anonymous: true)
          do_request
          assert_status 401
          expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'Unauthorized!'
        end

        example 'Does not log activities for the author and clears the author from past activities', document: false do
          clear_activity = create(:activity, item: @initiative, user: @user)
          other_item_activity = create(:activity, item: @initiative, user: create(:user))
          other_user_activity = create(:activity, user: @user)

          expect { do_request }.not_to have_enqueued_job(LogActivityJob).with(anything, anything, @user, anything)
          expect(clear_activity.reload.user_id).to be_nil
          expect(other_item_activity.reload.user_id).to be_present
          expect(other_user_activity.reload.user_id).to eq @user.id
        end

        describe 'when anonymous posting is not allowed' do
          let(:allow_anonymous_participation) { false }

          example_request 'Rejects the anonymous parameter' do
            assert_status 422
            json_response = json_parse response_body
            expect(json_response).to include_response_error(:base, 'anonymous_participation_not_allowed')
          end
        end
      end
    end

    describe 'draft initiatives' do
      before do
        @initiative = create(:initiative, author: @user, publication_status: 'draft')
      end

      parameter :publication_status, "Either #{Post::PUBLICATION_STATUSES.join(', ')}", required: true, scope: :initiative

      let(:id) { @initiative.id }

      describe 'updating anomymous initiatives' do
        let(:anonymous) { true }

        before do
          config = AppConfiguration.instance
          config.settings['initiatives']['allow_anonymous_participation'] = true
          config.save!
        end

        example_request 'Change a draft initiative to anonymous' do
          assert_status 200
          expect(response_data.dig(:relationships, :author, :data, :id)).to be_nil
          expect(response_data.dig(:attributes, :anonymous)).to be true
          expect(response_data.dig(:attributes, :author_name)).to be_nil
        end
      end

      describe 'publishing an initiative' do
        let(:publication_status) { 'published' }

        example_request 'Change the publication status' do
          assert_status 200
          expect(response_data.dig(:attributes, :publication_status)).to eq 'published'
        end
      end

      describe 'changing a draft initiative of another user' do
        let(:title_multiloc) { { 'en' => 'Changed title' } }

        example '[Error] Cannot update an anonymous initiative as a non-admin' do
          @initiative.update!(author: create(:user))
          do_request
          assert_status 401
          expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'Unauthorized!'
        end
      end

      describe 'cosponsor_ids' do
        let(:id) { @initiative.id }
        let(:cosponsor) { create(:user) }
        let(:cosponsor_ids) { [cosponsor.id] }

        example 'Update the cosponsors of an initiative' do
          expect { do_request }
            .to have_enqueued_job(LogActivityJob)
            .with(instance_of(CosponsorsInitiative), 'created', @user, instance_of(Integer))
            .exactly(1).times

          assert_status 200
          json_response = json_parse(response_body)

          expect(json_response.dig(:data, :relationships, :cosponsors, :data).pluck(:id)).to match_array cosponsor_ids
        end
      end
    end
  end

  # TODO: move-old-proposals-test
  patch 'web_api/v1/initiatives/:id/accept_cosponsorship_invite' do
    before do
      @initiative = create(:initiative)
      @cosponsors_initiative = create(:cosponsors_initiative, initiative: @initiative, user: @user)
    end

    describe 'for initiative with associated cosponsor' do
      let(:id) { @initiative.id }

      example 'cosponsor accepts invitation' do
        expect { do_request }.to change { @cosponsors_initiative.reload.status }.from('pending').to('accepted')
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :slug)).to eq @initiative.slug
      end
    end
  end

  # TODO: cleanup-after-proposals-migration
  delete 'web_api/v1/initiatives/:id' do
    before do
      @initiative = create(:initiative_with_topics, author: @user, publication_status: 'published')
    end

    let(:id) { @initiative.id }

    example_request 'Delete an initiative' do
      assert_status 200
      expect { Initiative.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  # TODO: cleanup-after-proposals-migration
  get 'web_api/v1/initiatives/:id/allowed_transitions' do
    before do
      admin_header_token

      @initiative = create(:initiative)
      threshold_reached = create(:initiative_status_threshold_reached)
      create(
        :initiative_status_change,
        initiative: @initiative, initiative_status: threshold_reached
      )
    end

    let(:id) { @initiative.id }

    example_request 'Allowed transitions' do
      assert_status 200
      json_response = json_parse response_body
      expect(json_response.dig(:data, :type)).to eq 'allowed_transitions'
      expect(json_response).to eq({
        data: {
          type: 'allowed_transitions',
          attributes: {
            **InitiativeStatus.where(code: 'answered').ids.to_h do |id|
              [id.to_sym, { feedback_required: true }]
            end,
            **InitiativeStatus.where(code: 'ineligible').ids.to_h do |id|
              [id.to_sym, { feedback_required: true }]
            end
          }
        }
      })
    end
  end
end
