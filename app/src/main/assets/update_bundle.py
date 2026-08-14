import os

assets_dir = '/app/src/main/assets'
index_path = os.path.join(assets_dir, 'index.html')
game_path = os.path.join(assets_dir, 'game.js')

with open(index_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

with open(game_path, 'r', encoding='utf-8') as f:
    game_js_content = f.read()

# Replace content inside <script> and </script>
script_start = html_content.find('<script>')
script_end = html_content.rfind('</script>')

if script_start != -1 and script_end != -1:
    new_html = html_content[:script_start + len('<script>')] + '\n' + game_js_content + '\n' + html_content[script_end:]
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("Successfully updated index.html with game.js!")
else:
    print("Error: <script> tags not found!")
