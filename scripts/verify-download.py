"""Browser checks for the real download links and installation guidance.

Requires Playwright for Python and its Chromium browser.
"""
import argparse
import functools
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--url')
args = parser.parse_args()
server = None
if args.url:
    url = args.url
else:
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(
        Quiet, directory=str(Path(__file__).resolve().parents[2])))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/luce/'

results = []
errors = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width, height in [(1440, 1000), (390, 844)]:
            context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
            # Stub only the binary transfer; exercise the actual page/link/click behavior.
            context.route('**/releases/download/*/*.dmg', lambda route: route.fulfill(
                status=200, headers={'Content-Disposition': 'attachment; filename="Luce-0.1.0-beta.1-mac-arm64.dmg"',
                                     'Content-Type': 'application/octet-stream'}, body=b'installer test fixture'))
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(url, wait_until='networkidle')
            button = page.locator('.hero [data-download]')
            expect(button).to_have_count(1)
            expect(page.locator('.hero .download-note')).to_contain_text('Apple Silicon')
            expect(page.locator('.hero .download-note')).to_contain_text('unnotarized', ignore_case=True)
            with page.expect_download() as event:
                button.click()
            download = event.value
            assert download.suggested_filename == 'Luce-0.1.0-beta.1-mac-arm64.dmg'
            expect(page.locator('#install-guide')).to_be_in_viewport()
            expect(page.locator('#install-title')).to_be_focused()
            expect(page.locator('#download-status')).to_contain_text('starting')
            expect(page.locator('#install-guide')).to_contain_text('Privacy & Security')
            expect(page.locator('#install-guide')).to_contain_text('Open Anyway')
            expect(page.locator('#install-guide .install-step')).to_have_count(3)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.locator('#theme-toggle').click()
            expect(page.locator('body')).to_have_class('dark')
            results.append({'width': width, 'download': 'passed', 'guide': 'passed', 'overflow': 'none'})
            context.close()
        context = browser.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 844})
        page = context.new_page()
        page.goto(url + '#install-guide', wait_until='load')
        expect(page.locator('#install-guide')).to_be_visible()
        expect(page.locator('#install-guide')).to_contain_text('Open Anyway')
        context.close()
        browser.close()
    assert not errors, errors
    print(json.dumps({'checks': results, 'no_javascript_guide': 'passed', 'javascript_errors': errors}, indent=2))
finally:
    if server:
        server.shutdown()
