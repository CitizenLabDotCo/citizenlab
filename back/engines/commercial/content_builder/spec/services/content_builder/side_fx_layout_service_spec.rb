# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::SideFxLayoutService do
  subject(:service) { described_class.new }

  let(:user) { build(:user) }
  let(:layout) { create(:layout) }

  describe 'before_create' do
    it 'does not log activity' do
      expect(LogActivityJob).not_to receive(:perform_later)
      service.before_create(layout, user)
    end
  end

  describe 'before_update' do
    it 'does not log activity' do
      expect(LogActivityJob).not_to receive(:perform_later)
      service.before_update(layout, user)
    end
  end

  describe 'before_destroy' do
    it 'does not log activity' do
      expect(LogActivityJob).not_to receive(:perform_later)
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
            'craftjs_jsonmultiloc' => {},
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
  end
end
