# Build the "FIND TOP / [ROLE] / IN 10 MINS" white-tag lockup for every role in src/findTop.json
# → public/fig/k-ft-<role>.png, and write their aspect ratios to src/findTopHooks.json.
import json, subprocess, re, sys
roles = json.load(open("src/findTop.json"))
only = set(sys.argv[1:])
try:
    out = json.load(open("src/findTopHooks.json"))
except FileNotFoundError:
    out = {}
for k, r in roles.items():
    if only and k not in only:
        continue
    src = f"k-ft-{k}.png"
    res = subprocess.run(["python3", "tools/lettering.py", f"public/fig/{src}", "--hl", r["tag"], "--hlmode", "box",
                          "--tagcut", "NarrowBlackItalic", "--tagtrack", "0.02", "--sizes", "1.25,1,1.75",
                          "FIND TOP", r["tag"], "IN 10 MINS"], capture_output=True, text=True, check=True)
    h, w = map(int, re.search(r"ar (\d+)/(\d+)", res.stdout).groups())
    out[k] = {"src": src, "ar": h / w}
    print(k, src, f"{h}/{w}")
json.dump(out, open("src/findTopHooks.json", "w"), indent=1)
