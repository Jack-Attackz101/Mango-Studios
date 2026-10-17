#!/usr/bin/env python3
"""Print the private outreach payload as JSON on stdout.

Usage:
  python3 scripts/build-outreach-data.py path/to/outreach-log.csv [posted-dir]

The CSV needs a header row. Recognized columns (any common spelling):
  date_et, company, email, name, line, status, reply, type, channel, url, message
Rows whose channel or type is dm / inmail go into dms. Every other row is an email.
Status values that start with "followup" are follow-ups; values that start with
"replied" count as replies. line is sites, automations, or agents.

posted-dir is optional. Each posted-YYYY-MM-DD*.txt file is one LinkedIn post.
A line that is only a URL, or a url:/link: line, becomes the post link. The rest
is the post text. A JSON object or array in the file is accepted too.
dm-YYYY-MM-DD*.txt, dm-*.json, and dms.csv in that directory are direct messages.

Stdout is one JSON object: {"updated", "emails", "posts", "dms"}.
This script does not write any file. Put the JSON in the OUTREACH_DATA_B64
env var (base64). The password lives in OUTREACH_PASSWORD. Example:

  python3 scripts/build-outreach-data.py log.csv posted | base64 | tr -d '\\n'
"""
import csv
import glob
import json
import os
import re
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

ALIASES = {
    'date': ('dateet', 'date', 'sentat', 'timestamp'),
    'company': ('company', 'companyname', 'business', 'businessname', 'organization', 'organisation'),
    'email': ('email', 'contactemail', 'emailaddress'),
    'name': ('name', 'contactname', 'fullname'),
    'line': ('line', 'serviceline', 'service'),
    'type': ('type', 'emailtype'),
    'status': ('status',),
    'reply': ('reply', 'replytext', 'response', 'responsetext'),
    'channel': ('channel', 'medium', 'via', 'recordtype'),
    'url': ('url', 'link', 'linkedinurl', 'posturl', 'profileurl'),
    'message': ('message', 'body', 'dm'),
}
DM_KINDS = {'dm', 'dms', 'inmail', 'linkedindm', 'linkedin-dm', 'message'}
URL_RE = re.compile(r'https?://\S+', re.I)


def die(msg):
    sys.stderr.write(msg.rstrip() + '\n')
    sys.exit(2)


def norm(key):
    return re.sub(r'[^a-z0-9]', '', (key or '').lower())


def index_row(row):
    indexed = {}
    for key, value in row.items():
        if not key:
            continue
        indexed.setdefault(norm(key), (key, str(value or '').strip()))
    return indexed


def take(indexed, field):
    for alias in ALIASES[field]:
        found = indexed.pop(alias, None)
        if found:
            return found[1]
    return ''


def leftover(indexed):
    extra = {}
    for key, value in indexed.values():
        if value != '':
            extra[key] = value
    return extra


def split_when(value):
    raw = (value or '').strip()
    if not raw:
        return '', ''
    if 'T' in raw and ' ' not in raw.split('T', 1)[0]:
        day, rest = raw.split('T', 1)
        return day[:10], rest.strip()
    parts = raw.split(' ', 1)
    return parts[0], parts[1].strip() if len(parts) > 1 else ''


def canon_line(value):
    raw = (value or '').strip()
    compact = re.sub(r'[^a-z]', '', raw.lower())
    if not compact:
        return ''
    if 'autom' in compact:
        return 'automations'
    if 'agent' in compact:
        return 'agents'
    if 'site' in compact or compact in ('apps', 'app'):
        return 'sites'
    return raw


def classify(status, explicit):
    label = (explicit or '').strip()
    if label:
        compact = re.sub(r'[\s_]+', '-', label.lower())
        if compact in ('follow-up', 'followup'):
            return 'follow-up'
        if compact == 'new':
            return 'new'
        return label
    state = (status or '').lower()
    if state.startswith('followup') or state.startswith('follow-up') or state.startswith('follow_up'):
        return 'follow-up'
    return 'new'


