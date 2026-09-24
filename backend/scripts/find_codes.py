import httpx, os
from dotenv import load_dotenv
load_dotenv()
key = os.environ['YANDEX_RASP_API_KEY']
print('Скачиваю stations_list...')
r = httpx.get('https://api.rasp.yandex.net/v3.0/stations_list/',
              params={'apikey': key, 'format': 'json', 'lang': 'ru_RU'},
              timeout=180)
data = r.json()
for c in data['countries']:
    if 'осси' not in c['title']:
        continue
    for reg in c['regions']:
        for sett in reg['settlements']:
            for st in sett.get('stations', []):
                if st.get('transport_type') != 'suburban':
                    continue
                t = st.get('title', '')
                if 'павелец' in t.lower() or 'коломенск' in t.lower():
                    print(t, '->', st['codes']['yandex_code'])
