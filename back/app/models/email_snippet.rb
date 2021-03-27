class EmailSnippet < ApplicationRecord

  @@sanitizer = Rails::Html::WhiteListSanitizer.new

  validates :email, :snippet, :locale, :body, presence: true
  validates :locale, inclusion: {in: -> (email_snippet) { AppConfiguration.instance.settings('core','locales') } }


  before_validation :sanitize_body

  def sanitize_body
    self.body = @@sanitizer.sanitize(self.body, tags: %w(p b u i em strong a), attributes: %w(href))
  end

end
