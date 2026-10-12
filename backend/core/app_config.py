"""Environment accessors extracted from the application. Values are read at call time."""
from __future__ import annotations
import os
_TRUTHY = frozenset({'1', 'true', 'yes', 'on'})
_FALSY = frozenset({'0', 'false', 'no', 'off'})

def get_str(name: str, default: str='') -> str:
    raw = os.getenv(name)
    return default if raw is None else raw

def get_bool(name: str, default: bool=False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    v = raw.strip().lower()
    if v in _TRUTHY:
        return True
    if v in _FALSY:
        return False
    return default

def get_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw.strip() == '':
        return default
    try:
        return int(raw.strip())
    except ValueError:
        return default

def get_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None or raw.strip() == '':
        return default
    try:
        return float(raw.strip())
    except ValueError:
        return default
