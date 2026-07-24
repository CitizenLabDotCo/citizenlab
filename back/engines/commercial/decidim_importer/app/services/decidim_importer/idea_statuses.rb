# frozen_string_literal: true

module DecidimImporter
  # Resolves the carrier `idea_status_code` placed on imported idea records into a real, tenant-local
  # `idea_status_id`, just before the template is deserialized.
  #
  # Imported (published) ideas require an idea_status, but every tenant already seeds the standard
  # statuses at creation. The template's `*_ref` mechanism can only link records created in the *same*
  # apply, and the build step runs outside any tenant — so we can neither ref nor look up the seeded
  # statuses at build time. Instead each idea carries `idea_status_code`, and this helper swaps it for
  # the tenant-local id inside `tenant.switch` (mirroring how {Importer.strip_remote_image_urls!}
  # rewrites the loaded template before deserialize).
  #
  # The lookup MUST be scoped to `participation_method: 'ideation'`: the tenant seeds the same codes
  # (proposed, accepted, rejected, under_consideration, …) for both the ideation and proposals
  # methods, so a code alone is ambiguous. Decidim proposals are imported into ideation phases.
  module IdeaStatuses
    PARTICIPATION_METHOD = 'ideation'

    # Decidim proposal `state_token` → Go Vocal ideation idea_status `code`. `withdrawn` proposals are
    # kept visible but flagged rejected (only a handful occur); unknown/blank tokens default to
    # `proposed`.
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

    # Rewrites every idea record in the loaded template in place: deletes the carrier
    # `idea_status_code` and sets the resolved `idea_status_id`. Must run inside the target tenant.
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

    # The ideation status id for `code`, falling back to the always-seeded `proposed` status (a
    # locked code present in every tenant) when a tenant happens not to carry that particular status —
    # so a single missing status never aborts the whole all-or-nothing import. Raises only when even
    # the fallback is absent, i.e. the tenant has no ideation statuses at all.
    def status_id(code)
      status = ::IdeaStatus.find_by(code: code, participation_method: PARTICIPATION_METHOD)
      status ||= ::IdeaStatus.find_by!(code: DEFAULT_CODE, participation_method: PARTICIPATION_METHOD)
      status.id
    end
  end
end
