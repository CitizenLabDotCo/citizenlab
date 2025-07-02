module EmailCampaigns
  class PreviewService
    PreviewUser = Struct.new(:first_name, :last_name, :display_name)
    PreviewContentItem = Struct.new(:id, :title_multiloc, :body_multiloc, :url, :deleted_reason)
    PreviewData = Struct.new(:idea, :project, :comment, :proposal, :author, :organization_name)

    # Static content that can be used across all email previews.
    def self.preview_data(recipient)
      PreviewData.new(
        idea: PreviewContentItem.new(
          id: SecureRandom.uuid,
          title_multiloc: MultilocService.new.i18n_to_multiloc('email_campaigns.preview_data.idea_title'),
          url: "/#{recipient.locale}/ideas/example-idea"
        ),
        proposal: PreviewContentItem.new(
          id: SecureRandom.uuid,
          title_multiloc: MultilocService.new.i18n_to_multiloc('email_campaigns.preview_data.idea_title')
        ),
        project: PreviewContentItem.new(
          id: SecureRandom.uuid,
          title_multiloc: MultilocService.new.i18n_to_multiloc('email_campaigns.preview_data.project_title'),
          url: "/#{recipient.locale}/projects/example-project"
        ),
        comment: PreviewContentItem.new(
          id: SecureRandom.uuid,
          body_multiloc: MultilocService.new.i18n_to_multiloc('email_campaigns.preview_data.comment_body'),
          deleted_reason: I18n.t('email_campaigns.preview_data.comment_deleted_reason', locale: recipient.locale)
        ),
        author: PreviewUser.new(
          first_name: I18n.t('email_campaigns.preview_data.author_first_name', locale: recipient.locale),
          last_name: I18n.t('email_campaigns.preview_data.author_last_name', locale: recipient.locale),
          display_name: I18n.t('email_campaigns.preview_data.author_display_name', locale: recipient.locale)
        ),
        organization_name: MultilocService.new.t(AppConfiguration.instance.settings('core', 'organization_name'), recipient.locale)
      )
    end
  end
end
