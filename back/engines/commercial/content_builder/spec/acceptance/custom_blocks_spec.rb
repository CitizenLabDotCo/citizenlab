# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'CustomBlocks' do
  explanation 'Page builder blocks whose React code is authored through an AI loop.'

  before do
    set_api_content_type
    SettingsService.new.activate_feature!('custom_page_blocks')
  end

  get 'web_api/v1/custom_blocks' do
    # No `parameter :status` declaration: rspec_api_documentation resolves declared
    # parameters against methods of the example group, and `status` is already the
    # response status there. The filter is passed explicitly through `do_request`.
    let!(:draft_block) { create(:custom_block) }
    let!(:published_block) { create(:custom_block, :published) }

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all custom blocks' do
        assert_status 200
        expect(response_ids).to contain_exactly(draft_block.id, published_block.id)
      end

      example 'List the custom blocks with a given status', document: false do
        do_request(status: 'published')

        assert_status 200
        expect(response_ids).to eq [published_block.id]
      end
    end

    context 'when visitor' do
      # The index stays behind authentication: citizens render blocks through
      # show + bundle only. The policy scope (covered in the policy spec) still
      # limits what non-admins could see.
      example_request '[error] List the custom blocks without authorization' do
        assert_status 401
      end
    end
  end

  get 'web_api/v1/custom_blocks/:id' do
    let(:custom_block) { create(:custom_block, :published) }
    let(:id) { custom_block.id }

    example_request 'Get one published custom block by id' do
      assert_status 200

      expect(response_data).to include(id: custom_block.id, type: 'custom_block')
      attributes = response_data[:attributes]
      expect(attributes.keys).to match_array %i[title_multiloc description_multiloc status created_at updated_at current_version]
      expect(attributes[:status]).to eq 'published'
      expect(attributes[:current_version]).to include(
        id: custom_block.current_version.id,
        number: 1,
        sdk_version: 1
      )
      expect(attributes[:current_version][:manifest]).to include(targets: ['homepage'])
    end

    example_request 'The source and the bundle are not exposed', document: false do
      assert_status 200

      expect(response_data[:attributes][:current_version].keys)
        .to match_array %i[id number manifest messages sdk_version created_at]
      expect(response_body).not_to include custom_block.current_version.bundle
      expect(response_body).not_to include custom_block.current_version.source
    end

    context 'when the block is not published' do
      let(:custom_block) { create(:custom_block) }

      example_request '[error] Try to get a draft custom block as a visitor' do
        assert_status 401
      end
    end
  end

  post 'web_api/v1/custom_blocks' do
    with_options scope: :custom_block do
      parameter :title_multiloc, 'The title of the block, as a multiloc.', required: true
    end

    let(:title_multiloc) { { 'en' => 'Upcoming events teaser' } }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Create a custom block' do
        assert_status 201

        expect(response_data[:type]).to eq 'custom_block'
        expect(response_data[:attributes]).to include(
          title_multiloc: { en: 'Upcoming events teaser' },
          status: 'draft',
          current_version: nil
        )
        expect(ContentBuilder::CustomBlock.find(response_data[:id]).created_by).to be_present
      end
    end

    context 'when visitor' do
      example_request '[error] Try to create a custom block without authorization' do
        assert_status 401
      end
    end

    context 'when the feature is not activated' do
      before do
        SettingsService.new.deactivate_feature!('custom_page_blocks')
        admin_header_token
      end

      example_request '[error] Try to create a custom block while the feature is not activated' do
        assert_status 401
      end
    end
  end

  patch 'web_api/v1/custom_blocks/:id' do
    with_options scope: :custom_block do
      parameter :title_multiloc, 'The title of the block, as a multiloc.'
      parameter :description_multiloc, 'The description of the block, as a multiloc.'
    end

    let(:custom_block) { create(:custom_block) }
    let(:id) { custom_block.id }

    before { admin_header_token }

    example '[error] Publish a custom block that has no version' do
      do_request(custom_block: { status: 'published' })

      assert_status 422
      expect(json_response_body).to include_response_error(:current_version, 'blank')
      expect(custom_block.reload.status).to eq 'draft'
    end

    example 'Publish a custom block that has a version' do
      version = create(:custom_block_version, custom_block: custom_block)
      custom_block.update!(current_version: version)

      do_request(custom_block: { status: 'published' })

      assert_status 200
      expect(response_data[:attributes][:status]).to eq 'published'
      expect(custom_block.reload).to be_published
    end

    example 'Update the title of a custom block', document: false do
      do_request(custom_block: { title_multiloc: { en: 'Renamed block' } })

      assert_status 200
      expect(custom_block.reload.title_multiloc).to eq({ 'en' => 'Renamed block' })
    end
  end

  delete 'web_api/v1/custom_blocks/:id' do
    let!(:custom_block) { create(:custom_block, :published) }
    let(:id) { custom_block.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Delete a custom block' do
        assert_status 200
        expect { custom_block.reload }.to raise_error ActiveRecord::RecordNotFound
      end
    end

    context 'when visitor' do
      example_request '[error] Try to delete a custom block without authorization' do
        assert_status 401
      end
    end
  end

  post 'web_api/v1/custom_blocks/:custom_block_id/versions' do
    with_options scope: :version do
      parameter :source, 'The TSX source of the block.', required: true
      parameter :bundle, 'The compiled JS bundle of the block.', required: true
      parameter :manifest, 'The manifest describing the block.'
      parameter :messages, 'The message catalogs of the block, per locale.'
      parameter :ai_session_id, 'The AI session this version originates from.'
    end

    let(:custom_block) { create(:custom_block) }
    let(:custom_block_id) { custom_block.id }
    let(:source) { 'export default function MyBlock() { return <div>Hi</div>; }' }
    let(:bundle) { 'export default function MyBlock(){return null}' }
    let(:manifest) do
      {
        'manifest_version' => 1,
        'sdk_version' => 1,
        'targets' => ['homepage'],
        'data_uses' => [],
        'config_schema' => []
      }
    end
    let(:messages) { { 'en' => { 'greeting' => 'Hi' } } }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Create a version of a custom block' do
        assert_status 201

        expect(response_data[:type]).to eq 'custom_block_version'
        expect(response_data[:attributes]).to include(number: 1, source: source, sdk_version: 1)
        expect(custom_block.reload.current_version_id).to eq response_data[:id]
      end

      example 'Creating a second version makes it the current version', document: false do
        create(:custom_block_version, custom_block: custom_block)

        do_request

        assert_status 201
        expect(response_data[:attributes][:number]).to eq 2
        expect(custom_block.reload.current_version.number).to eq 2
      end
    end

    context 'when visitor' do
      example_request '[error] Try to create a version without authorization' do
        assert_status 401
      end
    end
  end

  get 'web_api/v1/custom_blocks/:custom_block_id/versions' do
    let(:custom_block) { create(:custom_block, :published) }
    let(:custom_block_id) { custom_block.id }

    context 'when admin' do
      before { admin_header_token }

      example 'List the versions of a custom block' do
        create(:custom_block_version, custom_block: custom_block)

        do_request

        assert_status 200
        expect(response_data.pluck(:attributes).pluck(:number)).to eq [2, 1]
      end
    end

    context 'when visitor' do
      example_request '[error] Try to list the versions without authorization' do
        assert_status 401
      end
    end
  end

  get 'web_api/v1/custom_blocks/:custom_block_id/versions/:number/bundle' do
    let(:custom_block) { create(:custom_block, :published) }
    let(:custom_block_id) { custom_block.id }
    let(:number) { custom_block.current_version.number }

    example_request 'Get the compiled bundle of a version of a published custom block' do
      assert_status 200

      expect(response_headers['Content-Type']).to include 'text/javascript'
      expect(response_headers['Cache-Control']).to include 'immutable'
      expect(response_headers['Cache-Control']).to include 'max-age=31536000'
      expect(response_body).to eq custom_block.current_version.bundle
    end

    context 'when the block is not published' do
      let(:custom_block) { create(:custom_block) }
      let!(:version) { create(:custom_block_version, custom_block: custom_block) }
      let(:number) { version.number }

      example_request '[error] Try to get the bundle of a draft custom block as a visitor' do
        assert_status 401
      end
    end

    context 'when the feature is not activated' do
      before { SettingsService.new.deactivate_feature!('custom_page_blocks') }

      example_request '[error] Try to get the bundle while the feature is not activated' do
        assert_status 401
      end
    end
  end
end
