# fake_sso

## Setup

To enable the fake SSO method locally, take the following steps:

1. Add the following line to `/etc/hosts`:

```
127.0.0.1 host.docker.internal
```

2. Enable the `fake_sso` feature flag:

```
make feature-toggle feature=fake_sso enabled=true
```

3. Start the BE with the following command:

```
docker compose --profile fake_sso up
```

## Other useful resources

- https://developer.okta.com/blog/2019/10/21/illustrated-guide-to-oauth-and-oidc
