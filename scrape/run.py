from camoufox.sync_api import Camoufox
import socketserver
import http.server

PORT = 8000

with Camoufox(os=["windows", "macos", "linux"], humanize=True, headless=True) as browser:

  class Handler(http.server.BaseHTTPRequestHandler):
      def do_GET(self):
          self.send_response(200)
          self.send_header("Content-type", "text/html")
          self.end_headers()
          with browser.new_page() as page:
              page.goto("https://www.immobiliare.it/annunci/96478742/?utm_source=navigator-share&utm_medium=share")
              page.wait_for_load_state("networkidle")
              content = page.content()
              self.wfile.write(content.encode('utf-8'))

  with socketserver.TCPServer(("localhost", PORT), Handler) as httpd:
      print(f"Serving on port {PORT}...")
      
      try:
          httpd.serve_forever()
      except KeyboardInterrupt:
          print("Shutting down server...")
      finally:
          httpd.server_close()
          print("Server stopped.")
