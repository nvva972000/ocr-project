import os
from pathlib import Path

import casbin
from casbin_sqlalchemy_adapter import Adapter

from app.db.session import engine


def get_enforcer() -> casbin.Enforcer:
    base_dir = Path(__file__).resolve().parent
    model_conf = base_dir / "model.conf"

    adapter = Adapter(engine)

    enforcer = casbin.Enforcer(str(model_conf), adapter)
    enforcer.load_policy()
    return enforcer

