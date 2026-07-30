import os
import ast
import json

def analyze_python_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        tree = ast.parse(content)
        imports = [node.names[0].name for node in ast.walk(tree) if isinstance(node, ast.Import)]
        from_imports = [node.module for node in ast.walk(tree) if isinstance(node, ast.ImportFrom)]
        functions = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef)]
        classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
        return {'imports': imports + from_imports, 'functions': functions, 'classes': classes, 'lines': len(content.splitlines())}
    except Exception as e:
        return {'error': str(e)}

def analyze_repo(root_dir):
    result = {}
    for root, dirs, files in os.walk(root_dir):
        if any(ignored in root for ignored in ['node_modules', '.git', '.next', '.venv', '__pycache__']):
            continue
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                rel_path = os.path.relpath(path, root_dir)
                result[rel_path] = analyze_python_file(path)
    return result

print(json.dumps(analyze_repo('.'), indent=2))