def is_dm(channel, explicit_type):
    for value in (channel, explicit_type):
        compact = re.sub(r'[\s_]+', '', (value or '').lower())
        if compact in DM_KINDS or compact.replace('-', '') in DM_KINDS:
            return True
    return False


def record_from_row(row, force_dm=False):
    indexed = index_row(row)
    day, time = split_when(take(indexed, 'date'))
    company = take(indexed, 'company')
    email = take(indexed, 'email')
    name = take(indexed, 'name')
    line = canon_line(take(indexed, 'line'))
    status = take(indexed, 'status')
    reply = take(indexed, 'reply')
    explicit = take(indexed, 'type')
    channel = take(indexed, 'channel')
    url = take(indexed, 'url')
    message = take(indexed, 'message')
    extra = leftover(indexed)
    if force_dm or is_dm(channel, explicit):
        item = {
            'date': day,
            'time': time,
            'company': company,
            'email': email,
            'name': name,
            'status': status,
            'message': message or reply,
            'url': url,
        }
    else:
        item = {
            'date': day,
            'time': time,
            'company': company,
            'email': email,
            'name': name,
            'line': line,
            'type': classify(status, explicit),
            'status': status,
            'reply': reply,
        }
        if url:
            item['url'] = url
    for key, value in extra.items():
        item.setdefault(key, value)
    return ('dms' if force_dm or is_dm(channel, explicit) else 'emails'), item


def read_csv(path):
    try:
        handle = open(path, newline='', encoding='utf-8-sig')
    except OSError as err:
        die('cannot read %s: %s' % (path, err))
    with handle:
        try:
            reader = csv.DictReader(handle)
            names = [name for name in (reader.fieldnames or []) if name]
            if not names:
                die('log has no header row: %s' % path)
            rows = list(reader)
        except csv.Error as err:
            die('could not parse %s: %s' % (path, err))
    return names, rows


def date_in_name(path):
    match = re.search(r'(\d{4}-\d{2}-\d{2})', os.path.basename(path))
    return match.group(1) if match else ''


def first_url(text):
    match = URL_RE.search(text or '')
    if not match:
        return ''
    return match.group(0).rstrip(').,;\'"')


def post_from_obj(obj, fallback_date):
    day, _time = split_when(str(obj.get('date') or obj.get('date_et') or ''))
    item = {
        'date': day or fallback_date,
        'url': str(obj.get('url') or obj.get('link') or '').strip(),
        'text': str(obj.get('text') or obj.get('body') or obj.get('message') or '').strip(),
    }
    for key, value in obj.items():
        if key in ('date', 'date_et', 'url', 'link', 'text', 'body', 'message') or value in ('', None):
            continue
        item.setdefault(str(key), value)
    return item


def read_text(path):
    try:
        with open(path, encoding='utf-8', errors='replace') as handle:
            return handle.read().strip()
    except OSError as err:
        die('cannot read %s: %s' % (path, err))


def posts_from_file(path):
    fallback = date_in_name(path)
    raw = read_text(path)
    if not raw:
        return [{'date': fallback, 'url': '', 'text': ''}] if fallback else []
    if raw[0] in '[{':
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = None
        if isinstance(parsed, dict):
            return [post_from_obj(parsed, fallback)]
        if isinstance(parsed, list):
            posts = [post_from_obj(item, fallback) for item in parsed if isinstance(item, dict)]
            if posts:
                return posts
    url = ''
    kept = []
    for line in raw.splitlines():
        stripped = line.strip()
        labeled = re.match(r'^(?:url|link)\s*[:=]\s*(\S+)\s*$', stripped, re.I)
        if labeled and not url:
            url = labeled.group(1)
            continue
        if not url and re.match(r'https?://\S+$', stripped, re.I):
            url = stripped
            continue
        kept.append(line)
    text = '\n'.join(kept).strip()
    if not url:
        url = first_url(text)
    if not fallback and not text and not url:
        return []
    return [{'date': fallback, 'url': url, 'text': text}]


