require 'rails_helper'

RSpec.describe PublishActivityToRabbitJob, type: :job do
  
  subject(:job) { PublishActivityToRabbitJob.new }

  describe '#perform' do

    it "generates an event with the desired content" do
      user = create(:user)
      comment = create(:comment)
      activity = create(:activity, item: comment, action: 'created', user: user)

      expect(PublishGenericEventToRabbitJob).to receive(:perform_now) do |event, routing_key|
        expect(routing_key).to eq('comment.created')

        expect(event[:event]).to eq("Comment created")
        expect(event[:user_id]).to eq(user.id)
        expect(event[:action]).to eq("created")
        expect(event[:item_id]).to eq(comment.id)
        expect(event[:item_type]).to eq('Comment')
        expect(event.dig(:item_content, :comment, :id)).to eq(comment.id)
        expect(event[:cl2_cluster]).to eq 'local'
      end

      job.perform activity
    end

  end
end

