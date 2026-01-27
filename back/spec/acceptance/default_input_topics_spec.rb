# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'DefaultInputTopics' do
  explanation 'Default input topics are automatically added to new projects'
  header 'Content-Type', 'application/json'

  get 'web_api/v1/default_input_topics' do
    before do
      @default_input_topics = create_list(:default_input_topic, 3)
    end

    context 'when admin' do
      before { header_token_for create(:admin) }

      example_request 'List all default input topics' do
        assert_status(200)
        expect(response_data.size).to eq 3
      end

      example 'List default input topics sorted by tree order (lft)' do
        @default_input_topics[2].move_to_left_of(@default_input_topics[0])

        do_request

        expect(response_data.size).to eq 3
        expect(response_data.dig(0, :id)).to eq @default_input_topics[2].id
      end
    end

    context 'when regular user' do
      before { header_token_for create(:user) }

      example_request 'List all default input topics' do
        assert_status(200)
        expect(response_data.size).to eq 3
      end
    end

    context 'when visitor' do
      example_request 'List all default input topics' do
        assert_status(200)
        expect(response_data.size).to eq 3
      end
    end
  end

  get 'web_api/v1/default_input_topics/:id' do
    let(:default_input_topic) { create(:default_input_topic) }
    let(:id) { default_input_topic.id }

    example_request 'Get one default input topic by ID' do
      assert_status(200)
      expect(response_data[:id]).to eq id
    end
  end

  context 'when admin' do
    before do
      header_token_for create(:admin)
      create_list(:default_input_topic, 3)
    end

    post 'web_api/v1/default_input_topics' do
      with_options scope: :default_input_topic do
        parameter :title_multiloc, 'The title of the default input topic, as a multiloc string', required: true
        parameter :description_multiloc, 'The description of the default input topic, as a multiloc string', required: false
        parameter :icon, 'The icon name', required: false
      end
      ValidationErrorHelper.new.error_fields(self, DefaultInputTopic)

      let(:default_input_topic) { build(:default_input_topic) }
      let(:title_multiloc) { default_input_topic.title_multiloc }
      let(:description_multiloc) { { 'en' => 'A test description' } }

      example_request 'Create a default input topic' do
        assert_status(201)
        expect(response_data.dig(:attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(response_data.dig(:attributes, :description_multiloc).stringify_keys).to match description_multiloc
      end
    end

    patch 'web_api/v1/default_input_topics/:id' do
      with_options scope: :default_input_topic do
        parameter :title_multiloc, 'The title of the default input topic, as a multiloc string'
        parameter :description_multiloc, 'The description of the default input topic, as a multiloc string'
        parameter :icon, 'The icon name'
      end
      ValidationErrorHelper.new.error_fields(self, DefaultInputTopic)

      let(:default_input_topic) { create(:default_input_topic) }
      let(:id) { default_input_topic.id }
      let(:title_multiloc) { { 'en' => 'Updated title' } }
      let(:description_multiloc) { { 'en' => 'Updated description' } }

      example_request 'Update a default input topic' do
        assert_status(200)
        expect(response_data.dig(:attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(response_data.dig(:attributes, :description_multiloc).stringify_keys).to match description_multiloc
      end
    end

    patch 'web_api/v1/default_input_topics/:id/move' do
      with_options scope: :default_input_topic do
        parameter :position, 'The position to move to: child, left, right, or root', required: true
        parameter :target_id, 'The target topic ID for child/left/right positions'
      end

      let(:default_input_topics) { create_list(:default_input_topic, 3) }
      let(:id) { default_input_topics.last.id }
      let(:position) { 'left' }
      let(:target_id) { default_input_topics.first.id }

      example_request 'Move a default input topic to a new position' do
        assert_status(200)
        expect(default_input_topics.last.reload.lft).to be < default_input_topics.first.reload.lft
      end

      describe 'moving subtopics' do
        let(:parent_topic) { create(:default_input_topic) }
        let!(:subtopic1) { create(:default_input_topic, parent: parent_topic, title_multiloc: { en: 'Subtopic 1' }) }
        let!(:subtopic2) { create(:default_input_topic, parent: parent_topic, title_multiloc: { en: 'Subtopic 2' }) }
        let!(:subtopic3) { create(:default_input_topic, parent: parent_topic, title_multiloc: { en: 'Subtopic 3' }) }
        let(:id) { subtopic3.id }
        let(:position) { 'left' }
        let(:target_id) { subtopic1.id }

        example 'Move a subtopic to a new position within its parent' do
          # subtopic3 should be last initially
          expect(subtopic3.reload.lft).to be > subtopic2.reload.lft
          expect(subtopic3.reload.lft).to be > subtopic1.reload.lft

          do_request

          assert_status(200)
          # After moving left of subtopic1, subtopic3 should be first
          expect(subtopic3.reload.lft).to be < subtopic1.reload.lft
          expect(subtopic3.reload.lft).to be < subtopic2.reload.lft
          # Should still have the same parent
          expect(subtopic3.reload.parent_id).to eq parent_topic.id
        end
      end
    end

    delete 'web_api/v1/default_input_topics/:id' do
      let(:default_input_topic) { create(:default_input_topic) }
      let!(:id) { default_input_topic.id }

      example 'Delete a default input topic' do
        old_count = DefaultInputTopic.count
        do_request
        assert_status(200)
        expect { DefaultInputTopic.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(DefaultInputTopic.count).to eq(old_count - 1)
      end
    end
  end

  context 'when regular user' do
    before { header_token_for create(:user) }

    post 'web_api/v1/default_input_topics' do
      let(:title_multiloc) { { 'en' => 'Test topic' } }

      example_request 'Cannot create a default input topic' do
        assert_status(401)
      end
    end

    patch 'web_api/v1/default_input_topics/:id' do
      let(:id) { create(:default_input_topic).id }
      let(:title_multiloc) { { 'en' => 'Updated' } }

      example_request 'Cannot update a default input topic' do
        assert_status(401)
      end
    end

    delete 'web_api/v1/default_input_topics/:id' do
      let(:id) { create(:default_input_topic).id }

      example_request 'Cannot delete a default input topic' do
        assert_status(401)
      end
    end
  end
end
