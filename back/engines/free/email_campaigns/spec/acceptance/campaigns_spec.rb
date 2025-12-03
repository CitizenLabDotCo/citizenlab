# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

def create_campaign_params(context)
  context.parameter :campaign_name, "The type of campaign. One of #{EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES.map(&:campaign_name).join(', ')}", required: true, scope: :campaign
  context.parameter :sender, "Who is shown as the sender towards the recipients, either #{EmailCampaigns::SenderConfigurable::SENDERS.join(' or ')}", required: false, scope: :campaign
  context.parameter :reply_to, 'The e-mail of the reply-to address. Defaults to the author', required: false, scope: :campaign
  context.parameter :subject_multiloc, 'The subject of the email, as a multiloc string', required: false, scope: :campaign
  context.parameter :body_multiloc, 'The body of the email campaign, as a multiloc string. Supports basic HTML', required: false, scope: :campaign
  context.parameter :enabled, 'Whether the campaign is enabled or not, as a boolean', required: false, scope: :campaign
end

def update_campaign_params(context)
  context.parameter :sender, "Who is shown as the sender towards the recipients, either #{EmailCampaigns::SenderConfigurable::SENDERS.join(' or ')}", scope: :campaign
  context.parameter :reply_to, 'The e-mail of the reply-to address. Defaults to the author', scope: :campaign
  context.parameter :subject_multiloc, 'The subject of the email, as a multiloc string', scope: :campaign
  context.parameter :body_multiloc, 'The body of the email campaign, as a multiloc string. Supports basic HTML', scope: :campaign
  context.parameter :enabled, 'Whether the campaign is enabled or not, as a boolean', scope: :campaign
end

