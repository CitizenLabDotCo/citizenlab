module EmailCampaigns
  class PreviewService
    PreviewUser = Struct.new(:first_name, :last_name, :display_name, :display_name_multiloc)
    PreviewContentItem = Struct.new(:id, :title_multiloc, :body_multiloc, :url, :deleted_reason)
    PreviewEvent = Struct.new(:id, :title_multiloc, :address1, :address2_multiloc)
    PreviewData = Struct.new(:idea, :project, :phase, :comment, :proposal, :event, :author, :initiator, :organization_name, :placeholder_image_url)

    # Static content that can be used across all email previews.
    def preview_data(recipient)
      multiloc_service = MultilocService.new
      PreviewData.new(
        idea: PreviewContentItem.new(
          id: SecureRandom.uuid,
          title_multiloc: multiloc_service.i18n_to_multiloc('email_campaigns.preview_data.idea_title'),
          body_multiloc: multiloc_service.i18n_to_multiloc('email_campaigns.preview_data.idea_body'),
          url: "/#{recipient.locale}/ideas/example-idea"
        ),
        proposal: PreviewContentItem.new(
          id: SecureRandom.uuid,
          title_multiloc: multiloc_service.i18n_to_multiloc('email_campaigns.preview_data.proposal_title'),
          url: "/#{recipient.locale}/ideas/example-proposal"
        ),
        project: PreviewContentItem.new(
          id: SecureRandom.uuid,
          title_multiloc: multiloc_service.i18n_to_multiloc('email_campaigns.preview_data.project_title'),
          url: "/#{recipient.locale}/projects/example-project"
        ),
        phase: PreviewContentItem.new(
          id: SecureRandom.uuid,
          title_multiloc: multiloc_service.i18n_to_multiloc('email_campaigns.preview_data.phase_title'),
          url: "/#{recipient.locale}/phase/example-project/example-phase"
        ),
        comment: PreviewContentItem.new(
          id: SecureRandom.uuid,
          body_multiloc: multiloc_service.i18n_to_multiloc('email_campaigns.preview_data.comment_body'),
          deleted_reason: I18n.t('email_campaigns.preview_data.comment_deleted_reason', locale: recipient.locale)
        ),
        event: PreviewEvent.new(
          id: SecureRandom.uuid,
          title_multiloc: multiloc_service.i18n_to_multiloc('email_campaigns.preview_data.event_title'),
          address1: I18n.t('email_campaigns.preview_data.event_address1', locale: recipient.locale),
          address2_multiloc: multiloc_service.i18n_to_multiloc('email_campaigns.preview_data.event_address2')
        ),
        author: PreviewUser.new(
          first_name: I18n.t('email_campaigns.preview_data.author_first_name', locale: recipient.locale),
          last_name: I18n.t('email_campaigns.preview_data.author_last_name', locale: recipient.locale),
          display_name: I18n.t('email_campaigns.preview_data.author_display_name', locale: recipient.locale)
        ),
        initiator: PreviewUser.new(
          first_name: I18n.t('email_campaigns.preview_data.initiator_first_name', locale: recipient.locale),
          last_name: I18n.t('email_campaigns.preview_data.initiator_last_name', locale: recipient.locale),
          display_name: I18n.t('email_campaigns.preview_data.initiator_display_name', locale: recipient.locale),
          display_name_multiloc: multiloc_service.i18n_to_multiloc('email_campaigns.preview_data.initiator_display_name')
        ),
        organization_name: multiloc_service.t(AppConfiguration.instance.settings('core', 'organization_name'), recipient.locale),
        placeholder_image_url: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/placeholder.jpg'
      )
    end
  end
end
