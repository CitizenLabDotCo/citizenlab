require 'rails_helper'

RSpec.describe LogToSegmentJob, type: :job do
  
  subject(:job) { LogToSegmentJob.new }

  describe '#perform' do

    it "generates an event with the desired content" do
      user = create(:user)
      comment = create(:comment)
      activity = create(:activity, item: comment, action: 'created', user: user)
      
      expect(Analytics).to receive(:track) do |event|
        expect(event[:event]).to eq("Comment created")
        expect(event[:userId]).to eq(user.id)
        expect(event.dig(:properties, :source)).to eq("cl2-back")
        expect(event.dig(:properties, :tenantId)).to eq(Tenant.current.id)
        expect(event.dig(:properties, :action)).to eq("created")
        expect(event.dig(:properties, :item_id)).to eq(comment.id)
        expect(event.dig(:properties, :item_type)).to eq('Comment')
        expect(event.dig(:properties, :item_content, :comment, :id)).to eq(comment.id)
      end
      job.perform activity
    end

  end
end
