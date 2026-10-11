"""Fillable Parent-Teen Driving Agreement (DRVN). US Letter, AcroForm fields."""
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
import sys

# Usage: python3 scripts/agreement_pdf.py public/downloads/drvn-parent-teen-driving-agreement.pdf logo.png
OUT = sys.argv[1]
LOGO = sys.argv[2]  # PNG of the DRVN wordmark
BLUE = HexColor('#0A6CA5'); CYAN = HexColor('#41B6E5'); INK = HexColor('#212529')
INK3 = HexColor('#45535E'); LINE = HexColor('#C9D6E3'); TINT = HexColor('#EEF6FB'); GREEN = HexColor('#86B404')
W, H = letter
M = 50
c = canvas.Canvas(OUT, pagesize=letter)
c.setTitle('Parent-Teen Driving Agreement — DRVN')
c.setAuthor('DRVN, LLC')
form = c.acroForm
y = H
fid = [0]


def name(p):
    fid[0] += 1
    return f'{p}_{fid[0]}'


def footer(n):
    c.setFont('Helvetica', 8); c.setFillColor(INK3)
    c.drawString(M, 28, 'DRVN parent-teen driving agreement  ·  drvnapp.com')
    c.drawRightString(W - M, 28, f'Page {n} of 2')
    c.setFont('Helvetica', 7)
    c.drawString(M, 18, 'Educational tool, not a legal document. Your state’s licensing rules come first: check your state guide at drvnapp.com/guide.')


def text_field(label, x, yy, w, h=18, nm='f', tip=None, size=10):
    if label:
        c.setFont('Helvetica', 8); c.setFillColor(INK3); c.drawString(x, yy + h + 3, label)
    form.textfield(name=name(nm), tooltip=tip or label or nm, x=x, y=yy, width=w, height=h,
                   borderWidth=0.6, borderColor=LINE, fillColor=white, textColor=INK, fontName='Helvetica', fontSize=size, forceBorder=True)


def check(label, x, yy, nm='c'):
    form.checkbox(name=name(nm), tooltip=label, x=x, y=yy - 2, size=11, borderWidth=0.6, borderColor=BLUE,
                  fillColor=white, buttonStyle='check', forceBorder=True)
    c.setFont('Helvetica', 9.5); c.setFillColor(INK); c.drawString(x + 16, yy, label)


def section(title, sub=None):
    global y
    y -= 26
    c.setFillColor(BLUE); c.setFont('Helvetica-Bold', 12.5); c.drawString(M, y, title)
    if sub:
        y -= 14; c.setFont('Helvetica', 9); c.setFillColor(INK3); c.drawString(M, y, sub)
    y -= 8


def para(t, size=9.5, color=INK, font='Helvetica', lead=13, width=None):
    global y
    from reportlab.lib.utils import simpleSplit
    lines = simpleSplit(t, font, size, width or (W - 2 * M))
    c.setFont(font, size); c.setFillColor(color)
    for ln in lines:
        y -= lead; c.drawString(M, y, ln)


# ---------- Page 1 ----------
c.drawImage(LOGO, M, H - 70, height=30, width=30 * 684 / 240, mask='auto')
c.setFillColor(GREEN); c.rect(M, H - 82, 46, 3, stroke=0, fill=1)
y = H - 112
c.setFillColor(INK); c.setFont('Helvetica-Bold', 22); c.drawString(M, y, 'Parent-Teen Driving Agreement')
y -= 6
para('Decide the rules before anyone has the keys. Fill this in together, sign it, and put a date on it to review. '
     'Your state’s rules are the minimum; this is where your family can go further.', size=10, color=INK3, lead=14)

y -= 44
colw = (W - 2 * M - 20) / 3
text_field('Teen driver', M, y, colw, nm='teen')
text_field('Parent or guardian', M + colw + 10, y, colw, nm='parent1')
text_field('Parent or guardian', M + 2 * (colw + 10), y, colw, nm='parent2')
y -= 36
text_field('Date of this agreement', M, y, colw, nm='date')
text_field('License date', M + colw + 10, y, colw, nm='licdate')
text_field('We’ll review this on', M + 2 * (colw + 10), y, colw, nm='review')

# Two rules box
y -= 22
box_top = y
c.setFillColor(TINT); c.roundRect(M, y - 96, W - 2 * M, 96, 8, stroke=0, fill=1)
c.setFillColor(CYAN); c.rect(M, y - 96, 4, 96, stroke=0, fill=1)
y -= 20
c.setFillColor(BLUE); c.setFont('Helvetica-Bold', 12.5); c.drawString(M + 16, y, 'Two rules with no exceptions')
y -= 22
c.setFont('Helvetica-Bold', 10); c.setFillColor(INK)
c.drawString(M + 16, y, '1.  Everyone buckles, every trip. The car doesn’t move until they do.')
text_field('', W - M - 120, y - 5, 50, h=16, nm='init_belt', tip='Teen initials'); text_field('', W - M - 64, y - 5, 50, h=16, nm='init_belt_p', tip='Parent initials')
y -= 26
c.setFont('Helvetica-Bold', 10); c.setFillColor(INK)
c.drawString(M + 16, y, '2.  I can always call for a safe ride home. No questions that night.')
text_field('', W - M - 120, y - 5, 50, h=16, nm='init_ride', tip='Teen initials'); text_field('', W - M - 64, y - 5, 50, h=16, nm='init_ride_p', tip='Parent initials')
c.setFont('Helvetica', 7.5); c.setFillColor(INK3)
c.drawString(W - M - 116, box_top - 16, 'Teen'); c.drawString(W - M - 60, box_top - 16, 'Parent')
y -= 16
c.setFont('Helvetica', 8.5); c.setFillColor(INK3)
c.drawString(M + 16, y, 'Code word or text that means “come get me, and tell my friends I have to go home”:')
text_field('', M + 360, y - 5, W - 2 * M - 376, h=16, nm='codeword', tip='Code word')
y = box_top - 96

