# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PublishActivityToRabbitJob, type: :job do
  subject(:job) { described_class.new }

  describe '#perform' do
    it 'generates an event with the desired content' do
      user = create(:user)
      comment = create(:comment)
      activity = create(:activity, item: comment, action: 'created', user: user)

      expect(PublishGenericEventToRabbitJob).to receive(:perform_now) do |event, routing_key|
        expect(routing_key).to eq('comment.created')

        expect(event).to include(
          event: 'Comment created',
          user_id: user.id,
          action: 'created',
          item_id: comment.id,
          item_type: 'Comment',
          item_content: hash_including(comment: hash_including(id: comment.id))
        )
      end

      job.perform activity
    end
  end
end
