# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::SideFxLayoutService do
  subject(:service) { described_class.new }

  let(:user) { create(:user) }
  let(:layout) { create(:layout) }

  describe 'before_create' do
    it 'does not log activity' do
      expect(LogActivityJob).not_to receive(:perform_later)
      service.before_create(layout, user)
    end

    it 'swaps data images' do
      expect_any_instance_of(ContentBuilder::LayoutImageService).to receive(:swap_data_images).with(layout.craftjs_json)
      service.before_create(layout, user)
    end
  end

  describe 'before_update' do
    it 'does not log activity' do
      expect(LogActivityJob).not_to receive(:perform_later)
      service.before_update(layout, user)
    end

    it 'swaps data images' do
      expect_any_instance_of(ContentBuilder::LayoutImageService).to receive(:swap_data_images).with(layout.craftjs_json)
      service.before_update(layout, user)
    end

    it 'extracts new inline images in RichTextMultiloc bridge nodes into TextImages' do
      layout.craftjs_json = {
        'ROOT' => {
          'type' => 'div', 'isCanvas' => true, 'props' => {},
          'displayName' => 'div', 'nodes' => ['bridge'], 'linkedNodes' => {}
        },
        'bridge' => {
          'type' => { 'resolvedName' => 'RichTextMultiloc' },
          'props' => {
            'text' => {
              'en' => '<p>Hi</p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">'
            }
          },
          'parent' => 'ROOT', 'nodes' => [], 'linkedNodes' => {}
        }
      }

      expect { service.before_update(layout, user) }.to change(TextImage, :count).by(1)

      text_image = TextImage.order(:created_at).last
      expect(text_image.imageable).to eq(layout.content_buildable)
      html = layout.craftjs_json['bridge']['props']['text']['en']
      expect(html).to include("data-cl2-text-image-text-reference=\"#{text_image.text_reference}\"")
      expect(html).not_to include('base64')
    end
  end

  describe 'before_destroy' do
    it 'does not log activity' do
      expect(LogActivityJob).not_to receive(:perform_later)
      service.before_destroy(layout, user)
    end

    it 'does not swap data images' do
      expect_any_instance_of(ContentBuilder::LayoutImageService).not_to receive(:swap_data_images)
      service.before_destroy(layout, user)
    end
  end

  describe 'after_create' do
    it 'logs "created" activity' do
      expect(LogActivityJob).to receive(:perform_later).with(
        layout,
        'created',
        user,
        layout.created_at.to_i
      )
      service.after_create(layout, user)
    end

    it 'does not swap data images' do
      expect_any_instance_of(ContentBuilder::LayoutImageService).not_to receive(:swap_data_images)
      service.after_create(layout, user)
    end
  end

  describe 'after_update' do
    it 'logs "changed" activity' do
      expect(LogActivityJob).to receive(:perform_later).with(
        layout,
        'changed',
        user,
        layout.updated_at.to_i
      )
      service.after_update(layout, user)
    end

    it 'does not swap data images' do
      expect_any_instance_of(ContentBuilder::LayoutImageService).not_to receive(:swap_data_images)
      service.after_update(layout, user)
    end
  end

  describe 'after_destroy' do
    it 'logs "deleted" activity' do
      expect(LogActivityJob).to receive(:perform_later).with(
        "ContentBuilder::Layout/#{layout.id}",
        'deleted',
        user,
        be_an(Numeric),
        payload: hash_including(
          layout: hash_including(
            'id' => layout.id,
            'craftjs_json' => {},
            'content_buildable_type' => layout.content_buildable_type,
            'content_buildable_id' => layout.content_buildable_id,
            'code' => layout.code,
            'enabled' => true,
            'created_at' => be_an(Numeric),
            'updated_at' => be_an(Numeric)
          )
        )
      )
      service.after_destroy(layout, user)
    end

    it 'does not swap data images' do
      expect_any_instance_of(ContentBuilder::LayoutImageService).not_to receive(:swap_data_images)
      service.after_destroy(layout, user)
    end
  end
end
