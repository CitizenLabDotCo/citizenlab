require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'NewsPosts' do
  explanation 'Posts shown on the "news" page'

  let(:json_response) { json_parse response_body }

  before do
    @posts = create_list :news_post, 2
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/news_posts' do
    with_options scope: :post do
      parameter :number, 'Page number'
      parameter :size, 'Number of pages (data model pages) per page'
    end

    example_request 'List all news posts' do
      expect(status).to eq 200
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/news_posts/:id' do
    let(:post) { @posts.first }
    let(:id) { post.id }

    example_request 'Get one post by id' do
      expect(status).to eq 200
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  get 'web_api/v1/news_posts/by_slug/:slug' do
    let(:post) { @posts.first }
    let(:slug) { post.slug }

    example_request 'Get one news post by slug' do
      expect(status).to eq 200
      expect(json_response.dig(:data, :id)).to eq post.id
    end

    describe nil do
      let(:slug) { 'unexisting-post' }

      example_request '[error] Get an unexisting news post by slug', document: false do
        expect(status).to eq 404
      end
    end
  end

  context 'when admin' do
    before do
      @admin = create :admin
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post 'web_api/v1/news_posts' do
      with_options scope: :news_post do
        parameter :title_multiloc, 'The title of the news post, as a multiloc string', required: true
        parameter :body_multiloc, 'The content of the news post, as a multiloc HTML string', required: true
        parameter :slug, 'The unique slug of the news post. If not given, it will be auto generated'
      end
      ValidationErrorHelper.new.error_fields self, NewsPost

      let(:post) { build :news_post }
      let(:title_multiloc) { post.title_multiloc }
      let(:body_multiloc) { post.body_multiloc }

      example_request 'Create a news post' do
        expect(response_status).to eq 201

        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match post.title_multiloc
        expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match post.body_multiloc
      end

      describe nil do
        let(:slug) { '' }

        example_request '[error] Create an invalid news post', document: false do
          expect(response_status).to eq 422
          expect(json_response.dig(:errors, :slug)).to eq [{ error: 'blank' }]
        end
      end
    end

    patch 'web_api/v1/news_posts/:id' do
      with_options scope: :news_post do
        parameter :title_multiloc, 'The title of the news post, as a multiloc string'
        parameter :body_multiloc, 'The content of the news post, as a multiloc HTML string'
        parameter :slug, 'The unique slug of the news post'
      end
      ValidationErrorHelper.new.error_fields self, NewsPost

      let(:id) { @posts.first.id }
      let(:title_multiloc) { { 'en' => 'Changed title' } }
      let(:body_multiloc) { { 'en' => 'Changed body' } }
      let(:slug) { 'changed-title' }

      example_request 'Update a news post' do
        expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
        expect(json_response.dig(:data, :attributes, :body_multiloc, :en)).to eq 'Changed body'
        expect(json_response.dig(:data, :attributes, :slug)).to eq 'changed-title'
      end
    end

    delete 'web_api/v1/news_posts/:id' do
      let(:post) { @posts.first }
      let(:id) { post.id }

      example_request 'Delete a news post' do
        expect(response_status).to eq 200
        expect { post.reload }.to raise_error ActiveRecord::RecordNotFound
      end
    end
  end
end
