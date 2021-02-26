module EmailCampaigns
  class Campaigns::YourProposedInitiativesDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_authors_of_proposed_initiatives


    def self.default_schedule
      IceCube::Schedule.new(Time.find_zone(AppConfiguration.instance.settings('core','timezone')).local(2019)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:wednesday).hour_of_day(14)
        )
      end
    end

    def self.category
      'scheduled'
    end

    def mailer_class
      YourProposedInitiativesDigestMailer
    end

    def generate_commands recipient:, time: nil
      time ||= Time.now
      initiatives = recipient.initiatives.published.proposed.order(:published_at)
      if initiatives.present?
        [{
          event_payload: {
            initiatives: initiatives.includes(:initiative_images).map{ |initiative|
              {
                title_multiloc: initiative.title_multiloc,                
                body_multiloc: initiative.body_multiloc,
                url: Frontend::UrlService.new.model_to_url(initiative),
                published_at: initiative.published_at&.iso8601,
                upvotes_count: initiative.upvotes_count,
                votes_needed: initiative.votes_needed,
                votes_this_week: initiative.upvotes.where('created_at > ?', time - 1.week).count,
                comments_count: initiative.comments_count,
                expires_at: initiative.expires_at.iso8601,
                status_code: initiative.initiative_status.code,
                images: initiative.initiative_images.map{ |image|
                  {
                    ordering: image.ordering,
                    versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
                  }
                },
                header_bg: {
                  versions: initiative.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
                }
              }
            }
          },
          tracked_content: {
            initiative_ids: initiatives.ids
          }
        }]
      else
        []
      end
    end


    private

    def filter_authors_of_proposed_initiatives users_scope, options={}
      users_scope.where(id: Initiative.published.proposed.pluck(:author_id))
    end

  end
end
