import os

# Update both root index.html and app/src/main/assets/index.html if present
targets = [
    ('index.html', 'game.js'),
    ('app/src/main/assets/index.html', 'app/src/main/assets/game.js')
]

for index_path, game_path in targets:
    if os.path.exists(index_path) and os.path.exists(game_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        with open(game_path, 'r', encoding='utf-8') as f:
            game_js_content = f.read()

        script_start = html_content.find('<script>')
        script_end = html_content.rfind('</script>')

        if script_start != -1 and script_end != -1:
            new_html = html_content[:script_start + len('<script>')] + '\n' + game_js_content + '\n' + html_content[script_end:]
            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(new_html)
            print(f"Successfully updated {index_path} with {game_path}!")

        # Also sync game.js across root and assets if needed
if os.path.exists('game.js') and os.path.exists('app/src/main/assets/game.js'):
    with open('app/src/main/assets/game.js', 'r', encoding='utf-8') as f:
        src_game = f.read()
    with open('game.js', 'w', encoding='utf-8') as f:
        f.write(src_game)
    print("Synced game.js to root game.js!")

if os.path.exists('app/src/main/assets/index.html') and os.path.exists('index.html'):
    with open('app/src/main/assets/index.html', 'r', encoding='utf-8') as f:
        src_index = f.read()
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(src_index)
    print("Synced index.html to root index.html!")