resource 'Campaigns' do
  explanation 'E-mail campaigns, both automated and manual'

  before do
    @manual_campaigns = create_list(:manual_campaign, 4)
    @manual_project_participants_campaign = create(:manual_project_participants_campaign)
    @automated_campaigns = [create(:official_feedback_on_idea_you_follow_campaign), create(:welcome_campaign)]
  end

  context 'as an admin' do
    before do
      header 'Content-Type', 'application/json'
      @user = create(:admin)
      EmailCampaigns::UnsubscriptionToken.create!(user_id: @user.id)
      header_token_for @user
    end

    get '/web_api/v1/campaigns' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of campaigns per page'
      end
      parameter :without_campaign_names, "An array of campaign names that should not be returned. Possible values are #{EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES.map(&:campaign_name).join(', ')}", required: false
      parameter :manual, 'Filter manual campaigns - only manual if true, only automatic if false', required: false, type: 'boolean'

      example_request 'List all campaigns' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 6
      end

      example 'List all campaigns that are not specific type(s)' do
        do_request(without_campaign_names: %w[manual])
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end

      example 'List all manual campaigns' do
        do_request(manual: true)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
      end

      example 'List ALL automatic campaigns' do
        EmailCampaigns::Campaign.all.each(&:destroy!)
        SettingsService.new.activate_feature! 'community_monitor'
        # Create one of every type of automated campaign
        @campaigns = EmailCampaigns::DeliveryService.new.campaign_classes.each do |klaz|
          factory_type = :"#{klaz.name.demodulize.underscore}_campaign"
          create(factory_type)
        end

        do_request(manual: false)
        expect(response_data.size).to eq 48
      end

      example 'List all manual campaigns when one has been sent' do
        create_list(:delivery, 5, campaign: @manual_campaigns.first)
        do_request(manual: true)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4

        sent_campaign = json_response[:data].find { |c| c[:id] == @manual_campaigns.first.id }
        unsent_campaign = json_response[:data].find { |c| c[:id] == @manual_campaigns.second.id }
        expect(sent_campaign[:attributes][:delivery_stats]).to match({
          sent: 5,
          bounced: 0,
          failed: 0,
          accepted: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          total: 5
        })
        expect(unsent_campaign[:attributes][:stats]).to be_nil
      end

      example 'List all non-manual campaigns with expected management labels' do
        do_request(without_campaign_names: %w[manual manual_project_participants])
        json_response = json_parse(response_body)

        multiloc_service ||= MultilocService.new
        recipient_role_multiloc = multiloc_service.i18n_to_multiloc(@automated_campaigns[0].class.recipient_role_multiloc_key).transform_keys(&:to_sym)
        recipient_segment_multiloc = multiloc_service.i18n_to_multiloc(@automated_campaigns[0].class.recipient_segment_multiloc_key).transform_keys(&:to_sym)
        content_type_multiloc = multiloc_service.i18n_to_multiloc(@automated_campaigns[0].class.content_type_multiloc_key).transform_keys(&:to_sym)
        trigger_multiloc = multiloc_service.i18n_to_multiloc(@automated_campaigns[0].class.trigger_multiloc_key).transform_keys(&:to_sym)

        expect(json_response[:data][1][:attributes][:recipient_role_multiloc]).to eq    recipient_role_multiloc
        expect(json_response[:data][1][:attributes][:recipient_segment_multiloc]).to eq recipient_segment_multiloc
        expect(json_response[:data][1][:attributes][:content_type_multiloc]).to eq      content_type_multiloc
        expect(json_response[:data][1][:attributes][:trigger_multiloc]).to eq           trigger_multiloc
      end
    end

    context 'Listing all campaigns scoped under a context' do
      let!(:manual_global) { create(:manual_campaign) }
      let!(:manual_project) { create(:manual_project_participants_campaign) }
      let!(:global_phase) { create(:project_phase_started_campaign, context: nil) }
      let!(:automated_phase) { create(:project_phase_started_campaign, context: create(:phase)) }

      get '/web_api/v1/projects/:context_id/campaigns' do
        let(:context_id) { manual_project.context_id }

        example_request 'List all campaigns scoped under a project' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data].pluck(:id)).to eq [manual_project.id]
        end
      end

      get '/web_api/v1/phases/:context_id/campaigns' do
        let(:context_id) { automated_phase.context_id }

        example_request 'List all campaigns scoped under a phase' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data].pluck(:id)).to eq [automated_phase.id]
        end

        context 'voting phase' do
          let(:context) { create(:budgeting_phase) }
          let(:context_id) { context.id }

          example 'List only campaigns supported by the context', document: false do
            create(:comment_on_idea_you_follow_campaign, context: nil)
            create(:voting_basket_not_submitted_campaign, context: nil)
            voting_campaign = create(:voting_basket_not_submitted_campaign, context: context)
            create(:cosponsor_of_your_idea_campaign, context: nil)
            create(:cosponsor_of_your_idea_campaign, context: context)

            do_request

            assert_status 200
            json_response = json_parse(response_body)
            expect(json_response[:data].size).to eq 1
            expect(json_response[:data].pluck(:id)).to eq [voting_campaign.id]
          end
        end

        example '[Unauthorized] List no campaigns, for a user that cannot moderate campaigns', document: false do
          header_token_for create(:project_moderator)

          do_request
          assert_status 200
          expect(json_parse(response_body)[:data].size).to eq 0
        end
      end
    end

    get '/web_api/v1/phases/:context_id/campaigns/supported_campaign_names' do
      let(:context_id) { create(:ideation_phase).id }

      example_request 'Lists all campaigns supported for an ideation phase' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes)).to eq %w[comment_deleted_by_admin comment_on_idea_you_follow comment_on_your_comment idea_published mention_in_official_feedback official_feedback_on_idea_you_follow project_phase_started status_change_on_idea_you_follow your_input_in_screening]
      end
    end

    get '/web_api/v1/campaigns/:id' do
      let(:campaign) { create(:manual_campaign) }
      let(:id) { campaign.id }

      example_request 'Get one campaign by id' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
        expect(json_response[:data][:attributes][:delivery_stats]).to be_nil
      end

      example 'Get a manual campaign that has been sent' do
        create_list(:delivery, 5, campaign: campaign)
        do_request
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:delivery_stats]).to match({
          sent: 5,
          bounced: 0,
          failed: 0,
          accepted: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          total: 5
        })
      end
    end

    get '/web_api/v1/campaigns/:id/preview' do
      let(:campaign) { create(:manual_campaign) }
      let(:id) { campaign.id }

      example_request 'Get a campaign HTML preview' do
        assert_status 200
        expect(response_data.dig(:attributes, :html)).to be_present
        expect(response_data.dig(:attributes, :subject)).to be_present
      end
    end

    post 'web_api/v1/campaigns' do
      create_campaign_params(self)
      ValidationErrorHelper.new.error_fields self, EmailCampaigns::Campaign

      context 'manual campaigns' do
        with_options scope: :campaign do
          parameter :group_ids, 'Array of group ids to whom the email should be sent', required: false
        end

        let(:campaign) { build(:manual_campaign) }
        let(:campaign_name) { 'manual' }
        let(:subject_multiloc) { campaign.subject_multiloc }
        let(:body_multiloc) { campaign.body_multiloc }
        let(:sender) { 'author' }
        let(:reply_to) { 'test@emailer.com' }
        let(:group_ids) { [create(:group).id] }

        example_request 'Create a campaign' do
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :subject_multiloc).stringify_keys).to match subject_multiloc
          expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
          expect(json_response.dig(:data, :attributes, :sender)).to match sender
          expect(json_response.dig(:data, :attributes, :reply_to)).to match reply_to
          expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq @user.id
          expect(json_response.dig(:data, :relationships, :groups, :data).pluck(:id)).to eq group_ids
        end

        context 'when body contains images' do
          let(:body_multiloc) { { 'en' => html_with_base64_image } }

          it_behaves_like 'creates record with text images',
            model_class: EmailCampaigns::Campaign,
            field: :body_multiloc
        end
      end
    end

    post 'web_api/v1/projects/:project_id/campaigns' do
      create_campaign_params(self)
      ValidationErrorHelper.new.error_fields self, EmailCampaigns::Campaign

      context 'moderator' do # TODO: Move out of admin context
        before do
          @user = create(:project_moderator)
          header_token_for @user
        end

        let(:project_id) { @user.roles.first['project_id'] }
        let(:campaign) { build(:manual_project_participants_campaign) }
        let(:campaign_name) { 'manual_project_participants' }
        let(:subject_multiloc) { campaign.subject_multiloc }
        let(:body_multiloc) { campaign.body_multiloc }
        let(:sender) { 'author' }
        let(:reply_to) { 'test@emailer.com' }

        context 'manual campaigns' do
          with_options scope: :campaign do
            parameter :group_ids, 'Array of group ids to whom the email should be sent', required: false
          end

          example_request 'Create a campaign, manageable by project moderator, for moderated project' do
            expect(response_status).to eq 201
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :attributes, :subject_multiloc).stringify_keys).to match subject_multiloc
            expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
            expect(json_response.dig(:data, :attributes, :sender)).to match sender
            expect(json_response.dig(:data, :attributes, :reply_to)).to match reply_to
            expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq @user.id
          end

          describe do
            let(:project_id) { create(:project).id }

            example '[Unauthorized] Create campaign, manageable by project moderator, for unmoderated project', document: false do
              do_request
              expect(response_status).to eq 401
            end
          end

          example '[Unauthorized] Create campaign, not manageable by project moderator', document: false do
            do_request(campaign: { campaign_name: 'manual' })
            expect(response_status).to eq 401
          end
        end
      end

      post 'web_api/v1/phases/:phase_id/campaigns' do
        create_campaign_params(self)
        ValidationErrorHelper.new.error_fields self, EmailCampaigns::Campaign

        context 'moderator' do # TODO: Move out of admin context
          before do
            @user = create(:project_moderator)
            header_token_for @user
          end

          context 'automated campaigns' do
            let(:phase_id) { create(:phase, project_id: @user.roles.first['project_id']).id }
            let!(:campaign) { create(:project_phase_started_campaign, context: nil) }
            let(:campaign_name) { 'project_phase_started' }
            # let(:subject_multiloc) { campaign.subject_multiloc }
            # let(:body_multiloc) { campaign.body_multiloc }
            # let(:sender) { 'author' }
            # let(:reply_to) { 'test@emailer.com' }

            example_request 'Create a campaign' do
              expect(response_status).to eq 201
              json_response = json_parse(response_body)
              # TODO: Uncomment when they are content and sender configurable
              # expect(json_response.dig(:data, :attributes, :subject_multiloc).stringify_keys).to match subject_multiloc
              # expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
              # expect(json_response.dig(:data, :attributes, :sender)).to match sender
              # expect(json_response.dig(:data, :attributes, :reply_to)).to match reply_to
              expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq @user.id
            end
          end
        end
      end
    end

    patch 'web_api/v1/campaigns/:id' do
      update_campaign_params(self)
      ValidationErrorHelper.new.error_fields self, EmailCampaigns::Campaign

      let(:id) { campaign.id }
      let(:subject_multiloc) { { 'en' => 'New subject' } }
      let(:body_multiloc) { { 'en' => 'New body' } }

      context 'manual campaigns' do
        with_options scope: :campaign do
          parameter :group_ids, 'Array of group ids to whom the email should be sent', required: false
        end

        let(:campaign) { create(:manual_campaign) }
        let(:sender) { 'organization' }
        let(:reply_to) { 'otherguy@organization.net' }
        let(:group_ids) { [create(:group).id] }

        example_request 'Update a campaign' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :subject_multiloc).stringify_keys).to match subject_multiloc
          expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to match body_multiloc
          expect(json_response.dig(:data, :attributes, :sender)).to match sender
          expect(json_response.dig(:data, :attributes, :campaign_description_multiloc).stringify_keys).to eq campaign.class.campaign_description_multiloc
          expect(json_response.dig(:data, :attributes, :reply_to)).to match reply_to
          expect(json_response.dig(:data, :relationships, :author, :data, :id)).to eq campaign.author_id
          expect(json_response.dig(:data, :relationships, :groups, :data).pluck(:id)).to eq group_ids
        end

        context 'when body contains images' do
          let(:body_multiloc) { { 'en' => html_with_base64_image } }

          it_behaves_like 'updates record with text images',
            model_class: EmailCampaigns::Campaign,
            field: :body_multiloc
        end
      end

      context 'global campaigns' do
        context 'automated campaigns' do
          with_options scope: :campaign do
            parameter :subject_multiloc, 'The subject of the email, as a multiloc string with Liquid substitutions', required: true
            parameter :title_multiloc, 'The header title of the email campaign as a multiloc string with Liquid substitutions', required: false
            parameter :intro_multiloc, 'The intro paragraph of the email as a multiloc string with Liquid substitutions - supports HTML', required: false
            parameter :button_text_multiloc, 'The text of the CTA button as a multiloc string with Liquid substitutions - supports HTML', required: false
          end

          let(:campaign) { create(:comment_on_idea_you_follow_campaign, enabled: true) }
          let(:title_multiloc) { { 'en' => 'New title' } }
          let(:intro_multiloc) { { 'en' => '' } }
          let(:button_text_multiloc) { { 'en' => 'Reply to {{commentAuthor}}' } }

          example_request 'Update an automated campaign' do
            assert_status 200

            attributes = response_data[:attributes]

            # Updates english, but returns french defaults
            expect(attributes.dig(:subject_multiloc, :en)).to eq 'New subject'
            expect(attributes.dig(:subject_multiloc, :'fr-FR')).to eq 'Il y a un nouveau commentaire sur « {{input_title}} »'

            expect(attributes.dig(:title_multiloc, :en)).to eq 'New title'
            expect(attributes.dig(:title_multiloc, :'fr-FR')).to eq '{{authorName}} a commenté une idée que vous suivez'

            # Allows blank value in button_text_multiloc
            expect(attributes.dig(:intro_multiloc, :en)).to eq ''

            # Does not allow blank value in button_text_multiloc and returns default
            expect(attributes.dig(:button_text_multiloc, :en)).to eq 'Reply to {{commentAuthor}}'

            # Does not save body_multiloc, as it is not applicable to automated campaigns
            expect(attributes[:body_multiloc]).to eq({})
          end

          describe do
            let(:enabled) { false }

            example_request 'Disable the campaign' do
              assert_status 200
              expect(campaign.reload.enabled).to be false
            end
          end

          context 'when intro contains images' do
            let(:intro_multiloc) { { 'en' => html_with_base64_image } }

            it_behaves_like 'updates record with text images',
              model_class: EmailCampaigns::Campaign,
              field: :intro_multiloc,
              locale: :en
          end
        end
      end

      context 'context campaigns' do
        let(:phase) { create(:ideation_phase) }
        let!(:global_campaign) { create(:project_phase_started_campaign, enabled: true, context: nil) }
        let(:context_campaign) { create(:project_phase_started_campaign, enabled: false, context: phase) }
        let(:id) { context_campaign.id }
        let(:enabled) { true }

        context 'when moderator' do
          before { header_token_for create(:project_moderator, projects: [phase.project]) }

          example_request 'Enable the campaign' do
            assert_status 200
            expect(context_campaign.reload.enabled).to be true
          end
        end

        context 'when not moderator' do
          before { header_token_for create(:project_moderator) }

          example '[error] Update campaign', document: false do
            do_request(campaign: { body_multiloc: { 'en' => 'Updated body' } })
            expect(response_status).to eq 401
          end
        end
      end
    end

    delete 'web_api/v1/campaigns/:id' do
      let!(:id) { create(:manual_campaign).id }

      example 'Delete a campaign' do
        old_count = EmailCampaigns::Campaign.count
        do_request
        assert_status 200
        expect { EmailCampaigns::Campaign.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(EmailCampaigns::Campaign.count).to eq(old_count - 1)
      end
    end

    post 'web_api/v1/campaigns/:id/send' do
      ValidationErrorHelper.new.error_fields self, EmailCampaigns::Campaign

      let(:campaign) { create(:manual_campaign) }
      let(:id) { campaign.id }

      example_request 'Send out the campaign now' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :deliveries_count)).to eq User.count
      end

      example '[error] Send out the campaign without an author' do
        campaign.update_columns(author_id: nil, sender: 'author')
        do_request
        assert_status 422
        expect(json_response_body).to include_response_error(:author, 'blank')
      end

      example '[error] Send out a campaign without recipients' do
        group = create(:group)
        create(:campaigns_group, campaign: campaign, group: group)
        # Add one recipient to the group that doensn't consent to this campaign
        recipient = create(:user)
        create(:membership, group: group, user: recipient)
        create(:consent, user: recipient, consented: false)

        do_request
        assert_status 422
        expect(json_response_body).to include_response_error(:base, 'no_recipients')
      end
    end

    get 'web_api/v1/campaigns/:id/deliveries' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of deliveries per page'
      end

      let(:campaign) { create(:manual_campaign) }
      let!(:id) { campaign.id }
      let!(:deliveries) { create_list(:delivery, 5, campaign: campaign) }

      example_request 'Get the deliveries of a sent campaign. Includes the recipients.' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq deliveries.size
        expect(json_response[:included].size).to eq deliveries.size
      end
    end

    get 'web_api/v1/campaigns/:id/stats' do
      let(:campaign) { create(:manual_campaign) }
      let!(:id) { campaign.id }
      let!(:deliveries) do
        create_list(
          :delivery, 20,
          campaign: campaign,
          delivery_status: 'accepted'
        )
      end

      example_request 'Get the delivery statistics of a sent campaign' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes]).to match({
          sent: 20,
          bounced: 0,
          failed: 0,
          accepted: 20,
          delivered: 0,
          opened: 0,
          clicked: 0,
          total: 20
        })
      end
    end
  end

  context 'as a project moderator' do
    before do
      header 'Content-Type', 'application/json'
      @user = create(:user, roles: [{ type: 'project_moderator', project_id: @manual_project_participants_campaign.context_id }])
      EmailCampaigns::UnsubscriptionToken.create!(user_id: @user.id)
      header_token_for @user
    end

    let!(:manual_project_participants_campaign_not_moderated_by_this_pm) { create(:manual_project_participants_campaign) }

    get '/web_api/v1/campaigns/:id' do
      let(:id) { @manual_project_participants_campaign.id }

      example_request 'Get campaign, manageable by project moderator, by id' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
      end
    end

    get '/web_api/v1/campaigns/:id' do
      let(:id) { manual_project_participants_campaign_not_moderated_by_this_pm.id }

      example_request '[Unauthorized] Get campaign, for project not moderated by project moderator', document: false do
        assert_status 401
      end
    end

    get '/web_api/v1/campaigns/:id' do
      let(:id) { @automated_campaigns.first.id }

      example_request '[Unauthorized] Get campaign of type not manageable by project moderators', document: false do
        assert_status 401
      end
    end

    get '/web_api/v1/campaigns/:id/preview' do
      let(:id) { @manual_project_participants_campaign.id }

      example_request 'Get a campaign HTML preview, for campaign manageable by project moderator' do
        assert_status 200
        expect(response_data.dig(:attributes, :html)).to be_present
        expect(response_data.dig(:attributes, :subject)).to be_present
      end
    end

    get '/web_api/v1/campaigns/:id/preview' do
      let(:id) { manual_project_participants_campaign_not_moderated_by_this_pm.id }

      example_request '[Unauthorized] Get preview, for campaign for project not moderated by project moderator', document: false do
        assert_status 401
      end
    end

    get '/web_api/v1/campaigns/:id/preview' do
      let(:campaign) { create(:manual_campaign) }
      let(:id) { manual_project_participants_campaign_not_moderated_by_this_pm.id }

      example_request '[Unauthorized] Get preview, for campaign not manageable by project moderator', document: false do
        assert_status 401
      end
    end

    delete 'web_api/v1/campaigns/:id' do
      example 'Delete a campaign' do
        id = @manual_project_participants_campaign.id
        old_count = EmailCampaigns::Campaign.count
        do_request(id: id)
        assert_status 200
        expect { EmailCampaigns::Campaign.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(EmailCampaigns::Campaign.count).to eq(old_count - 1)
      end

      example '[Unauthorized] Delete campaign, manageable by project moderator, for unmoderated project', document: false do
        id = manual_project_participants_campaign_not_moderated_by_this_pm.id
        do_request(id: id)
        assert_status 401
      end

      example '[Unauthorized] Delete campaign, not manageable by project moderator', document: false do
        id = @automated_campaigns.first.id
        do_request(id: id)
        assert_status 401
      end
    end

    post 'web_api/v1/campaigns/:id/send' do
      ValidationErrorHelper.new.error_fields self, EmailCampaigns::Campaign

      let!(:participant) { create(:user) }
      let!(:project) { create(:project_with_active_ideation_phase) }
      let!(:idea) { create(:idea, project: project, author: participant, publication_status: 'published', phases: project.phases) }

      example 'Send out the campaign now' do
        @manual_project_participants_campaign.update(context_id: project.id)
        @user.update(roles: [{ type: 'project_moderator', project_id: project.id }])

        do_request(id: @manual_project_participants_campaign.id)
        assert_status 200

        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :deliveries_count)).to eq 1
      end

      example '[Unauthorized] Send out a campaign manageable by project moderator, for unmoderated project', document: false do
        manual_project_participants_campaign_not_moderated_by_this_pm.update(context_id: project.id)

        do_request(id: manual_project_participants_campaign_not_moderated_by_this_pm.id)
        assert_status 401
      end

      example '[Unauthorized] Send out a campaign not manageable by project moderator', document: false do
        do_request(id: @automated_campaigns.first.id)
        assert_status 401
      end
    end

    get 'web_api/v1/campaigns/:id/stats' do
      let(:campaign) { @manual_project_participants_campaign }
      let!(:deliveries) do
        create_list(
          :delivery, 20,
          campaign: campaign,
          delivery_status: 'accepted'
        )
      end

      example 'Get the delivery statistics of a sent campaign' do
        do_request(id: campaign.id)
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes]).to match({
          sent: 20,
          bounced: 0,
          failed: 0,
          accepted: 20,
          delivered: 0,
          opened: 0,
          clicked: 0,
          total: 20
        })
      end

      example '[Unauthorized] Get the delivery statistics of a sent campaign manageable by project moderator, for unmoderated project', document: false do
        other_project = create(:project)
        @user.update!(roles: [{ type: 'project_moderator', project_id: other_project.id }])

        do_request(id: @manual_project_participants_campaign.id)
        assert_status 401
      end

      example '[Unauthorized] Get the delivery statistics of a sent campaign not manageable by project moderator', document: false do
        do_request(id: @automated_campaigns.second.id)
        assert_status 401
      end
    end
  end
end