def dm_from_text(path):
    fallback = date_in_name(path)
    raw = read_text(path)
    if raw.startswith('{'):
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = None
        if isinstance(parsed, dict):
            kind, item = record_from_row(parsed, force_dm=True)
            if not item['date']:
                item['date'] = fallback
            return item
    fields = {'date': fallback, 'message': []}
    message = []
    for line in raw.splitlines():
        stripped = line.strip()
        labeled = re.match(r'^(date|company|email|name|status|url|link)\s*[:=]\s*(.*)$', stripped, re.I)
        if labeled and not message:
            key = labeled.group(1).lower()
            value = labeled.group(2).strip()
            if key == 'date':
                fields['date'] = split_when(value)[0] or fallback
            elif key == 'link':
                fields['url'] = value
            else:
                fields[key] = value
            continue
        message.append(line)
    text = '\n'.join(message).strip()
    url = fields.get('url') or first_url(text)
    return {
        'date': fields.get('date') or fallback,
        'time': '',
        'company': fields.get('company', ''),
        'email': fields.get('email', ''),
        'name': fields.get('name', ''),
        'status': fields.get('status', ''),
        'message': text,
        'url': url,
    }


def load_posts(posted_dir):
    posts = []
    paths = sorted(glob.glob(os.path.join(posted_dir, 'posted-*.txt')))
    for path in paths:
        if not date_in_name(path):
            sys.stderr.write('skipping %s (no YYYY-MM-DD in the name)\n' % os.path.basename(path))
            continue
        posts.extend(posts_from_file(path))
    posts.sort(key=lambda item: (item.get('date') or '', item.get('url') or '', item.get('text') or ''))
    return posts


def load_dm_files(posted_dir):
    dms = []
    paths = sorted(glob.glob(os.path.join(posted_dir, 'dm-*.txt')))
    paths += sorted(glob.glob(os.path.join(posted_dir, 'dm-*.json')))
    for path in paths:
        dms.append(dm_from_text(path))
    csv_path = os.path.join(posted_dir, 'dms.csv')
    if os.path.isfile(csv_path):
        _names, rows = read_csv(csv_path)
        for row in rows:
            _kind, item = record_from_row(row, force_dm=True)
            dms.append(item)
    return dms


def main():
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        die('usage: python3 scripts/build-outreach-data.py outreach-log.csv [posted-dir]')
    log_path = sys.argv[1]
    posted_dir = sys.argv[2] if len(sys.argv) == 3 else None
    if not os.path.isfile(log_path):
        die('log not found: %s' % log_path)
    if posted_dir is not None and not os.path.isdir(posted_dir):
        die('posted dir not found: %s' % posted_dir)

    names, rows = read_csv(log_path)
    sys.stderr.write('log columns: %s\n' % ', '.join(names))
    known = {alias for aliases in ALIASES.values() for alias in aliases}
    if not any(norm(name) in known for name in names):
        die('log header did not match any known columns')

    emails = []
    dms = []
    for row in rows:
        if not any((value or '').strip() for value in row.values() if value is not None):
            continue
        kind, item = record_from_row(row)
        (dms if kind == 'dms' else emails).append(item)
    if posted_dir:
        dms.extend(load_dm_files(posted_dir))
    posts = load_posts(posted_dir) if posted_dir else []

    emails.sort(key=lambda item: (item.get('date') or '', item.get('time') or ''))
    dms.sort(key=lambda item: (item.get('date') or '', item.get('time') or ''))
    updated = datetime.now(ZoneInfo('America/New_York')).date().isoformat()
    payload = {'updated': updated, 'emails': emails, 'posts': posts, 'dms': dms}
    sys.stdout.write(json.dumps(payload, ensure_ascii=False, separators=(',', ':')))
    sys.stdout.write('\n')
    sys.stderr.write('emails %d, posts %d, dms %d, updated %s\n' % (len(emails), len(posts), len(dms), updated))


if __name__ == '__main__':
    main()
