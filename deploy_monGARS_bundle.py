#!/usr/bin/env python3
import os
import re

SOURCE_FILE = "monGARS_complete_project_bundle.txt"
DEST_DIR = "monGARS_project"

def parse_and_write_files():
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)

    with open(SOURCE_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = r"// ===== File: (.*?) =====\n\n(.*?)\n\n// ===== End of File: \1 ====="
    matches = re.findall(pattern, content, re.DOTALL)

    for filename, file_content in matches:
        full_path = os.path.join(DEST_DIR, filename)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as out_file:
            out_file.write(file_content.strip())
        print(f"[✔] Created: {full_path}")

def run_post_install():
    os.chdir(DEST_DIR)
    if os.path.exists("package.json"):
        print("[🔧] Running npm install...")
        os.system("npm install")
    else:
        print("[⚠️] No package.json found, skipping npm install.")

if __name__ == "__main__":
    parse_and_write_files()
    run_post_install()
// ===== End of File: deploy_monGARS_bundle.py =====