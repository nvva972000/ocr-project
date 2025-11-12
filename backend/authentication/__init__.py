from authlib.integrations.starlette_client import OAuth
from common import config

oauth = OAuth()
oauth.register(
    name='keycloak',
    client_id=config.OIDC_CLIENT_ID,
    client_secret=config.OIDC_CLIENT_SECRET,
    server_metadata_url=config.OIDC_DISCOVERY_SERVER,
    client_kwargs={'scope': "openid email profile"},
)