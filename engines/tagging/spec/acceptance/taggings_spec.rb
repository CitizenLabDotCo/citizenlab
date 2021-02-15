require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Taggings" do

  explanation "The link between a tag and a piece of content (ideas for now)"

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  post "web_api/v1/taggings" do
    parameter :idea_id, "The idea to tag", required: true
    parameter :tag_id, "The id of the tag to assign", required: false
    parameter :tag_attributes, "The content to create a tag and assign it", required: false


    context do
      let(:idea_id) { create(:idea).id }
      let(:tag_id) { Tagging::Tag.create(title_multiloc: { en: 'Fish' }).id }

      example_request "Create a tagging with tag_id" do
        expect(response_status).to eq 201
      end
    end

    context do
      let(:idea_id) { create(:idea).id }
      let(:tag_attributes) { { title_multiloc: { en: 'Apples' } } }

      example_request "Create a tagging with tag attributes" do
        expect(response_status).to eq 201
      end
    end
  end

  get "web_api/v1/taggings" do
    parameter :idea_ids, "The ideas to get the tags for", required: false
    parameter :assignment_method, "An assignment method filter", required: false

    before do
      @ideas = create_list(:idea, 5)
      @fish = Tagging::Tag.create(title_multiloc: { en: 'Fish' })
      @sea_lion = Tagging::Tag.create(title_multiloc: { en: 'Sea Lion' })
      @dolphin = Tagging::Tag.create(title_multiloc: { en: 'Dolphin' })
      @shark = Tagging::Tag.create(title_multiloc: { en: 'Shark' })
      Tagging::Tagging.create(idea_id: @ideas[0].id, tag_id:  @fish.id, assignment_method: 'manual')
      Tagging::Tagging.create(idea_id: @ideas[0].id, tag_id:  @dolphin.id, assignment_method: 'manual')
      Tagging::Tagging.create(idea_id: @ideas[0].id, tag_id:  @shark.id, assignment_method: 'manual')
      Tagging::Tagging.create(idea_id: @ideas[1].id, tag_id:  @shark.id, assignment_method: 'automatic')
      Tagging::Tagging.create(idea_id: @ideas[1].id, tag_id:  @sea_lion.id, assignment_method: 'automatic')
      Tagging::Tagging.create(idea_id: @ideas[2].id, tag_id:  @sea_lion.id, assignment_method: 'automatic')
    end

    example_request 'List all taggings' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
    end

    example 'List taggings for some ideas' do
      do_request idea_ids: [@ideas[0].id, @ideas[2].id]
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
    end

    example 'List taggings for one idea' do
      do_request idea_ids: [@ideas[1].id]
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end

    example 'List automatic taggings' do
      do_request assignment_method: "automatic"
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
    end

    example 'List manual taggings' do
      do_request assignment_method: "manual"
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
    end
  end

  get "web_api/v1/taggings/:id" do
    before do
      @ideas = create_list(:idea, 1)
      @fish = Tagging::Tag.create(title_multiloc: { en: 'Fish' })
      @tagging = Tagging::Tagging.create(idea_id: @ideas[0].id, tag_id:  @fish.id, assignment_method: 'automatic', confidence_score: 0.22)
    end

    example 'Get a tagging by id' do
      do_request id: @tagging.id
      expect(status).to eq(200)
      json_response = json_parse(response_body)
    end
  end

  delete "web_api/v1/taggings/:id" do
    before do
      @ideas = create_list(:idea, 2)
      @tag = Tagging::Tag.create(title_multiloc: { en: 'Banana' })
      @tagging = Tagging::Tagging.create(idea_id: @ideas[0].id, tag_id: @tag.id, assignment_method: 'automatic', confidence_score: 0.22)
      Tagging::Tagging.create(idea_id: @ideas[1].id, tag_id: @tag.id, assignment_method: 'manual', confidence_score: 0.22)
      @lone_tag = Tagging::Tag.create(title_multiloc: { en: 'Fish' })
      @lone_tagging = Tagging::Tagging.create(idea_id: @ideas[0].id, tag_id: @lone_tag.id, assignment_method: 'automatic', confidence_score: 0.22)
    end

    example 'Destroying the only tagging associated whith a tag also destroys the tag' do
      do_request id: @lone_tagging.id
      expect(status).to eq(200)
      begin
        expect(Tagging::Tagging.find(@lone_tagging.id)).to raise_error(ActiveRecord::RecordNotFound)
      rescue ActiveRecord::RecordNotFound
      end
      expect(Tagging::Tag.find(@lone_tag.id)).to raise_error(ActiveRecord::RecordNotFound)
      rescue ActiveRecord::RecordNotFound
    end

    example 'Destroy a tagging' do
      do_request id: @tagging.id
      expect(status).to eq(200)
      begin
        expect(Tagging::Tagging.find(@tagging.id)).to raise_error(ActiveRecord::RecordNotFound)
      rescue ActiveRecord::RecordNotFound
      end
      expect(Tagging::Tag.find(@tag.id).id).to eq @tag.id
    end
  end

  patch "web_api/v1/taggings/:id" do
    before do
      @ideas = create_list(:idea, 2)
      @tag = Tagging::Tag.create(title_multiloc: { en: 'Banana' })
      @tagging = Tagging::Tagging.create(idea_id: @ideas[0].id, tag_id:  @tag.id, assignment_method: 'automatic', confidence_score: 0.22)
    end

    example 'Update a tagging from automatic to manual' do
      do_request id: @tagging.id, assignment_method: 'manual'
      expect(status).to eq(200)
      expect(Tagging::Tagging.find(@tagging.id).assignment_method).to eq 'manual'
      expect(Tagging::Tagging.find(@tagging.id).confidence_score).to eq 1
    end
  end

  post "web_api/v1/taggings/generate" do
    parameter :idea_ids, "The ideas to tag", required: false
    parameter :projects, "The project containing the ideas to tag", required: false
    parameter :tag_ids, "The id of the tags to assign", required: false
    parameter :tags, "The content to create a tag and assign it", required: false


    before do
      @project = create(:project_with_current_phase, with_permissions: true)
      @ideas = create_list(:idea, 5, project: @project)
      Tagging::Tag.create(title_multiloc: {'en' => 'label', 'fr-BE' => 'label'})
      Tagging::Tag.create(title_multiloc: {'en' => 'item'})
      Tagging::Tag.create(title_multiloc: {'en' => 'another tag'})
      @tags = Tagging::Tag.all()
    end

    example "Generates taggings from tag_ids" do
      response = {
                "batches" => [{
                  "task_id"=>"424bf84c-904e-4377-9d94-e0e9dfe70be3",
                  "doc_ids" =>  @ideas.map(&:id)
                }]
            }
      allow_any_instance_of(NLP::TaggingSuggestionService).to receive(:suggest).and_return(response)

      do_request idea_ids: @ideas.map(&:id), tag_ids: @tags.map(&:id)
      expect(response_status).to eq 200
      expect(Tagging::PendingTask.count).to eq 1
    end

    example "Generates taggings from new tags" do
      response = {
                "batches" => [{
                  "task_id"=>"424bf84c-904e-4377-9d94-e0e9dfe70be3",
                  "doc_ids" =>  @ideas.map(&:id)
                }]
            }
      allow_any_instance_of(NLP::TaggingSuggestionService).to receive(:suggest).and_return(response)

      do_request idea_ids: @ideas.map(&:id), tags: [ 'Lalalal' ,  'chachacha', 'lilila', 'leela', 'lou' ]

      expect(response_status).to eq 200
      expect(Tagging::PendingTask.count).to eq 1
    end

  end

end
