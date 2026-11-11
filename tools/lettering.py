# Chrome headline lockup in the Figma "HIRE IN 10 MINS" style (kit/vector hire in 10 mins, 677:4303):
# Obviously Narrow Super Italic (matched at IoU 0.99), fill = the vector's linear gradient
# (white @0.167 → #999 @0.920, Figma gradientTransform row 0.4896u + 0.3871v − 0.0760).
# usage: python3 tools/lettering.py out.png [--sizes 1,1.6] [--num 5] LINE[|Cut] [LINE[|Cut]…]
#   default: every line is scaled to the full block width (justified stack)
#   --sizes: relative cap heights per line; the widest line fills the block, lines are centred
#   --num N: a big numeral N on the left, as tall as the whole (justified) stack beside it
#   LINE|Cut sets that line in another Obviously cut, e.g. "IN 10 MINS|WideBlackItalic"
#   --hl PHRASE --hlmode fill|box: highlight PHRASE (where it ends a line):
#     fill = warm accent gradient instead of chrome; box = dark text knocked out of a slanted white tag
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FD = os.path.expanduser("~/Library/Fonts/ObviouslyDemo-")
CUT = "NarrowSuperItalic"
W = 1600          # block width, px
GAP = 0.105       # line gap as a fraction of the average cap height (original: 35/331)
PAD = 6

HL = None   # list of phrases to highlight (--hl "A,B"); each may sit anywhere in a line
TAG_CUT = None   # --tagcut: cut for the text inside a box tag (black on white reads heavier, so go a weight lighter)
TAG_TRACK = 0.0  # --tagtrack: extra letter spacing inside the tag, in em
TAG_PH = 0.34    # tag side padding, in cap heights
def line_mask(spec, with_hl=False):
    import re
    text, cut = (spec.split("|") + [CUT])[:2]
    f = ImageFont.truetype(f"{FD}{cut}.otf", 800)
    l, t, r, b = f.getbbox(text)
    im = Image.new("L", (r - l + 40 + (1200 if HL else 0), b - t + 200), 0)
    hm = Image.new("L", im.size, 0)
    if HL and any(p in text for p in HL):
        # draw segment by segment so highlighted phrases get their own mask
        segs = [x for x in re.split("(" + "|".join(re.escape(p) for p in HL) + ")", text) if x]
        x = 20 - l
        tf = ImageFont.truetype(f"{FD}{TAG_CUT}.otf", 800) if (mode == "box" and TAG_CUT) else f
        for seg in segs:
            hit = seg in HL
            if hit and mode == "box" and x > 20 - l:
                x += 0.22 * 800   # breathing room before a tag
            if hit and mode == "box":
                # tag text: own cut, tracked out, baseline-matched to the line's cut
                dy = (f.getbbox("H")[1] - tf.getbbox("H")[1])
                for ch in seg:
                    ImageDraw.Draw(im).text((x, 20 - t + dy), ch, font=tf, fill=255)
                    ImageDraw.Draw(hm).text((x, 20 - t + dy), ch, font=tf, fill=255)
                    x += tf.getlength(ch) + TAG_TRACK * 800
                x -= TAG_TRACK * 800
                continue
            ImageDraw.Draw(im).text((x, 20 - t), seg, font=f, fill=255)
            if hit:
                ImageDraw.Draw(hm).text((x, 20 - t), seg, font=f, fill=255)
            x += f.getlength(seg)
    else:
        ImageDraw.Draw(im).text((20 - l, 20 - t), text, font=f, fill=255)
    a = np.array(im)
    ys, xs = np.where(a > 8)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    if mode == "box" and HL and text in HL:
        # a line that is all tag: widen its box by the tag padding so the tag (not the text) fills the block
        pad = round(TAG_PH * (box[3] - box[1]))
        box = (box[0] - pad, box[1], box[2] + pad, box[3])
    return (im.crop(box), hm.crop(box)) if with_hl else im.crop(box)

