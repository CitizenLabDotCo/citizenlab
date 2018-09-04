module EmailCampaigns
  class ApplicationMailer < ActionMailer::Base
    default from: ENV.fetch("DEFAULT_FROM_EMAIL", 'hello@citizenlab.co')
    layout 'mailer'
  end
end
