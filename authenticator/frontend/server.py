from http.server import HTTPServer, SimpleHTTPRequestHandler
import ssl


port= 4443
httpd = HTTPServer(("0.0.0.0",4443), SimpleHTTPRequestHandler)
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain('../../assets/certs/192.168.1.12.pem', '../../assets/certs/192.168.1.12-key.pem')
httpd.socket = ssl_context.wrap_socket(
    httpd.socket,
    server_side=True,
)

ssl_context.check_hostname = False
print(f"Serving on https://localhost:{port}")
httpd.serve_forever()

