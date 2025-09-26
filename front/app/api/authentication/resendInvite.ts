import fetcher from 'utils/cl-react-query/fetcher';

export default function resendInvite(email: string) {
  return fetcher({
    path: '/invites/resend',
    action: 'post',
    body: { invite: { email } },
  });
}
