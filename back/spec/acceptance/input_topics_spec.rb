# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'InputTopics' do
  explanation 'Input topics are project-specific tags for categorizing inputs'
  header 'Content-Type', 'application/json'

  let(:project) { create(:project) }
  let(:project_id) { project.id }

  get 'web_api/v1/projects/:project_id/input_topics' do
    before do
      @input_topics = create_list(:input_topic, 3, project: project)
    end

    example_request 'List all input topics for a project' do
      assert_status(200)
      expect(response_data.size).to eq 3
    end

    example 'List input topics sorted by tree order (lft)' do
      @input_topics[2].move_to_left_of(@input_topics[0])

      do_request

      expect(response_data.size).to eq 3
      expect(response_data.dig(0, :id)).to eq @input_topics[2].id
    end

    example 'List input topics sorted by ideas_count descending' do
      # Create ideas with different topic counts
      create_list(:idea, 3, project: project, input_topics: [@input_topics[0]])
      create_list(:idea, 1, project: project, input_topics: [@input_topics[1]])
      create_list(:idea, 2, project: project, input_topics: [@input_topics[2]])

      do_request sort: '-ideas_count'

      expect(response_data.size).to eq 3
      # Most ideas first
      expect(response_data.dig(0, :id)).to eq @input_topics[0].id # 3 ideas
      expect(response_data.dig(1, :id)).to eq @input_topics[2].id # 2 ideas
      expect(response_data.dig(2, :id)).to eq @input_topics[1].id # 1 idea
    end

    example 'List input topics sorted by ideas_count ascending' do
      # Create ideas with different topic counts
      create_list(:idea, 3, project: project, input_topics: [@input_topics[0]])
      create_list(:idea, 1, project: project, input_topics: [@input_topics[1]])
      create_list(:idea, 2, project: project, input_topics: [@input_topics[2]])

      do_request sort: 'ideas_count'

      expect(response_data.size).to eq 3
      # Least ideas first
      expect(response_data.dig(0, :id)).to eq @input_topics[1].id # 1 idea
      expect(response_data.dig(1, :id)).to eq @input_topics[2].id # 2 ideas
      expect(response_data.dig(2, :id)).to eq @input_topics[0].id # 3 ideas
    end
  end

  # Shallow route - no project_id needed
  get 'web_api/v1/input_topics/:id' do
    let(:input_topic) { create(:input_topic, project: project) }
    let(:id) { input_topic.id }

    example_request 'Get one input topic by ID' do
      assert_status(200)
      expect(response_data[:id]).to eq id
      expect(response_data.dig(:relationships, :project, :data, :id)).to eq project.id
    end
  end

  context 'when admin' do
    before do
      header_token_for create(:admin)
      create_list(:input_topic, 3, project: project)
    end

    post 'web_api/v1/projects/:project_id/input_topics' do
      with_options scope: :input_topic do
        parameter :title_multiloc, 'The title of the input topic, as a multiloc string', required: true
        parameter :description_multiloc, 'The description of the input topic, as a multiloc string', required: false
        parameter :icon, 'The icon name', required: false
      end
      ValidationErrorHelper.new.error_fields(self, InputTopic)

      let(:input_topic) { build(:input_topic) }
      let(:title_multiloc) { input_topic.title_multiloc }
      let(:description_multiloc) { { 'en' => 'A test description' } }

      example_request 'Create an input topic' do
        assert_status(201)
        expect(response_data.dig(:attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(response_data.dig(:attributes, :description_multiloc).stringify_keys).to match description_multiloc
        expect(response_data.dig(:relationships, :project, :data, :id)).to eq project.id
      end
    end

    # Shallow route - no project_id needed
    patch 'web_api/v1/input_topics/:id' do
      with_options scope: :input_topic do
        parameter :title_multiloc, 'The title of the input topic, as a multiloc string'
        parameter :description_multiloc, 'The description of the input topic, as a multiloc string'
        parameter :icon, 'The icon name'
      end
      ValidationErrorHelper.new.error_fields(self, InputTopic)

      let(:input_topic) { create(:input_topic, project: project) }
      let(:id) { input_topic.id }
      let(:title_multiloc) { { 'en' => 'Updated title' } }
      let(:description_multiloc) { { 'en' => 'Updated description' } }

      example_request 'Update an input topic' do
        assert_status(200)
        expect(response_data.dig(:attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(response_data.dig(:attributes, :description_multiloc).stringify_keys).to match description_multiloc
      end
    end

    # Shallow route - no project_id needed
    patch 'web_api/v1/input_topics/:id/move' do
      with_options scope: :input_topic do
        parameter :position, 'The position to move to: child, left, right, or root', required: true
        parameter :target_id, 'The target topic ID for child/left/right positions'
      end

      let(:input_topics) { create_list(:input_topic, 3, project: project) }
      let(:id) { input_topics.last.id }
      let(:position) { 'left' }
      let(:target_id) { input_topics.first.id }

      example_request 'Move an input topic to a new position' do
        assert_status(200)
        expect(input_topics.last.reload.lft).to be < input_topics.first.reload.lft
      end
    end

    # Shallow route - no project_id needed
    delete 'web_api/v1/input_topics/:id' do
      let(:input_topic) { create(:input_topic, project: project) }
      let!(:id) { input_topic.id }

      example 'Delete an input topic' do
        old_count = InputTopic.count
        do_request
        assert_status(200)
        expect { InputTopic.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(InputTopic.count).to eq(old_count - 1)
      end
    end
  end

  context 'when project moderator' do
    let(:moderator) { create(:project_moderator, projects: [project]) }

    before { header_token_for moderator }

    post 'web_api/v1/projects/:project_id/input_topics' do
      with_options scope: :input_topic do
        parameter :title_multiloc, 'The title of the input topic, as a multiloc string', required: true
      end

      let(:title_multiloc) { { 'en' => 'Moderator topic' } }

      example_request 'Create an input topic as project moderator' do
        assert_status(201)
        expect(response_data.dig(:attributes, :title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    # Shallow route - no project_id needed
    patch 'web_api/v1/input_topics/:id' do
      with_options scope: :input_topic do
        parameter :title_multiloc, 'The title of the input topic, as a multiloc string'
      end

      let(:input_topic) { create(:input_topic, project: project) }
      let(:id) { input_topic.id }
      let(:title_multiloc) { { 'en' => 'Updated by moderator' } }

      example_request 'Update an input topic as project moderator' do
        assert_status(200)
        expect(response_data.dig(:attributes, :title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    # Shallow route - no project_id needed
    delete 'web_api/v1/input_topics/:id' do
      let(:input_topic) { create(:input_topic, project: project) }
      let!(:id) { input_topic.id }

      example 'Delete an input topic as project moderator' do
        old_count = InputTopic.count
        do_request
        assert_status(200)
        expect { InputTopic.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(InputTopic.count).to eq(old_count - 1)
      end
    end

    context 'for a different project' do
      let(:other_project) { create(:project) }
      let(:other_project_id) { other_project.id }

      post 'web_api/v1/projects/:project_id/input_topics' do
        with_options scope: :input_topic do
          parameter :title_multiloc, 'The title of the input topic, as a multiloc string', required: true
        end

        let(:project_id) { other_project_id }
        let(:title_multiloc) { { 'en' => 'Should fail' } }

        example_request 'Cannot create input topic for other project' do
          assert_status(401)
        end
      end
    end
  end

  context 'when regular user' do
    before { header_token_for create(:user) }

    post 'web_api/v1/projects/:project_id/input_topics' do
      with_options scope: :input_topic do
        parameter :title_multiloc, 'The title of the input topic, as a multiloc string', required: true
      end

      let(:title_multiloc) { { 'en' => 'Test topic' } }

      example_request 'Cannot create an input topic' do
        assert_status(401)
      end
    end

    # Shallow route - no project_id needed
    patch 'web_api/v1/input_topics/:id' do
      with_options scope: :input_topic do
        parameter :title_multiloc, 'The title of the input topic, as a multiloc string'
      end

      let(:id) { create(:input_topic, project: project).id }
      let(:title_multiloc) { { 'en' => 'Updated' } }

      example_request 'Cannot update an input topic' do
        assert_status(401)
      end
    end

    # Shallow route - no project_id needed
    delete 'web_api/v1/input_topics/:id' do
      let(:id) { create(:input_topic, project: project).id }

      example_request 'Cannot delete an input topic' do
        assert_status(401)
      end
    end
  end
end
