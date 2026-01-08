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

      example 'List default input topics sorted by custom ordering' do
        @default_input_topics[2].insert_at!(0)
        @default_input_topics[0].insert_at!(2)

        do_request

        expect(response_data.size).to eq 3
        expect(response_data.dig(0, :id)).to eq @default_input_topics[2].id
        expect(response_data.dig(2, :id)).to eq @default_input_topics[0].id
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
    before { header_token_for create(:admin) }

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

    patch 'web_api/v1/default_input_topics/:id/reorder' do
      with_options scope: :default_input_topic do
        parameter :ordering, 'The position, starting from 0, where the topic should be at.', required: true
      end

      before do
        create_list(:default_input_topic, 3)
      end

      let(:id) { create(:default_input_topic).id }
      let(:ordering) { 1 }

      example_request 'Reorder a default input topic' do
        assert_status(200)
        expect(response_data.dig(:attributes, :ordering)).to eq ordering
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