section('Phones', 'The phone doesn’t get attention while the car is moving.')
check('Driving focus / do-not-disturb turns on automatically in the car', M, y - 4); y -= 18
check('Navigation and music are set before the car moves', M, y - 4); y -= 18
check('If something needs the phone, I pull over and stop first', M, y - 4); y -= 18
check('Parents follow the same rule when they drive', M, y - 4); y -= 6

section('Passengers', 'Fill in the dates. Each step starts only after the last one has been uneventful.')
rows = [('No teen passengers (siblings only if agreed)', 'pass1'), ('One teen passenger, daytime', 'pass2'),
        ('One teen passenger after dark', 'pass3'), ('Two or more teen passengers', 'pass4')]
for lbl, nm in rows:
    y -= 22
    c.setFont('Helvetica', 9.5); c.setFillColor(INK); c.drawString(M, y + 4, lbl)
    c.setFont('Helvetica', 8); c.setFillColor(INK3); c.drawString(M + 280, y + 4, 'from')
    text_field('', M + 304, y - 1, 90, h=16, nm=nm + 'a', tip=lbl + ' from')
    c.drawString(M + 402, y + 4, 'until')
    text_field('', M + 424, y - 1, W - 2 * M - 424, h=16, nm=nm + 'b', tip=lbl + ' until')

section('Night driving', 'CDC suggests home by 9 or 10 p.m. for at least the first six months.')
y -= 20
c.setFont('Helvetica', 9.5); c.setFillColor(INK); c.drawString(M, y + 4, 'Home by')
text_field('', M + 46, y - 1, 70, h=16, nm='curfew1', tip='Home by (time)')
c.drawString(M + 124, y + 4, 'on school nights and')
text_field('', M + 222, y - 1, 70, h=16, nm='curfew2', tip='Home by on weekends')
c.drawString(M + 300, y + 4, 'on weekends, until')
text_field('', M + 392, y - 1, W - 2 * M - 392, h=16, nm='curfew_until', tip='Curfew until (date)')
y -= 22
c.drawString(M, y + 4, 'Then:')
text_field('', M + 36, y - 1, W - 2 * M - 36, h=16, nm='curfew_then', tip='Curfew after that')
footer(1)
c.showPage()

# ---------- Page 2 ----------
y = H - 40
section('Where I can drive alone', 'Check what’s OK now. Add more as experience builds.')
opts = ['School and back', 'Work and back', 'Practices and activities', 'Friends’ homes in town', 'Errands in town',
        'Highway (familiar stretch)', 'Highway (new route)', 'Out of town: ask first', 'Long trips: ask first']
colx = [M, M + 175, M + 350]
for i, o in enumerate(opts):
    if i % 3 == 0:
        y -= 18
    check(o, colx[i % 3], y)
y -= 40
text_field('Other places, or places that are off limits', M, y, W - 2 * M, nm='places_other')
y -= 8

section('Weather and conditions')
check('No solo driving in heavy snow, ice or fog without asking first', M, y - 4); y -= 18
check('We practice rain, snow and night driving together before I do them alone', M, y - 4); y -= 18
check('If conditions feel beyond me, I can wait, call, or pull over somewhere safe', M, y - 4); y -= 6

section('Check-ins')
check('Text when I arrive and when I leave', M, y - 4); y -= 18
check('Call if plans or passengers change', M, y - 4); y -= 18
check('Tell my parents about close calls, without getting in trouble for telling', M, y - 4); y -= 6

section('The car')
half = (W - 2 * M - 10) / 2
y -= 24
text_field('Who pays for gas', M, y, half, nm='gas'); text_field('Who pays for tickets or damage', M + half + 10, y, half, nm='damage')
y -= 36
text_field('Who else may drive the car', M, y, half, nm='others'); text_field('Upkeep I’m responsible for', M + half + 10, y, half, nm='upkeep')
y -= 8

section('If a rule is broken', 'Agree on this now, while nobody is upset.')
y -= 40
form.textfield(name=name('consequence'), tooltip='What happens if a rule is broken', x=M, y=y, width=W - 2 * M, height=40,
               borderWidth=0.6, borderColor=LINE, fillColor=white, textColor=INK, fontName='Helvetica', fontSize=10,
               fieldFlags='multiline', forceBorder=True)
y -= 6

section('What parents agree to')
for t in ['Keep riding along for the hard drives (first heavy rain, first snow, new highways) for a while after the license',
          'Follow the phone and seat belt rules ourselves',
          'Pick you up, no questions that night, whenever you call',
          'Review this agreement on the date above and loosen it as you show you’re ready']:
    check(t, M, y - 4); y -= 18
y -= 4

y -= 30
q = (W - 2 * M - 30) / 4
text_field('Teen signature', M, y, q * 2 + 10, nm='sig_teen'); text_field('Date', M + 2 * q + 20, y, q * 2 + 10, nm='sig_teen_date')
y -= 38
text_field('Parent signature', M, y, q * 2 + 10, nm='sig_parent'); text_field('Date', M + 2 * q + 20, y, q * 2 + 10, nm='sig_parent_date')
footer(2)
c.save()
print('ok', y)
