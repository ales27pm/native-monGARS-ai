import os
import re

def main():
    input_file = 'monGARS_complete_codebase24.txt'
    if not os.path.exists(input_file):
        print(f"Error: '{input_file}' not found in the current directory.")
        return

    file_pattern = re.compile(r'^// ===== File: (.+) =====')
    current_path = None
    buffer = []

    with open(input_file, 'r') as f:
        for line in f:
            match = file_pattern.match(line)
            if match:
                # Flush previous file
                if current_path:
                    write_file(current_path, buffer)
                # Start new file
                current_path = match.group(1).strip()
                buffer = []
            else:
                if current_path:
                    buffer.append(line)

    # Write last file
    if current_path:
        write_file(current_path, buffer)

def write_file(path, lines):
    # Ensure directory exists
    dir_path = os.path.dirname(path)
    if dir_path and not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
    # Write file
    with open(path, 'w') as f:
        f.writelines(lines)
    print(f"Written: {path}")

if __name__ == "__main__":
    main()
