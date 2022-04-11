require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ContentBuilderLayoutImages' do
  explanation 'Images that occur in content builder layouts.'

  before { set_api_content_type }

  post 'web_api/v1/content_builder_layout_images' do
    with_options scope: :layout_image do
      parameter :image, 'The base64 encoded image.', required: true
    end
    let(:image) { png_image_as_base64 'image13.png' }

    context 'when not authorized' do
      example_request '[error] Try to create a layout for a project without authorization' do
        assert_status 401
      end
    end

    context 'when authorized' do
      before { admin_header_token }

      example_request 'Create an image for a layout' do
        assert_status 201

        json_response = json_parse response_body
        expect(json_response).to include(
          {
            data: {
              id: be_a(String),
              type: 'layout_image',
              attributes: {
                code: be_a(String),
                image_url: be_a(String),
                created_at: match(time_regex),
                updated_at: match(time_regex)
              }
            }
          }
        )
      end
    end
  end
end
