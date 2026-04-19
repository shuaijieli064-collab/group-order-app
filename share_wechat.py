from __future__ import annotations

import os
import socket
import threading
import time
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path

from qrcode.main import QRCode
from pyngrok import ngrok

from app import app


BASE_DIR = Path(__file__).resolve().parent
QR_TEXT_PATH = BASE_DIR / "wechat-share-qr.txt"
LOCAL_URL = "http://127.0.0.1:5000"
HEALTH_URL = f"{LOCAL_URL}/api/menu"


def is_port_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.3)
        return sock.connect_ex((host, port)) == 0


def wait_for_local_server(timeout: float = 15.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(HEALTH_URL, timeout=1.5) as response:
                if response.status == 200:
                    return True
        except (urllib.error.URLError, TimeoutError):
            time.sleep(0.3)
    return False


def start_local_server_if_needed() -> bool:
    if is_port_open("127.0.0.1", 5000):
        return False

    thread = threading.Thread(
        target=lambda: app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False),
        daemon=True,
    )
    thread.start()
    return True


def build_qr_ascii(url: str) -> str:
    qr = QRCode(border=1)
    qr.add_data(url)
    qr.make(fit=True)
    rows = []
    for row in qr.get_matrix():
        rows.append("".join("██" if cell else "  " for cell in row))
    return "\n".join(rows)


def maybe_open(path_or_url: str) -> None:
    try:
        if path_or_url.startswith("http"):
            webbrowser.open(path_or_url)
        elif os.name == "nt":
            os.startfile(path_or_url)
    except Exception:
        pass


def main() -> None:
    started_here = start_local_server_if_needed()
    if not wait_for_local_server():
        raise RuntimeError("本地服务启动失败，请先手动运行 python app.py")

    token = os.getenv("NGROK_AUTHTOKEN", "").strip()
    if token:
        ngrok.set_auth_token(token)

    tunnel = ngrok.connect(addr=5000, bind_tls=True)
    public_url = tunnel.public_url

    qr_ascii = build_qr_ascii(public_url)
    QR_TEXT_PATH.write_text(qr_ascii, encoding="utf-8")

    print("\n=== 微信分享链接已生成 ===")
    print(f"本地地址: {LOCAL_URL}")
    print(f"公网地址: {public_url}")
    print(f"二维码文本: {QR_TEXT_PATH}")
    if started_here:
        print("本地服务由脚本自动启动。")
    else:
        print("检测到本地服务已在运行。")
    print("把公网地址直接发给微信好友即可访问。")
    print("下面是终端二维码（微信扫一扫也可）：")
    print(qr_ascii)
    print("按 Ctrl+C 结束分享。\n")

    maybe_open(public_url)
    maybe_open(str(QR_TEXT_PATH))

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        ngrok.disconnect(public_url)
        ngrok.kill()
        print("\n分享已结束，隧道已关闭。")


if __name__ == "__main__":
    main()
