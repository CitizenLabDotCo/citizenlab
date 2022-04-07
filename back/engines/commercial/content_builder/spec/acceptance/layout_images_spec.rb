require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ContentBuilderLayoutImages' do
  explanation 'Images that occur in content builder layouts.'

  before { header 'Content-Type', 'application/json' }

  context 'when not authorized' do
    let(:image) { encode_image_as_base64 'image13.png' }

    post 'web_api/v1/content_builder_layout_images' do
      example_request '[error] Try to create a layout for a project without authorization' do
        expect(status).to eq 401
      end
    end
  end

  context 'when authorized' do
    let(:user) { create :admin }

    before do
      token = Knock::AuthToken.new(payload: user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    describe 'POST' do
      with_options scope: :layout_image do
        parameter :image, 'The base64 encoded image.', required: true
      end
      let(:image) { encode_image_as_base64 'image13.png' }

      post 'web_api/v1/content_builder_layout_images' do
        example_request 'Create an image for a layout' do
          expect(status).to eq 201
        end
      end
    end
  end

  private

  def encode_image_as_base64(filename)
    "data:image/png;base64,#{Base64.encode64(File.read(Rails.root.join('spec', 'fixtures', filename)))}"
  end
end
