# == Schema Information
#
# Table name: email_snippets
#
#  id         :uuid             not null, primary key
#  email      :string
#  snippet    :string
#  locale     :string
#  body       :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_email_snippets_on_email_and_snippet_and_locale  (email,snippet,locale)
#
require "rails-html-sanitizer"

class EmailSnippet < ApplicationRecord

  @@sanitizer = Rails::Html::WhiteListSanitizer.new

  validates :email, :snippet, :locale, :body, presence: true
  validates :locale, inclusion: {in: -> (email_snippet) { AppConfiguration.instance.settings('core','locales') } }


  before_validation :sanitize_body

  def sanitize_body
    self.body = @@sanitizer.sanitize(self.body, tags: %w(p b u i em strong a), attributes: %w(href))
  end

end
