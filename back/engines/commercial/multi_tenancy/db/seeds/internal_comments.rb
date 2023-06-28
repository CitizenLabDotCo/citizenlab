# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class InternalComments < Base
      def run
        idea = Idea.first
        initiative = Initiative.first
        admins = User.admin

        if idea && admins.first
          internal_comment = InternalComment.create!(
            body: 'We should bring this input to the next executive meeting.',
            author: admins.first,
            post: idea
          )

          create_reply_comment(idea, internal_comment, admins) if internal_comment && admins.second
        end

        if initiative && admins.first
          internal_comment = InternalComment.create!(
            body: 'We should bring this proposal to the next executive meeting.',
            author: admins.first,
            post: initiative
          )

          create_reply_comment(initiative, internal_comment, admins) if internal_comment && admins.second
        end
      end

      def create_reply_comment(post, parent, admins)
        InternalComment.create!(
          body: '+1 to this!',
          author: admins.second,
          post: post,
          parent: parent
        )
      end
    end
  end
end
