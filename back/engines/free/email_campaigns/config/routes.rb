# frozen_string_literal: true

EmailCampaigns::Engine.routes.draw do
  namespace :web_api, defaults: { format: :json } do
    namespace :v1 do
      resources :campaigns do
        post :send, action: :do_send, on: :member
        post :send_email_preview, on: :member
        post :send_sms_preview, on: :member
        get :email_preview, on: :member
        get :email_deliveries, on: :member
        get :sms_deliveries, on: :member
        get :email_stats, on: :member
        get :sms_stats, on: :member
        resources :examples, only: %i[index]
        get 'examples/:id', action: 'show', controller: 'examples', on: :collection
      end

      %w[projects phases].each do |context|
        resources context.to_sym, only: [] do
          resources :campaigns, defaults: { campaign_context: context.classify }, only: %i[index create] do
            get :supported_campaign_names, on: :collection
          end
        end
      end

      resources :consents, only: %i[index update] do
        patch 'by_campaign_id/:campaign_id', action: 'update_by_campaign_id', on: :collection
      end
    end
  end

  namespace :hooks, defaults: { format: :json } do
    resources :mailgun_events, only: [:create]

    namespace :sms do
      resources :events, only: [:create]
    end
  end
end
