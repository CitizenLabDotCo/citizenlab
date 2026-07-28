# frozen_string_literal: true

module DecidimImporter
  # Resolves the carrier `idea_status_code` on imported idea records into a tenant-local
  # `idea_status_id`, just before the template is deserialized.
  #
  # Published ideas require an idea_status, but tenants seed the standard statuses at creation. The
  # template's `*_ref` mechanism only links records created in the *same* apply, and the build step
  # runs outside any tenant — so seeded statuses can't be refed or looked up at build time. Instead
  # each idea carries `idea_status_code`, swapped here for the tenant-local id inside `tenant.switch`
  # (mirroring {TemplateCleaner.strip_remote_upload_urls!}).
  #
  # The lookup MUST be scoped to `participation_method: 'ideation'`: the same codes (proposed, accepted,
  # …) are seeded for both ideation and proposals, so a code alone is ambiguous. Decidim proposals are
  # imported into ideation phases.
  module IdeaStatuses
    PARTICIPATION_METHOD = 'ideation'

    # Decidim proposal `state_token` → Go Vocal ideation idea_status `code`. `withdrawn` is flagged
    # rejected but kept visible; unknown/blank tokens default to `proposed`.
    STATE_TOKEN_TO_CODE = {
      'not_answered' => 'proposed',
      'evaluating' => 'under_consideration',
      'accepted' => 'accepted',
      'rejected' => 'rejected',
      'withdrawn' => 'rejected'
    }.freeze
    DEFAULT_CODE = 'proposed'

    module_function

    def code_for_state_token(state_token)
      STATE_TOKEN_TO_CODE.fetch(state_token.to_s.strip.downcase, DEFAULT_CODE)
    end

    # Rewrites every idea record in place: deletes `idea_status_code`, sets the resolved
    # `idea_status_id`. Must run inside the target tenant.
    def resolve!(template)
      ideas = template.dig('models', 'idea')
      return template if ideas.blank?

      cache = {}
      ideas.each do |attributes|
        code = attributes.delete('idea_status_code')
        next unless code

        attributes['idea_status_id'] = (cache[code] ||= status_id(code))
      end
      template
    end

    # The ideation status id for `code`, falling back to the always-seeded `proposed` status when the
    # tenant lacks that particular status — so one missing status never aborts the all-or-nothing
    # import. Raises only if even the fallback is absent (no ideation statuses at all).
    def status_id(code)
      status = ::IdeaStatus.find_by(code: code, participation_method: PARTICIPATION_METHOD)
      status ||= ::IdeaStatus.find_by!(code: DEFAULT_CODE, participation_method: PARTICIPATION_METHOD)
      status.id
    end
  end
end
