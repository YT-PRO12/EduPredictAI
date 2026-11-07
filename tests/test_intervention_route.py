"""Route-unit tests isolate model imports and database startup side effects."""
import ast
import unittest
from pathlib import Path
from unittest.mock import Mock

class HTTPException(Exception):
    def __init__(self, status_code, detail):
        self.status_code = status_code
        self.detail = detail

class InterventionRouteTest(unittest.TestCase):
    def setUp(self):
        source = ast.parse(Path("backend/main.py").read_text())
        route = next(node for node in source.body if isinstance(node, ast.FunctionDef) and node.name == "save_interventions")
        route.decorator_list = []
        self.save = Mock()
        namespace = {"Body": lambda value: value, "HTTPException": HTTPException, "save_student_interventions": self.save}
        exec(compile(ast.Module(body=[route], type_ignores=[]), "backend/main.py", "exec"), namespace)
        self.route = namespace["save_interventions"]

    def test_invalid_plan_raises_http_validation_error(self):
        self.save.side_effect = ValueError("Intervention IDs must be unique")
        with self.assertRaises(HTTPException) as result:
            self.route("synthetic", [{"id": 1}, {"id": 1}])
        self.assertEqual(result.exception.status_code, 422)
        self.assertIn("unique", result.exception.detail)

    def test_successful_save_retains_response_contract(self):
        result = self.route("synthetic", [{"id": 1}])
        self.assertEqual(result["student_id"], "synthetic")
        self.assertEqual(result["message"], "Interventions saved successfully")
        self.save.assert_called_once_with("synthetic", [{"id": 1}])
