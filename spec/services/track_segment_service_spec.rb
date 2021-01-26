require "rails_helper"

describe TrackSegmentService do
  let(:service) { TrackSegmentService.new }

  describe "integrations" do
    it "logs to all destinations by default" do
      user = build_stubbed(:user)
      expect(service.integrations(user)[:All]).to be true
    end

    it "doesn't include intercom for a super admin" do
      user = build_stubbed(:admin, email: "hello@citizenlab.co")
      expect(service.integrations(user)[:Intercom]).to be false
    end

    it "includes intercom for an admin" do
      user = build_stubbed(:admin)
      expect(service.integrations(user)[:Intercom]).to be true
    end

    it "includes intercom for a project moderator" do
      user = build_stubbed(:moderator)
      expect(service.integrations(user)[:Intercom]).to be true
    end

    it "doesn't include intercom for a normal user" do
      user = build_stubbed(:user)
      expect(service.integrations(user)[:Intercom]).to be false
    end

    it "doesn't include SatisMeter for a super admin" do
      user = build_stubbed(:admin, email: "hello@citizenlab.co")
      expect(service.integrations(user)[:SatisMeter]).to be false
    end

    it "includes SatisMeter for an admin" do
      user = build_stubbed(:admin)
      expect(service.integrations(user)[:SatisMeter]).to be true
    end

    it "includes SatisMeter for a project moderator" do
      user = build_stubbed(:moderator)
      expect(service.integrations(user)[:SatisMeter]).to be true
    end

    it "doesn't include SatisMeter for a normal user" do
      user = build_stubbed(:user)
      expect(service.integrations(user)[:SatisMeter]).to be false
    end
  end

  describe 'identify_user' do
    it "calls segment's identify() method with the correct payload" do
      tenant = Tenant.current
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
            :isSuperAdmin=>false,
            :isAdmin=>false,
            :isProjectModerator=>false,
            :highestRole=>:user,
            :timezone=>"Brussels",
            :tenantId=>Tenant.current.id,
            :tenantName=>"test-tenant",
            :tenantHost=>"example.org",
            :tenantOrganizationType=>"medium_city",
            :tenantLifecycleStage=>"active"
          },
          integrations: {
            All: true,
            Intercom: false,
            SatisMeter: false
          }
        })
      end
      service.identify_user(user, tenant)
    end
  end

  describe 'identify_tenant' do
    it "calls segment's group() method with the correct payload" do
      tenant = Tenant.current

      expect(Analytics).to receive(:group) do |grouping|
        expect(grouping).to match({
          :user_id=>grouping[:user_id],  # we don't care about the user id when tracking a tenant
          :group_id=>Tenant.current.id,
          :traits=>{
            :name=>"test-tenant",
            :website=>"https://example.org",
            :avatar=>nil,
            :createdAt=>Tenant.current.created_at,
            :tenantLocales=>["en","fr-FR","nl-NL"],
            :tenantId=>Tenant.current.id,
            :tenantName=>"test-tenant",
            :tenantHost=>"example.org",
            :tenantOrganizationType=>"medium_city",
            :tenantLifecycleStage=>"active"
          },
          integrations: {
            All: true,
            Intercom: true,
            SatisMeter: true
          }
        })
      end
      service.identify_tenant(tenant)
    end
  end

  describe 'track' do
    it "generates an event with the desired content for (normal) activities" do
      user = create(:user)
      comment = create(:comment)
      activity = create(:activity, item: comment, action: 'created', user: user)

      expect(Analytics).to receive(:track) do |event|
        expect(event[:event]).to eq("Comment created")
        expect(event[:user_id]).to eq(user.id)
        expect(event.dig(:properties, :source)).to eq("cl2-back")
        expect(event.dig(:properties, :tenantId)).to eq(Tenant.current.id)
        expect(event.dig(:properties, :action)).to eq("created")
        expect(event.dig(:properties, :item_id)).to eq(comment.id)
        expect(event.dig(:properties, :item_type)).to eq('Comment')
        expect(event.dig(:properties, :item_content, :comment, :id)).to eq(comment.id)
        expect(event.dig(:properties, :cl2_cluster)).to eq 'local'
        expect(event.dig(:integrations, :All)).to be true
        expect(event.dig(:integrations, :Intercom)).to be false
        expect(event.dig(:integrations, :SatisMeter)).to be false
      end
      service.track(activity, Tenant.current)
    end

    it "generates an event with the desired content for activities about notifications" do
      user = create(:user)
      notification = create(:comment_on_your_comment, recipient: user)
      activity = create(:activity, item: notification, item_type: notification.type, action: 'created', user: user)
      activity.update!(item_type: notification.class.name)

      expect(Analytics).to receive(:track) do |event|
        expect(event[:event]).to eq("Notification for Comment on your comment created")
        expect(event[:user_id]).to eq(user.id)
        expect(event.dig(:properties, :source)).to eq("cl2-back")
        expect(event.dig(:properties, :tenantId)).to eq(Tenant.current.id)
        expect(event.dig(:properties, :action)).to eq("created")
        expect(event.dig(:properties, :item_id)).to eq(notification.id)
        expect(event.dig(:properties, :item_type)).to eq('Notifications::CommentOnYourComment')
        expect(event.dig(:properties, :cl2_cluster)).to eq 'local'
      end
      service.track(activity, Tenant.current)
    end
  end
end
