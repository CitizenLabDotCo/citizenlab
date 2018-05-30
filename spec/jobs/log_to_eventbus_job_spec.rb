require 'rails_helper'

RSpec.describe LogToEventbusJob, type: :job do
  
  subject(:job) { LogToEventbusJob.new }

  describe '#perform' do

    it "generates an event with the desired content" do
      user = create(:user)
      comment = create(:comment)
      activity = create(:activity, item: comment, action: 'created', user: user)
      
      expect(job).to receive(:publish_to_rabbit) do |event|
        expect(event[:event]).to eq("Comment created")
        expect(event[:user_id]).to eq(user.id)
        expect(event[:tenantId]).to eq(Tenant.current.id)
        expect(event[:action]).to eq("created")
        expect(event[:item_id]).to eq(comment.id)
        expect(event[:item_type]).to eq('Comment')
        expect(event.dig(:item_content, :comment, :id)).to eq(comment.id)
      end
      job.perform activity
    end

  end
end
