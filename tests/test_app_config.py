"""Isolated checks for the published configuration accessors."""
import importlib.util
import os
import unittest
from pathlib import Path
from unittest.mock import patch


MODULE = Path(__file__).resolve().parents[1] / "backend/core/app_config.py"
SPEC = importlib.util.spec_from_file_location("published_app_config", MODULE)
app_config = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(app_config)
KEY = "PUBLIC_EXCERPT_TEST_VALUE"


class ConfigTests(unittest.TestCase):
    def test_string_preserves_value_and_uses_default_when_absent(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(app_config.get_str(KEY, "fallback"), "fallback")
            os.environ[KEY] = "  unchanged  "
            self.assertEqual(app_config.get_str(KEY), "  unchanged  ")

    def test_bool_accepts_explicit_true_and_false_values(self):
        with patch.dict(os.environ, {}, clear=True):
            for value in ("1", "true", "YES", " on "):
                with self.subTest(value=value):
                    os.environ[KEY] = value
                    self.assertTrue(app_config.get_bool(KEY, False))
            for value in ("0", "false", "NO", " off "):
                with self.subTest(value=value):
                    os.environ[KEY] = value
                    self.assertFalse(app_config.get_bool(KEY, True))

    def test_unknown_bool_preserves_the_callers_default(self):
        with patch.dict(os.environ, {}, clear=True):
            for value in (None, "", "  ", "unknown"):
                with self.subTest(value=value):
                    if value is None:
                        os.environ.pop(KEY, None)
                    else:
                        os.environ[KEY] = value
                    self.assertFalse(app_config.get_bool(KEY, False))
                    self.assertTrue(app_config.get_bool(KEY, True))

    def test_integer_parsing_and_invalid_input(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(app_config.get_int(KEY, 7), 7)
            for value, expected in ((" 12 ", 12), ("-2", -2), ("0", 0), ("1.5", 7), ("", 7), ("invalid", 7)):
                with self.subTest(value=value):
                    os.environ[KEY] = value
                    self.assertEqual(app_config.get_int(KEY, 7), expected)

    def test_float_parsing_and_invalid_input(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(app_config.get_float(KEY, 2.5), 2.5)
            for value, expected in ((" 1.25 ", 1.25), ("-0.5", -0.5), ("0", 0.0), ("", 2.5), ("invalid", 2.5)):
                with self.subTest(value=value):
                    os.environ[KEY] = value
                    self.assertEqual(app_config.get_float(KEY, 2.5), expected)

    def test_environment_changes_are_read_at_each_call(self):
        with patch.dict(os.environ, {KEY: "1"}, clear=True):
            self.assertEqual(app_config.get_int(KEY, 0), 1)
            os.environ[KEY] = "2"
            self.assertEqual(app_config.get_int(KEY, 0), 2)
            os.environ.pop(KEY)
            self.assertEqual(app_config.get_int(KEY, 0), 0)


if __name__ == "__main__":
    unittest.main()
