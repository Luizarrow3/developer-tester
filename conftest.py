import json
import os
import re
from datetime import datetime
from io import BytesIO
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

import pytest


SENSITIVE_KEYS = {"password", "token", "authorization", "email", "phone", "cpf", "secret"}


def _safe_name(value):
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", value).strip("_.")


def _redact(value):
    if isinstance(value, dict):
        return {
            key: "[REDACTED]" if key.lower() in SENSITIVE_KEYS else _redact(item)
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [_redact(item) for item in value]
    return value


def _json_payload(raw):
    try:
        return _redact(json.loads(raw))
    except (TypeError, json.JSONDecodeError):
        return "[conteúdo não JSON omitido]"


def _safe_url(url):
    parts = urlsplit(url)
    hostname = parts.hostname or ""
    if parts.port:
        hostname = f"{hostname}:{parts.port}"
    return urlunsplit((parts.scheme, hostname, parts.path, "", ""))


def _save_coupon_network(driver, output_path):
    try:
        entries = driver.get_log("performance")
    except Exception:
        return None

    endpoint = os.getenv("COUPON_VALIDATE_PATH", "/api/v1/coupons/validate")
    requests = {}
    for entry in entries:
        try:
            event = json.loads(entry["message"])["message"]
            method = event["method"]
            params = event["params"]
        except (KeyError, TypeError, json.JSONDecodeError):
            continue

        request_id = params.get("requestId")
        if method == "Network.requestWillBeSent":
            request = params.get("request", {})
            if endpoint in request.get("url", ""):
                requests[request_id] = {
                    "request": {
                        "method": request.get("method"),
                        "url": _safe_url(request.get("url", "")),
                        "payload": _json_payload(request["postData"])
                        if request.get("postData")
                        else None,
                    },
                    "response": None,
                }
        elif request_id in requests and method == "Network.responseReceived":
            response = params.get("response", {})
            requests[request_id]["response"] = {
                "status": response.get("status"),
                "mime_type": response.get("mimeType"),
            }
        elif request_id in requests and method == "Network.loadingFinished":
            try:
                body = driver.execute_cdp_cmd(
                    "Network.getResponseBody", {"requestId": request_id}
                ).get("body")
                if body and requests[request_id]["response"] is not None:
                    requests[request_id]["response"]["payload"] = _json_payload(body)
            except Exception:
                pass

    if not requests:
        return None

    output_path.write_text(json.dumps(list(requests.values()), ensure_ascii=False, indent=2))
    return output_path.name


def _save_annotated_screenshot(driver, output_path, passed):
    try:
        from PIL import Image, ImageDraw

        fields = [
            (
                "Feedback",
                os.getenv(
                    "SEL_COUPON_SUCCESS" if passed else "SEL_COUPON_ERROR",
                    '[data-testid="coupon-success"]' if passed else '[data-testid="coupon-error"]',
                ),
            ),
            ("Subtotal", os.getenv("SEL_SUBTOTAL", '[data-testid="subtotal"]')),
            ("Desconto", os.getenv("SEL_DISCOUNT", '[data-testid="discount"]')),
            ("Total", os.getenv("SEL_TOTAL", '[data-testid="total"]')),
        ]
        boxes = driver.execute_script(
            """
            return arguments[0].map(([label, selector]) => {
                const element = document.querySelector(selector);
                if (!element || !element.getClientRects().length) return null;
                const rect = element.getBoundingClientRect();
                return {label, x: rect.x, y: rect.y, width: rect.width, height: rect.height};
            });
            """,
            fields,
        )
        image = Image.open(BytesIO(driver.get_screenshot_as_png())).convert("RGB")
        draw = ImageDraw.Draw(image)
        scale_x = image.width / driver.execute_script("return window.innerWidth")
        scale_y = image.height / driver.execute_script("return window.innerHeight")
        color = "#16803c" if passed else "#c62828"

        for box in boxes:
            if not box:
                continue
            left = int(box["x"] * scale_x)
            top = int(box["y"] * scale_y)
            right = int((box["x"] + box["width"]) * scale_x)
            bottom = int((box["y"] + box["height"]) * scale_y)
            draw.rectangle((left, top, right, bottom), outline=color, width=4)
            label_top = max(0, top - 20)
            draw.rectangle((left, label_top, left + 110, top), fill=color)
            draw.text((left + 4, label_top + 2), box["label"], fill="white")

        image.save(output_path)
        return output_path.name
    except Exception:
        try:
            driver.save_screenshot(str(output_path))
            return output_path.name
        except Exception:
            return None


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.when != "call":
        return

    evidence_dir = Path(os.getenv("EVIDENCE_DIR", "artifacts/evidence"))
    evidence_dir.mkdir(parents=True, exist_ok=True)
    case_marker = item.get_closest_marker("case_id")
    title_marker = item.get_closest_marker("case_title")
    case_id = case_marker.args[0] if case_marker else "SEM_ID"
    title = title_marker.args[0] if title_marker else item.name
    prefix = f"{_safe_name(case_id)}_{_safe_name(item.name)}"
    screenshot_name = None
    network_name = None
    browser_name = "Não disponível"
    browser_version = "Não disponível"

    driver = item.funcargs.get("driver")
    if driver:
        try:
            capabilities = driver.capabilities
            browser_name = capabilities.get("browserName", browser_name)
            browser_version = capabilities.get("browserVersion", browser_version)
            screenshot_name = _save_annotated_screenshot(
                driver,
                evidence_dir / f"{prefix}.png",
                report.passed,
            )
            network_name = _save_coupon_network(
                driver,
                evidence_dir / f"{prefix}_network.json",
            )
        except Exception:
            pass

    status = "PASSED (Aprovado)" if report.passed else "FAILED (Reprovado)"
    timestamp = datetime.now().astimezone().strftime("%d/%m/%Y - %H:%M:%S %Z")
    evidence = [
        "# Evidência de execução de teste",
        "",
        f"- **ID do Caso de Teste:** `{case_id}`",
        f"- **Título:** {title}",
        f"- **Data/Hora:** {timestamp}",
        f"- **Testador:** {os.getenv('TESTER_NAME', 'Não informado')}",
        f"- **Ambiente:** {os.getenv('TEST_ENV', 'Não informado')}",
        f"- **Navegador:** {browser_name} {browser_version}",
        f"- **Resultado Final:** {status}",
    ]
    if screenshot_name:
        evidence.extend(["", f"![Screenshot anotado]({screenshot_name})"])
    if network_name:
        evidence.extend(["", f"- **Evidência HTTP:** [{network_name}]({network_name})"])
    if report.failed:
        evidence.extend(["", "## Falha", "", "```text", report.longreprtext, "```"])

    (evidence_dir / f"{prefix}.md").write_text("\n".join(evidence) + "\n", encoding="utf-8")