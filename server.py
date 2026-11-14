#!/usr/bin/env python3
"""
Local Community Survey server + Google Sheets bridge.
Serves static survey files and handles POST /api/submit by appending rows
to the Google Sheet via the authenticated `gsheets` CLI.
"""

import json
import os
import shutil
import subprocess
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

SPREADSHEET_ID = "10eZNThH_XgvGglH67HU90uPT7pHbhv-yZ6N2ql5hIm8"
SHEET_RANGE = "Responses!A1"
GSHEETS_BIN = shutil.which("gsheets") or os.path.expanduser("~/.gemini/antigravity/bin/gsheets")
PORT = int(os.environ.get("PORT", "8080"))


def format_val(val):
    if isinstance(val, list):
        return ", ".join(str(v) for v in val)
    if val is None:
        return ""
    return str(val)


def build_row(payload):
    answers = payload.get("answers") or {}
    other_details = payload.get("otherDetails") or {}

    other_entries = " | ".join(
        f"{k}: {v.strip()}"
        for k, v in other_details.items()
        if isinstance(v, str) and v.strip()
    )

    return [
        payload.get("submittedAt", ""),
        format_val(answers.get("age_range")),
        format_val(answers.get("gender")),
        format_val(answers.get("ethnicity")),
        format_val(answers.get("city")),
        format_val(answers.get("household_type")),
        format_val(answers.get("has_children")),
        format_val(answers.get("children_ages")),
        format_val(answers.get("attended_past_year")),
        format_val(answers.get("attended_program_types")),
        format_val(answers.get("satisfaction_rating")),
        format_val(answers.get("stopped_attending_reasons")),
        format_val(answers.get("biggest_challenges")),
        format_val(answers.get("unspoken_issues")),
        format_val(answers.get("support_comfort")),
        format_val(answers.get("desired_programs")),
        format_val(answers.get("youth_topics")),
        format_val(answers.get("adult_topics")),
        format_val(answers.get("best_times")),
        format_val(answers.get("preferred_format")),
        format_val(answers.get("travel_distance")),
        format_val(answers.get("one_wish")),
        format_val(answers.get("volunteer_interest")),
        format_val(answers.get("volunteer_areas")),
        format_val(answers.get("email")),
        other_entries,
    ]


class SurveyHandler(SimpleHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_POST(self):
        if self.path != "/api/submit":
            self.send_error(404, "Not found")
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw or "{}")
            row = build_row(payload)

            batch_ops = [{"op": "append", "range": SHEET_RANGE, "data": [row]}]
            with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as tmp:
                json.dump(batch_ops, tmp)
                tmp_path = tmp.name

            try:
                proc = subprocess.run(
                    [GSHEETS_BIN, "mutate", "batch", SPREADSHEET_ID, "-f", tmp_path],
                    capture_output=True,
                    text=True,
                    timeout=30,
                )
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

            if proc.returncode != 0:
                raise RuntimeError(proc.stderr.strip() or proc.stdout.strip() or "gsheets failed")

            body = json.dumps({"status": "success"}).encode("utf-8")
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as exc:
            body = json.dumps({"status": "error", "message": str(exc)}).encode("utf-8")
            self.send_response(500)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = ThreadingHTTPServer(("127.0.0.1", PORT), SurveyHandler)
    print(f"Community Survey server running at http://localhost:{PORT}")
    server.serve_forever()
