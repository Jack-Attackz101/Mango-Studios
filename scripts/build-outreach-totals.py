#!/usr/bin/env python3
"""Regenerate outreach/totals.json from the private outreach log.
Usage: python3 scripts/build-outreach-totals.py path/to/outreach-log.csv [posted-dir]
Only daily counts are written: no names, emails, or reply text."""
import csv, json, sys, glob, os, collections
log = sys.argv[1]; posted = sys.argv[2] if len(sys.argv) > 2 else None
days = collections.defaultdict(lambda: dict(new=0, followup=0, replies=0, posts=0, sites=0, automations=0, agents=0))
for r in csv.DictReader(open(log)):
    date = r['date_et'].split(' ')[0]; st = r['status']; x = days[date]
    x['followup' if st.startswith('followup') else 'new'] += 1
    if r['line'] in ('sites', 'automations', 'agents'): x[r['line']] += 1
    if st.startswith('replied'): x['replies'] += 1
if posted:
    for f in glob.glob(os.path.join(posted, 'posted-*.txt')):
        days[os.path.basename(f)[7:17]]['posts'] += 1
out = {'days': [dict(date=k, **v) for k, v in sorted(days.items())]}
json.dump(out, open(os.path.join(os.path.dirname(__file__), '..', 'outreach', 'totals.json'), 'w'), indent=1)
print('wrote', len(out['days']), 'days')
