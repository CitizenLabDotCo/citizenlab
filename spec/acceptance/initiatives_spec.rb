require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Initiatives" do

  explanation "Proposals from citizens (but more spontaneous than ideas) to the city."

  before do
    header "Content-Type", "application/json"
    @first_admin = create(:admin)
    @initiatives = ['published','published','draft','published','spam','published','published'].map { |ps|  create(:initiative, publication_status: ps)}
    @user = create(:user)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  get "web_api/v1/initiatives" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of initiatives per page"
    end
    parameter :author, 'Filter by author (user id)', required: false
    parameter :publication_status, "Filter by publication status; returns all publlished initiatives by default", required: false
    parameter :topics, 'Filter by topics (OR)', required: false
    parameter :areas, 'Filter by areas (OR)', required: false
    parameter :initiative_status, 'Filter by status (initiative status id)', required: false
    parameter :assignee, 'Filter by assignee (user id)', required: false
    parameter :search, 'Filter by searching in title and body', required: false
    parameter :feedback_needed, "Filter out initiatives that need feedback", required: false
    parameter :sort, "Either 'new', '-new', 'author_name', '-author_name', 'upvotes_count', '-upvotes_count', 'status', '-status', 'random'", required: false

    example_request "List all published initiatives (default behaviour)" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
      expect(json_response[:data].map { |d| d.dig(:attributes,:publication_status) }).to all(eq 'published')
    end

    example "Don't list drafts (default behaviour)", document: false do
      do_request publication_status: 'draft'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 0
    end

    example "List all initiatives which match one of the given topics" do
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
      expect(json_response[:data].map{|h| h[:id]}).to match_array [i1.id, i2.id]
    end

    example "List all initiatives which match one of the given areas" do
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
      expect(json_response[:data].map{|h| h[:id]}).to match_array [i1.id, i2.id]
    end

    example "List all initiatives for a user" do
      u = create(:user)
      i = create(:initiative, author: u)

      do_request author: u.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "List all initiatives for an initiative status" do
      status = create(:initiative_status)
      i = create(:initiative, initiative_status: status)

      do_request initiative_status: status.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "List all initiatives for an assignee" do
      a = create(:admin)
      i = create(:initiative, assignee: a)

      do_request assignee: a.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "List all initiatives that need feedback" do
      TenantTemplateService.new.resolve_and_apply_template('base')
      i = create(:initiative, initiative_status: InitiativeStatus.find_by(code: 'threshold_reached'))

      do_request feedback_needed: true
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end

    example "Search for initiatives" do
      u = create(:user)
      i1 = create(:initiative, title_multiloc: {en: "This initiative is uniqque"})
      i2 = create(:initiative, title_multiloc: {en: "This one origiinal"})

      do_request search: "uniqque"
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all initiatives sorted by new" do
      u = create(:user)
      i1 = create(:initiative)

      do_request sort: "new"
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
      expect(json_response[:data][0][:id]).to eq i1.id
    end

    example "List all initiatives by random ordering", document: false do
      u = create(:user)
      i1 = create(:initiative)

      do_request sort: "random"
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
    end

    example "List all initiatives includes the user_vote", document: false do
      initiative = create(:initiative)
      vote = create(:vote, votable: initiative, user: @user)

      do_request
      json_response = json_parse(response_body)
      expect(json_response[:data].map{|d| d[:relationships][:user_vote][:data]}.compact.first[:id]).to eq vote.id
      expect(json_response[:included].map{|i| i[:id]}).to include vote.id
    end
  end

  get "web_api/v1/initiatives/as_markers" do
    before do
      locations = [[51.044039,3.716964],[50.845552,4.357355],[50.640255,5.571848],[50.950772,4.308304],[51.215929,4.422602],[50.453848,3.952217],[-27.148983,-109.424659]] 
      placenames = ['Ghent', 'Brussels', 'Liège', 'Meise', 'Antwerp', 'Mons', 'Hanga Roa']
      @initiatives.each do |i|
        i.location_point_geojson = { "type" => "Point", "coordinates" => locations.pop }
        i.title_multiloc['en'] = placenames.pop
        i.publication_status = 'published'
        i.save!
      end
    end

    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of initiatives per page"
    end
    parameter :author, 'Filter by author (user id)', required: false
    parameter :publication_status, "Return only initiatives with the specified publication status; returns all pusblished initiatives by default", required: false
    parameter :bounding_box, "Given an [x1,y1,x2,y2] array of doubles (x being latitude and y being longitude), the markers are filtered to only retain those within the (x1,y1)-(x2,y2) box.", required: false
    parameter :topics, 'Filter by topics (OR)', required: false
    parameter :areas, 'Filter by areas (OR)', required: false
    parameter :assignee, 'Filter by assignee (user id)', required: false
    parameter :search, 'Filter by searching in title and body', required: false

    example "List all markers within a bounding box" do
      do_request(bounding_box: "[51.208758,3.224363,50.000667,5.715281]") # Bruges-Bastogne

      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
      expect(json_response[:data].map{|d| d.dig(:attributes, :title_multiloc, :en)}.sort).to match ['Ghent', 'Brussels', 'Liège', 'Meise', 'Mons'].sort
    end
  end

  get "web_api/v1/initiatives/as_xlsx" do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end
    
    parameter :initiatives, 'Filter by a given list of initiative ids', required: false

    example_request "XLSX export" do
      expect(status).to eq 200
    end

    describe do
      before do 
        @selected_initiatives = @initiatives.select(&:published?).shuffle.take 2
      end
      let(:initiatives) { @selected_initiatives.map(&:id) }
      
      example_request 'XLSX export by initiative ids' do
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq (@selected_initiatives.size + 1)
      end
    end

    describe do
      before do 
        @user = create(:user)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end
      
      example_request '[error] XLSX export by a normal user', document: false do
        expect(status).to eq 401
      end
    end
  end

  get "web_api/v1/initiatives/filter_counts" do
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
    parameter :publication_status, "Return only initiatives with the specified publication status; returns all pusblished initiatives by default", required: false

    example_request "List initiative counts per filter option" do
      expect(status).to eq 200
      json_response = json_parse(response_body)

      expect(json_response[:initiative_status_id][@s1.id.to_sym]).to eq 1
      expect(json_response[:initiative_status_id][@s2.id.to_sym]).to eq 3
      expect(json_response[:area_id][@a1.id.to_sym]).to eq 3
      expect(json_response[:area_id][@a2.id.to_sym]).to eq 1
      expect(json_response[:topic_id][@t1.id.to_sym]).to eq 2
      expect(json_response[:topic_id][@t2.id.to_sym]).to eq 2
      expect(json_response[:total]).to eq 4
    end

    example "List initiative counts per filter option on topic" do
      do_request topics: [@t1.id]
      expect(status).to eq 200
    end

    example "List initiative counts per filter option on area" do
      do_request areas: [@a1.id]
      expect(status).to eq 200
    end
  end

  get "web_api/v1/initiatives/:id" do
    let(:initiative) {@initiatives.first}
    let(:id) {initiative.id}

    example_request "Get one initiative by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq initiative.id
    end
  end

  get "web_api/v1/initiatives/by_slug/:slug" do
    let(:slug) {@initiatives.first.slug}

    example_request "Get one initiative by slug" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @initiatives.first.id
    end

    describe do
      let(:slug) {"unexisting-initiative"}

      example "[error] Get an unexisting initiative", document: false do
        do_request
        expect(status).to eq 404
      end
    end
  end

  post "web_api/v1/initiatives" do
    before do
      create(:initiative_status, code: 'proposed')
      PermissionsService.new.update_global_permissions
    end

    with_options scope: :initiative do
      parameter :author_id, "The user id of the user owning the initiative", extra: "Required if not draft"
      parameter :publication_status, "Publication status", required: true, extra: "One of #{Post::PUBLICATION_STATUSES.join(",")}"
      parameter :title_multiloc, "Multi-locale field with the initiative title", required: true, extra: "Maximum 100 characters"
      parameter :body_multiloc, "Multi-locale field with the initiative body", extra: "Required if not draft"
      parameter :location_point_geojson, "A GeoJSON point that situates the location the initiative applies to"
      parameter :location_description, "A human readable description of the location the initiative applies to"
      parameter :header_bg, "Base64 encoded header image"
      parameter :topic_ids, "Array of ids of the associated topics"
      parameter :area_ids, "Array of ids of the associated areas"
      parameter :assignee_id, "The user id of the admin that takes ownership. Set automatically if not provided. Only allowed for admins."
    end
    ValidationErrorHelper.new.error_fields(self, Initiative)

    let(:initiative) { build(:initiative) }
    let(:publication_status) { 'published' }
    let(:title_multiloc) { initiative.title_multiloc }
    let(:body_multiloc) { initiative.body_multiloc }
    let(:location_point_geojson) { {type: "Point", coordinates: [51.11520776293035, 3.921154106874878]} }
    let(:location_description) { "Stanley Road 4" }
    let(:header_bg) { encode_image_as_base64("header.jpg")}
    let(:topic_ids) { create_list(:topic, 2).map(&:id) }
    let(:area_ids) { create_list(:area, 2).map(&:id) }
    let(:assignee_id) { create(:admin).id }

    describe do
      before do
        @user.add_role 'admin'
        @user.save!
      end

      example_request "Create an initiative" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:location_point_geojson)).to eq location_point_geojson
        expect(json_response.dig(:data,:attributes,:location_description)).to eq location_description
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match_array topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
        expect(json_response.dig(:data,:relationships,:assignee,:data,:id)).to eq assignee_id
      end

      example "Check for the automatic creation of an upvote by the author when an initiative is created", document: false do
        do_request
        json_response = json_parse(response_body) 
        new_initiative = Initiative.find(json_response.dig(:data, :id))
        expect(new_initiative.votes.size).to eq 1
        expect(new_initiative.votes[0].mode).to eq 'up'
        expect(new_initiative.votes[0].user.id).to eq @user.id
        expect(json_response[:data][:attributes][:upvotes_count]).to eq 1
      end

      example "Check for the automatic assignement of the default assignee", document: false do
        do_request(initiative: {assignee_id: nil})
        json_response = json_parse(response_body) 
        expect(json_response.dig(:data,:relationships,:assignee,:data,:id)).to eq @first_admin.id
      end
    end

    describe do
      let(:initiative) { build(:initiative) }
      let(:title_multiloc) { {'en' => 'I have a fantastic initiative but with a superduper extremely long title so someone should do something about this or else it may look bad in the UI and no one would read it anyways'} }
      let(:body_multiloc) { initiative.body_multiloc }

      example_request "[error] Create an initiative with too long title" do
        expect(response_status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors, :title_multiloc)).to eq [{error: 'too_long'}]
      end
    end

    describe do
      before do
        permission = Permission.where(permission_scope: nil, action: 'posting_initiative').first
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
      end
      example_request "[error] Create an idea in a project with groups posting permission" do
        expect(response_status).to eq 401
      end
    end

    describe do
      before do
        permission = Permission.where(permission_scope: nil, action: 'posting_initiative').first
        groups = create_list(:group, 2)
        g = groups.first
        g.add_member @user
        g.save!
        permission.update!(permitted_by: 'groups', groups: groups)
      end
      example_request "Create an idea in a project with groups posting permission" do
        expect(response_status).to eq 201
      end
    end
  end

  patch "web_api/v1/initiatives/:id" do
    before do
      create(:initiative_status, code: 'proposed')
      @initiative =  create(:initiative, author: @user)
      PermissionsService.new.update_global_permissions
    end

    with_options scope: :initiative do
      parameter :author_id, "The user id of the user owning the initiative", extra: "Required if not draft"
      parameter :publication_status, "Either #{Post::PUBLICATION_STATUSES.join(', ')}"
      parameter :title_multiloc, "Multi-locale field with the initiative title", extra: "Maximum 100 characters"
      parameter :body_multiloc, "Multi-locale field with the initiative body", extra: "Required if not draft"
      parameter :location_point_geojson, "A GeoJSON point that situates the location the initiative applies to"
      parameter :location_description, "A human readable description of the location the initiative applies to"
      parameter :header_bg, "Base64 encoded header image"
      parameter :topic_ids, "Array of ids of the associated topics"
      parameter :area_ids, "Array of ids of the associated areas"
      parameter :assignee_id, "The user id of the admin that takes ownership. Only allowed for admins."
    end
    ValidationErrorHelper.new.error_fields(self, Initiative)

    let(:id) { @initiative.id }
    let(:location_point_geojson) { {type: "Point", coordinates: [51.4365635, 3.825930459]} }
    let(:location_description) { "Watkins Road 8" }
    let(:header_bg) { encode_image_as_base64("header.jpg")}
    let(:topic_ids) { create_list(:topic, 2).map(&:id) }
    let(:area_ids) { create_list(:area, 2).map(&:id) }

    describe do
      let(:title_multiloc) { {"en" => "Changed title" } }

      example_request "Update an initiative" do
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc,:en)).to eq "Changed title"
        expect(json_response.dig(:data,:attributes,:location_point_geojson)).to eq location_point_geojson
        expect(json_response.dig(:data,:attributes,:location_description)).to eq location_description
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match_array topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
      end

      example "Check for the automatic creation of an upvote by the author when the publication status of an initiative is updated from draft to published", document: false do
        @initiative.update(publication_status: "draft")
        do_request initiative: { publication_status: "published" }
        json_response = json_parse(response_body) 
        new_initiative = Initiative.find(json_response.dig(:data, :id))
        expect(new_initiative.votes.size).to eq 1
        expect(new_initiative.votes[0].mode).to eq 'up'
        expect(new_initiative.votes[0].user.id).to eq @user.id
        expect(json_response.dig(:data, :attributes, :upvotes_count)).to eq 1
      end

    end

    describe do
      let(:id) { @initiative.id }
      let(:header_bg) { encode_image_as_base64("header.jpg")}
      example "The header image can be updated and the file is present", document: false do
        do_request
        expect(@initiative.reload.header_bg_url).to be_present
        expect(@initiative.reload.header_bg.file).to be_present
      end
    end

    describe do
      let(:id) { @initiative.id }
      example "The header image can be removed" do
        @initiative.update(header_bg: Rails.root.join("spec/fixtures/header.jpg").open)
        expect(@initiative.reload.header_bg_url).to be_present
        do_request initiative: {header_bg: nil}
        expect(@initiative.reload.header_bg_url).to be nil
      end
    end

    describe do
      let(:topic_ids) { [] }
      let(:area_ids) { [] }

      example "Remove the topics/areas", document: false do
        @initiative.topics = create_list(:topic, 2)
        @initiative.areas = create_list(:area, 2)
        do_request
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:topics,:data).map{|d| d[:id]}).to match_array topic_ids
        expect(json_response.dig(:data,:relationships,:areas,:data).map{|d| d[:id]}).to match_array area_ids
      end
    end

    describe do
      let(:assignee_id) { create(:admin).id }

      example "Changing the assignee as a non-admin does not work", document: false do
        do_request
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:assignee)).to be_nil
      end
    end
  end

  patch "web_api/v1/initiatives/:id" do
    before do
      @initiative =  create(:initiative, author: @user, publication_status: 'draft')
      PermissionsService.new.update_global_permissions
    end
    parameter :publication_status, "Either #{Post::PUBLICATION_STATUSES.join(', ')}", required: true, scope: :initiative
    
    let(:id) { @initiative.id }
    let(:publication_status) { 'published' }

    example_request "Change the publication status" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:publication_status)).to eq "published"
    end
  end

  delete "web_api/v1/initiatives/:id" do
    before do
      @initiative = create(:initiative_with_topics, author: @user, publication_status: 'published')
      PermissionsService.new.update_global_permissions
    end
    let(:id) { @initiative.id }

    example_request "Delete an initiative" do
      expect(response_status).to eq 200
      expect{Initiative.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  get "web_api/v1/initiatives/:id/allowed_transitions" do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"

      @initiative = create(:initiative)
      TenantTemplateService.new.resolve_and_apply_template 'base', external_subfolder: false
      create(
        :initiative_status_change, 
        initiative: @initiative, initiative_status: InitiativeStatus.find_by(code: 'threshold_reached')
        )
    end
    let(:id) { @initiative.id }

    example_request "Allowed transitions" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response).to eq ({
        **InitiativeStatus.where(code: 'answered').ids.map{ |id|
          [id.to_sym, { feedback_required: true }]
        }.to_h,
        **InitiativeStatus.where(code: 'ineligible').ids.map{ |id|
          [id.to_sym, { feedback_required: true }]
        }.to_h
      })
    end
  end

end

def encode_image_as_base64 filename
  "data:image/png;base64,#{Base64.encode64(File.read(Rails.root.join("spec", "fixtures", filename)))}"
end