def stack(raw, width, sizes=None):
    if sizes is None:
        masks = [m.resize((width, round(m.height * width / m.width)), Image.LANCZOS) for m in raw]
    else:
        # scale line i to cap height sizes[i]·u, then pick u so the widest line is exactly `width`
        u = min(width * m.height / (m.width * s) for m, s in zip(raw, sizes))
        masks = [m.resize((round(m.width * s * u / m.height), round(s * u)), Image.LANCZOS) for m, s in zip(raw, sizes)]
    gap = round((GAP * 2.6 if HL and mode == "box" else GAP) * sum(m.height for m in masks) / len(masks))
    H = sum(m.height for m in masks) + gap * (len(masks) - 1)
    out = Image.new("L", (width, H), 0)
    y = 0
    for m in masks:
        out.paste(m, ((width - m.width) // 2, y))
        y += m.height + gap
    return out, gap

args = sys.argv[1:]
out = args.pop(0)
sizes = num = None
mode = "fill"
while args[0].startswith("--"):
    flag = args.pop(0)
    if flag == "--sizes":
        sizes = [float(x) for x in args.pop(0).split(",")]
    elif flag == "--num":
        num = args.pop(0)
    elif flag == "--hl":
        HL = args.pop(0).split(",")
    elif flag == "--hlmode":
        mode = args.pop(0)
    elif flag == "--tagcut":
        TAG_CUT = args.pop(0)
    elif flag == "--tagtrack":
        TAG_TRACK = float(args.pop(0))
raw = [line_mask(t) for t in args]
hlblock = None
if num is None:
    block, _ = stack(raw, W, sizes)
    if HL:
        # same layout, highlight-only masks
        hraw = [line_mask(t, True)[1] for t in args]
        hraw = [h.resize(m.size) if h.size != m.size else h for h, m in zip(hraw, raw)]
        hlblock, _ = stack(hraw, W, sizes)
else:
    # numeral height = stack height, which depends on the stack width: solve by iterating
    nm = line_mask(num)
    nw = 0
    for _ in range(8):
        sw = W - nw
        st, gap = stack(raw, sw, sizes)
        nw = round(nm.width * st.height / nm.height) + gap
    block = Image.new("L", (W, st.height), 0)
    block.paste(nm.resize((nw - gap, st.height), Image.LANCZOS), (0, 0))
    block.paste(st, (nw, 0))
P = PAD if not (HL and mode == "box") else 40   # room for the tag's padding
alpha = Image.new("L", (block.width + 2 * P, block.height + 2 * P), 0)
alpha.paste(block, (P, P))
hla = Image.new("L", alpha.size, 0)
if hlblock is not None:
    hla.paste(hlblock, (P, P))

w, h = alpha.size
u, v = np.meshgrid(np.arange(w) / (w - 1), np.arange(h) / (h - 1))
t = 0.4896039 * u + 0.3871143 * v - 0.0760249
k = np.clip((t - 0.16706) / (0.92014 - 0.16706), 0, 1)
g = 255 * (1 - 0.4 * k)
A = np.array(alpha).astype(float) / 255
Hm = np.array(hla).astype(float) / 255
rgb = np.dstack([g, g, g])
if HL and mode == "fill":
    # warm accent, light at the top of the letters → deeper at the bottom
    ys, xs = np.where(Hm > 0.05)
    vv = np.clip((np.arange(h)[:, None] - ys.min()) / max(1, ys.max() - ys.min()), 0, 1) * np.ones((1, w))
    acc = np.dstack([255 - 0 * vv, 226 - 36 * vv, 92 - 70 * vv])
    rgb = rgb * (1 - Hm[..., None]) + acc * Hm[..., None]
elif HL and mode == "box":
    # slanted white tag behind the phrase (italic slant), phrase knocked out in near-black
    ys, xs = np.where(Hm > 0.05)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    ph, pv, sl = TAG_PH * (y1 - y0), 0.26 * (y1 - y0), 0.2   # padding h/v, slant (dx per dy)
    yy, xx = np.mgrid[0:h, 0:w]
    off = (y1 + pv - yy) * sl                                # shift right as we go up
    inside = (yy >= y0 - pv) & (yy <= y1 + pv) & (xx >= x0 - ph + off - (y1 - y0) * sl * 0.5) & (xx <= x1 + ph + off - (y1 - y0) * sl * 0.5)
    from PIL import ImageFilter
    boxm = np.array(Image.fromarray((inside * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(float) / 255
    tag = np.full((h, w, 3), 250.0)   # flat white
    ink = np.array([17, 17, 19.0])
    inner = tag * (1 - Hm[..., None]) + ink * Hm[..., None]
    rgb = rgb * (1 - boxm[..., None]) + inner * boxm[..., None]
    A = np.maximum(A * (1 - boxm), boxm)
Image.fromarray(np.dstack([rgb, A * 255]).clip(0, 255).astype(np.uint8)).save(out)
print(out, alpha.size, "ar", f"{h}/{w}")
