require 'rails_helper'

RSpec.describe IdentifyToSegmentJob, type: :job do
  
  subject(:job) { IdentifyToSegmentJob.new }

  describe '#perform' do

    it "calls segment's identify() method with the correct payload" do
      user = create(:user)
      
      expect(Analytics).to receive(:identify) do |identification|
        expect(identification).to match ({
          :user_id=>user.id,
          :traits=>
          {
            :id=>user.id,
            :email=>user.email,
            :firstName=>user.first_name,
            :lastName=>user.last_name,
            :createdAt=>user.created_at,
            :locale=>"en",
            :birthday=>nil,
            :gender=>nil,
            :is_admin=>false,
            :timezone=>"Europe/Brussels",
            :tenantId=>Tenant.current.id,
            :tenantName=>"test-tenant",
            :tenantHost=>"example.org",
            :tenantOrganizationType=>"medium_city",
            :tenantLifecycleStage=>"active"
          }
        })
      end
      job.perform user
    end

    it "calls segment's group() method with the correct payload" do
      user = create(:user)
      
      expect(Analytics).to receive(:group) do |grouping|
        expect(grouping).to match({
          :user_id=>user.id,
          :group_id=>Tenant.current.id,
          :traits=>{
            :name=>"test-tenant",
            :website=>"https://example.org",
            :avatar=>nil,
            :createdAt=>Tenant.current.created_at,
            :tenantId=>Tenant.current.id,
            :tenantName=>"test-tenant",
            :tenantHost=>"example.org",
            :tenantOrganizationType=>"medium_city",
            :tenantLifecycleStage=>"active"
          }
        })
      end
      job.perform user
    end

  end
end
