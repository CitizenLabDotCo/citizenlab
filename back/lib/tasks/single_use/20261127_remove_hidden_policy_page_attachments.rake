# frozen_string_literal: true

# Removes the attachments of the terms and privacy pages that the public page doesn't show
# (`files_section_enabled` off). Run it before the release in which these pages show every
# attachment: a file that was never shown there should not become public.
#
# It does what removing a file in Settings → Policies does: the attachment goes, and the file stays
# in the file library.
#
#     rake single_use:remove_hidden_policy_page_attachments                    # dry run, all tenants
#     rake 'single_use:remove_hidden_policy_page_attachments[execute]'         # write, all tenants
#     rake 'single_use:remove_hidden_policy_page_attachments[execute,foo.com]' # write, one tenant
namespace :single_use do
  desc "Remove the attachments the terms and privacy pages hide. Dry run unless passed 'execute'."
  task :remove_hidden_policy_page_attachments, %i[execute host] => [:environment] do |_t, args|
    TenantScript.run(
      'remove_hidden_policy_page_attachments',
      args: args,
      description: 'removing the attachments the terms and privacy pages hide'
    ) do |tenant, script|
      StaticPage
        .where(code: %w[terms-and-conditions privacy-policy], files_section_enabled: false)
        .find_each do |page|
          page.file_attachments.includes(:file).each do |attachment|
            script.reporter.add_delete(
              'Files::FileAttachment', attachment.id,
              context: { tenant: tenant.host, page: page.code, file: attachment.file.name, file_id: attachment.file_id }
            )
            attachment.destroy! if script.execute?
          end
        end
    end
  end
end
